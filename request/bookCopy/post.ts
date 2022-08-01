import axios, { AxiosResponse } from 'axios';
import { NextApiResponse } from 'next';

import { API, EJEMPLAR } from 'general';
import { logRequestError, setErrorResponse, setSuccessResponse } from 'request';

import { BookCopyRequest, BookCopyRequestBody, BookCopyRequestResponse } from './type';

// ********************************************************************************
// == Request =====================================================================
export const postBookCopy = async (bookCopyRequestBody: BookCopyRequestBody) => {
  try {
    const { data: requestedBookCopy } = await axios.post<BookCopyRequestResponse, AxiosResponse<BookCopyRequestResponse>, BookCopyRequestBody>(`/${API}/${EJEMPLAR}/`, bookCopyRequestBody);
    return requestedBookCopy;
  } catch (error) {
    logRequestError(error, 'postBookCopy');    
  }
};

// == Handler =====================================================================
export const handleBookCopyPost = async (req: BookCopyRequest, res: NextApiResponse<BookCopyRequestResponse>) => {
  const { bookId, edition, pages, publisher, quantityInStock, priceMXN  } = req.body;
  if(!bookId || !edition || !pages || !publisher || !quantityInStock || !priceMXN) {
    setErrorResponse(res, 'Received wrong query params for BookCopy POST Request');
    return;
  }/* else -- valid values */

  const newBookCopy = await prisma.bookCopy.create({ data: { bookId, edition, pages, publisher, quantityInStock, priceMXN  }, include: { book: true } });
  setSuccessResponse(res, { requestedBookCopy: newBookCopy, requestedBookCopies: undefined/*none requested*/ });
};
