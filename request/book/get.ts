import axios, { AxiosResponse } from 'axios';
import { NextApiResponse } from 'next';

import { computeBiggerThanPageIndex, API, CREATED_AT_ORDER, LIBRO, LOOKUP_SIZE, PAGINATION_SIZE } from 'general';
import { logRequestError, setErrorResponse, setSuccessResponse } from 'request';

import { BookRequest, BookRequestResponse } from './type';

// == Interface ===================================================================
export interface BookGetRequestParams {
  [key: string]: string;
  requestedBookNameStartsWith: string;
  requestedBooksPage: string;
}

// == Request =====================================================================
export const getBooks = async (params: BookGetRequestParams) => {
  try {
    const { data } = await axios.get<BookRequestResponse, AxiosResponse<BookRequestResponse>, BookGetRequestParams>(`/${API}/${LIBRO}/`, { params });
    return data;
  } catch (error) {
    logRequestError(error, 'getBooks');    
  }
};

// == Handler =====================================================================
export const handleBookGet = async (req: BookRequest, res: NextApiResponse<BookRequestResponse>) => {
  const { requestedBookNameStartsWith, requestedBooksPage } = req.query;
  if(requestedBookNameStartsWith/*get books whose name starts with*/) {
    const books = await prisma.book.findMany( { where: { name: { startsWith: requestedBookNameStartsWith } }, take: LOOKUP_SIZE, include: { author: true } });
    setSuccessResponse(res, { requestedBook: undefined/*none requested*/, requestedBooks: books });
    return;
    
  } else if(requestedBooksPage/*get books for a page*/) {
    const biggerThanIndex = computeBiggerThanPageIndex(Number(requestedBooksPage));
    const books = await prisma.book.findMany({ orderBy: { createdAt: CREATED_AT_ORDER }, include: { author: true } }),
          filteredBooks = books.filter((book, index) => index > Number(biggerThanIndex)).slice(0, PAGINATION_SIZE/*get first N amount*/);
    setSuccessResponse(res, { requestedBook: undefined/*none requested*/, requestedBooks: filteredBooks });
    return;
  } /* else -- error */
  
  setErrorResponse(res, 'Received wrong query params for Book GET Request');
};
