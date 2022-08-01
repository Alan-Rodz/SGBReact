import { NextApiResponse } from 'next';

import { userIsAdminOrSecretary } from 'general';
import { handleLibraryUserGet, handleLibraryUserPatch, setErrorResponse, setNonAllowedMethodResponse, verifyUserAuthAndAuthority, LibraryUserRequest, LibraryUserRequestResponse, setSuccessResponse, createMembershipSalePDF, isMembershipSaleRequestBody } from 'request';
import { RequestMethod } from 'type';

import { sendMembershipSaleConfirmationEmail } from './email';

// ********************************************************************************
// == Handler =====================================================================
const handleLibraryUserRequest = async (req: LibraryUserRequest, res: NextApiResponse<LibraryUserRequestResponse>) => {
  verifyUserAuthAndAuthority(req, res, userIsAdminOrSecretary);
  /* -- User is authed and has right authority, proceed -- */

  try {
    switch (req.method) {
      // NOTE: not in a specific handler since sending the email requires access
      //       to 'fs', which must be run (and hence imported) on the server
      // -- POST (Create LibraryUser from Membership Sale) ------------------------
      case (RequestMethod.POST): {
        if(!isMembershipSaleRequestBody(req.body)) {
          setErrorResponse(res, 'Received wrong query params for User POST Request (Membership Sale)');
          break;
        }/* else -- valid values */
      
        const { saleFields, libraryUserFields } = req.body;
        const { currentMembershipPrice, currentTaxRatePercentage, totalSalePrice, employeeId, employeeName, } = saleFields,
              newSale = await prisma.sale.create({ data: { price: totalSalePrice, employeeId } })
      
        const { membershipExpDate, libraryUserName, libraryUserEmail } = libraryUserFields,
              newLibraryUser = await prisma.libraryUser.create({ data: { membershipSaleId: newSale.id, membershipExpDate: new Date(membershipExpDate), name: libraryUserName, email: libraryUserEmail }});
      
        // -- Email ---------------------------------------------------------------
        sendMembershipSaleConfirmationEmail(libraryUserEmail, currentMembershipPrice, currentTaxRatePercentage, totalSalePrice);
      
        // -- PDF -----------------------------------------------------------------
        // .. Creation ............................................................
        const pdfDoc = createMembershipSalePDF(
          { employeeId, employeeName, libraryUserName, libraryUserEmail, membershipExpDate },
          {
            products: [{ productName: 'Membresía', price: currentMembershipPrice, quantity: 1/*by definition*/, totalProductPrice: totalSalePrice }],
            taxRatePercentage: currentTaxRatePercentage,
            totalSalePrice,
          },
        );
      
        // .. Upload ..............................................................
        const pdfDocArrayBuffer = pdfDoc.output('arraybuffer');
        const { data: pdfBucketKey, error: uploadError } = await supabase
          .storage
          .from(process.env.SUPABASE_BUCKET!/*must be set in env*/)
          .upload(`${newSale.id}.pdf`, pdfDocArrayBuffer, { 
            cacheControl: '300'/*valid for 5min, after that a new version has to be requested*/, 
            upsert: false/*do not perform update if file already exists*/ 
          });
        if(uploadError || !pdfBucketKey) {
          throw new Error(`Error while uploading PDF to Storage: ${uploadError}`);
        }/* else -- successful upload */
      
        // -- Update Sale ---------------------------------------------------------
        const updatedSale = await prisma.sale.update({ where: { id: newSale.id }, data: { pdfBucketRoute: pdfBucketKey.Key.split('/'/*remove name of bucket*/)[1]/*2nd element, name of the file*/ }  })
        setSuccessResponse(res, { requestedSale: updatedSale, requestedLibraryUser: newLibraryUser, requestedLibraryUsers: undefined/*none requested*/, salePDFJSONBuffer: undefined/*none requested*/ });
        break;
      }

      // -- GET (Get LibraryUser or MembershipSalePDF) ----------------------------
      case (RequestMethod.GET): {
        handleLibraryUserGet(req, res);
        break;
      }

      // -- PATCH (Update LibraryUser )--------------------------------------------
      case (RequestMethod.PATCH): {
        handleLibraryUserPatch(req, res);
        break;
      }

      // -- DEFAULT ---------------------------------------------------------------
      default:
        setNonAllowedMethodResponse(res, [RequestMethod.POST, RequestMethod.GET, RequestMethod.PATCH], req.method);
    }
  } catch (error) {
    setErrorResponse(res, `Something went wrong on API libraryUser call: (${req.method}) (${error}) `);
  }
}

export default handleLibraryUserRequest;
