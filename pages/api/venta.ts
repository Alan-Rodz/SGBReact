import { NextApiResponse } from 'next';

import { applyTaxRateToPrice, isValidEmail, userIsAdminOrSecretary, CREATED_AT_ORDER, NOT_AVAILABLE } from 'general';
import { createBookSalePDF, handleSaleGet, setErrorResponse, setNonAllowedMethodResponse, setSuccessResponse, verifyUserAuthAndAuthority, ProductInfo, SaleRequest, SaleRequestAnswer } from 'request';
import { RequestMethod } from 'type';

import { sendSaleConfirmationEmail } from './email';

// ********************************************************************************
const handleSaleRequest = async (req: SaleRequest, res: NextApiResponse<SaleRequestAnswer>) => {
  verifyUserAuthAndAuthority(req, res, userIsAdminOrSecretary);
  /* -- User is authed and has right authority, proceed -- */
 
  try {
    switch (req.method) {
      // NOTE: not in a specific handler since sending the email requires access
      //       to 'fs', which must be run (and hence imported) on the server
      // -- POST (Register a Sale) ------------------------------------------------
      case (RequestMethod.POST): {
        const { employeeId, clientEmail, bookSaleEntries } = req.body;
        if(!employeeId || !clientEmail || !isValidEmail(clientEmail) || !bookSaleEntries) {
          setErrorResponse(res, 'Received wrong body params for Sale POST Request');
          break;
        }/* else -- received products */
        const employee = await prisma.user.findUnique({ where: { id: employeeId }});
      
        // -- Save Sold Book Information ------------------------------------------
        const allTaxRates = await prisma.taxRate.findMany({ orderBy: { createdAt: CREATED_AT_ORDER } }),
              currentTaxRatePercentage = allTaxRates[0/*most recently registered taxRate*/].percentage;
        const newSale = await prisma.sale.create({ data: { employeeId, price: 0/*will be updated below*/ } });
      
        let totalSalePrice = 0;
        for(const bookSaleEntry of bookSaleEntries) {
          totalSalePrice += applyTaxRateToPrice(bookSaleEntry.bookCopy.priceMXN, currentTaxRatePercentage) * bookSaleEntry.quantity;
          await prisma.bookCopiesOnSale.create({ data: { saleId: newSale.id, bookCopyId: bookSaleEntry.bookCopy.id, quantity: bookSaleEntry.quantity } })
        }
        
        const products: ProductInfo[] = [];
        bookSaleEntries.forEach(entry => {
          const price = applyTaxRateToPrice(entry.bookCopy.priceMXN, currentTaxRatePercentage);
          products.push({
            productName: `${entry.book.name} - ${entry.bookCopy.edition}`, 
            price,
            quantity: entry.quantity,
            totalProductPrice: price * entry.quantity 
          });
        });
        
        // -- Email ---------------------------------------------------------------
        sendSaleConfirmationEmail(clientEmail, products, currentTaxRatePercentage, totalSalePrice);
      
        // -- PDF -----------------------------------------------------------------
        // .. Creation ............................................................
        const pdfDoc = createBookSalePDF(newSale.id, employeeId, employee?.name ?? NOT_AVAILABLE, { products, totalSalePrice, taxRatePercentage: currentTaxRatePercentage });
      
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
        const updatedSale = await prisma.sale.update({ where: { id: newSale.id }, data: { price: totalSalePrice, pdfBucketRoute: pdfBucketKey.Key.split('/'/*remove name of bucket*/)[1]/*2nd element, name of the file*/ }});
        setSuccessResponse(res, { 
          requestedSale: updatedSale, 
          requestedSales: undefined/*none requested*/,
          salePDFJSONBuffer: undefined/*none requested*/, 
          currentSaleInfo: undefined/*none requested*/, 
          bookCopy: undefined/*none requested*/, 
          bookCopies: undefined/*none requested*/ 
        });        
        break;
      }

      // -- GET (Get currentSaleInfo, saleInfo, or other info) --------------------
      case (RequestMethod.GET): {
        handleSaleGet(req, res);
        break;
      }

      // -- DEFAULT ---------------------------------------------------------------
      default:
        setNonAllowedMethodResponse(res, [RequestMethod.POST, RequestMethod.GET], req.method);
    }
  } catch (error) {
    setErrorResponse(res, `Something went wrong on API sale call: (${req.method}) (${error}) `);
  }
}

export default handleSaleRequest;
