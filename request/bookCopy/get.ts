import axios, { AxiosResponse } from 'axios';
import { NextApiResponse } from 'next';

import { computeBiggerThanPageIndex, API, CREATED_AT_ORDER, EJEMPLAR, LOOKUP_SIZE, PAGINATION_SIZE } from 'general';
import { logRequestError, setErrorResponse, setSuccessResponse } from 'request';

import { BookCopyRequest, BookCopyRequestResponse } from './type';

// ********************************************************************************
// == Interface ===================================================================
export interface BookCopyGetRequestParams {
  [key: string]: string;
  requestedBookCopyEditionNameStartsWith: string;
  requestedBookCopiesPage: string;
}

// == Request =====================================================================
export const getBookCopies = async (params: BookCopyGetRequestParams) => {
  try {
    const { data } = await axios.get<BookCopyRequestResponse, AxiosResponse<BookCopyRequestResponse>, BookCopyGetRequestParams>(`/${API}/${EJEMPLAR}/`, { params });
    return data;
  } catch (error) {
    logRequestError(error, 'getBookCopies');    
  }
};

// == Handler =====================================================================
export const handleBookCopyGet = async (req: BookCopyRequest, res: NextApiResponse<BookCopyRequestResponse>) => {
  const { requestedBookCopyEditionNameStartsWith, requestedBookCopiesPage } = req.query;
  if(requestedBookCopyEditionNameStartsWith/*get bookCopies whose edition name starts with*/) {
    const bookCopies = await prisma.bookCopy.findMany( { where: { edition: { startsWith: requestedBookCopyEditionNameStartsWith } }, take: LOOKUP_SIZE, include: { book: true } });
    setSuccessResponse(res, { requestedBookCopy: undefined/*none requested*/, requestedBookCopies: bookCopies });
    return;
    
  } else if(requestedBookCopiesPage/*get books for a page*/) {
    const biggerThanIndex = computeBiggerThanPageIndex(Number(requestedBookCopiesPage));
    const books = await prisma.bookCopy.findMany({ orderBy: { createdAt: CREATED_AT_ORDER }, include: { book: true } }),
          filteredBookCopies = books.filter((book, index) => index > Number(biggerThanIndex)).slice(0, PAGINATION_SIZE/*get first N amount*/);
    setSuccessResponse(res, { requestedBookCopy: undefined/*none requested*/, requestedBookCopies: filteredBookCopies });
    return;
  } /* else -- error */
  
  setErrorResponse(res, 'Received wrong query params for BookCopy GET Request');
};
