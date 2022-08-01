import axios, { AxiosResponse } from 'axios';

import { computeBiggerThanPageIndex, pdfBlobToJSONBuffer, API, CREATED_AT_ORDER, LOOKUP_SIZE, PAGINATION_SIZE, VENTA } from 'general';
import { NextApiResponse } from 'next';
import { logRequestError, setErrorResponse, setSuccessResponse } from 'request';

import { SaleQueryParams, SaleRequest, SaleRequestAnswer } from '../type';

// ********************************************************************************
// == Request =====================================================================
export const performSaleGetRequest = async (params: SaleQueryParams | undefined) => {
  try {
    const { data: requestedSales } = await axios.get<SaleRequestAnswer, AxiosResponse<SaleRequestAnswer>/*no params given*/>(`/${API}/${VENTA}/`, { params });
    return requestedSales;
  } catch (error) {
    logRequestError(error, 'performSaleGetRequest');    
  }
};

// == Handler======================================================================
export const handleSaleGet = async (req: SaleRequest, res: NextApiResponse<SaleRequestAnswer>) => {
  const { saleIdStartsWith, requestedSalesPage, saleId, bookId, editionNameStartsWith, bookCopyId } = req.query;
  if(saleIdStartsWith) {
    const requestedSales = await prisma.sale.findMany( { where: { id: { startsWith: saleIdStartsWith } }, take: LOOKUP_SIZE });
    setSuccessResponse(res, { 
      requestedSale: undefined/*none requested*/,
      requestedSales,
      salePDFJSONBuffer: undefined/*none requested*/, 
      currentSaleInfo: undefined/*none requested*/, 
      bookCopy: undefined/*none requested*/, 
      bookCopies: undefined/*none requested*/,
    });
    return;

  } else if(requestedSalesPage) {
    const biggerThanIndex = computeBiggerThanPageIndex(Number(requestedSalesPage));
    const sales = await prisma.sale.findMany({ orderBy: { createdAt: CREATED_AT_ORDER } }),
          filteredSales = sales.filter((sale, index) => index > Number(biggerThanIndex)).slice(0, PAGINATION_SIZE/*get first N amount*/);
    setSuccessResponse(res, { 
      requestedSale: undefined/*none requested*/,
      requestedSales: filteredSales,
      salePDFJSONBuffer: undefined/*none requested*/, 
      currentSaleInfo: undefined/*none requested*/, 
      bookCopy: undefined/*none requested*/, 
      bookCopies: undefined/*none requested*/,
    });
    return;

  } else if(bookId && editionNameStartsWith) {
    const bookCopies = await prisma.bookCopy.findMany({ where: { bookId, edition: { startsWith: editionNameStartsWith } }, take: LOOKUP_SIZE });
    setSuccessResponse(res, { 
      requestedSale: undefined/*none requested*/,
      requestedSales: undefined/*none requested*/,
      salePDFJSONBuffer: undefined/*none requested*/, 
      currentSaleInfo: undefined/*none requested*/, 
      bookCopy: undefined/*none requested*/, 
      bookCopies 
    });
    return;
    
  } else if(bookCopyId) {
    const bookCopy = await prisma.bookCopy.findUnique({ where: { id: bookCopyId  }});
    if(!bookCopy) {
      setErrorResponse(res, `BookCopy no longer exists in BookCopy GET Request: (${bookCopy})`);
      return;
    }/*else -- bookCopy still exists, return it*/
    setSuccessResponse(res, { 
      requestedSale: undefined/*none requested*/, 
      requestedSales: undefined/*none requested*/,
      salePDFJSONBuffer: undefined/*none requested*/, 
      currentSaleInfo: undefined/*none requested*/, 
      bookCopy, 
      bookCopies: undefined/*none requested*/ 
    });
    return;

  } else if(saleId) {/*get a sale and its pdf*/
    const requestedSale = await prisma.sale.findUnique({ where: { id: saleId }});
    if(!requestedSale || !requestedSale.pdfBucketRoute) {
      setErrorResponse(res, `Sale does not exist or does not have a pdfBucketRoute: (${saleId})`);
      return;
    }/*else -- sale exists, get its PDF*/
    
    const { data: pdfBlob } = await supabase.storage.from(process.env.SUPABASE_BUCKET!/*must be set in env*/).download(requestedSale.pdfBucketRoute);
    if(!pdfBlob) {
      setErrorResponse(res, `PDF does not exist in bucket at route: ${requestedSale.pdfBucketRoute}`);
      return;
    }/* else -- pdfBlob exists */
    const pdfJSONBuffer = await pdfBlobToJSONBuffer(pdfBlob);

    setSuccessResponse(res, { 
      requestedSale, 
      requestedSales: undefined/*none requested*/,
      salePDFJSONBuffer: pdfJSONBuffer, 
      currentSaleInfo: undefined/*none requested*/, 
      bookCopy: undefined/*none requested*/, 
      bookCopies: undefined/*none requested*/,
    });
    return;
    
  } else {/*acquire current sale info*/
    const allMembershipPrices = await prisma.membershipPrice.findMany({ orderBy: { createdAt: CREATED_AT_ORDER } }),
          currentMembershipPrice = allMembershipPrices[0/*most recently registered membershipPrice*/].membershipPrice;

    const allTaxRates = await prisma.taxRate.findMany({ orderBy: { createdAt: CREATED_AT_ORDER } }),
          currentTaxRatePercentage = allTaxRates[0/*most recently registered taxRate*/].percentage;

    setSuccessResponse(res, { 
      requestedSale: undefined/*none requested*/, 
      requestedSales: undefined/*none requested*/,
      salePDFJSONBuffer: undefined/*none requested*/, 
      currentSaleInfo: { currentMembershipPrice, currentTaxRatePercentage }, 
      bookCopy: undefined/*none requested*/, 
      bookCopies: undefined/*none requested*/ 
    });
  }
};
