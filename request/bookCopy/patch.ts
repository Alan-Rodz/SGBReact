import axios, { AxiosResponse } from 'axios';
import { NextApiResponse } from 'next';

import { API, EJEMPLAR } from 'general';
import { logRequestError, setErrorResponse, setSuccessResponse } from 'request';

import { BookCopyRequest, BookCopyRequestBody, BookCopyRequestResponse } from './type';

// ********************************************************************************
// == Request =====================================================================
export const patchBookCopy = async (bookCopyRequestBody: BookCopyRequestBody) => {
  try {
    const { data: patchedBookCopy } = await axios.patch<BookCopyRequestResponse, AxiosResponse<BookCopyRequestResponse>, BookCopyRequestBody>(`/${API}/${EJEMPLAR}/`, bookCopyRequestBody);
    return patchedBookCopy;
  } catch (error) {
    logRequestError(error, 'patchBookCopy');    
  }
};

// == Handler =====================================================================
export const handleBookCopyPatch = async (req: BookCopyRequest, res: NextApiResponse<BookCopyRequestResponse>) => {
  const { id, edition, pages, publisher, quantityInStock, priceMXN  } = req.body;
  if(!edition || !pages || !publisher || !quantityInStock || !priceMXN) {
    setErrorResponse(res, 'Received wrong query params for BookCopy PATCH Request');
    return;
  }/* else -- valid values */

  const patchedBookCopy = await prisma.bookCopy.update( { where: { id }, data: { edition, pages, publisher, quantityInStock, priceMXN }, include: { book: true } });
  setSuccessResponse(res, { requestedBookCopy: patchedBookCopy, requestedBookCopies: undefined/*none requested*/ })
};
