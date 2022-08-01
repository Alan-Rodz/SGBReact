import axios, { AxiosResponse } from 'axios';
import { NextApiResponse } from 'next';

import { API, LIBRO } from 'general';
import { logRequestError, setErrorResponse, setSuccessResponse } from 'request';

import { BookRequest, BookRequestBody, BookRequestResponse } from './type';

// == Request =====================================================================
export const postBook = async (bookRequestBody: BookRequestBody) => {
  try {
    const { data: requestedBook } = await axios.post<BookRequestResponse, AxiosResponse<BookRequestResponse>, BookRequestBody>(`/${API}/${LIBRO}/`, bookRequestBody);
    return requestedBook;
  } catch (error) {
    logRequestError(error, 'postBook');    
  }
};

// == Handler =====================================================================
export const handleBookPost = async (req: BookRequest, res: NextApiResponse<BookRequestResponse>) => {
  const { authorId, bookGenre: genre, bookName: name, bookReleaseDate: releaseDate } = req.body;
  if(!authorId || !genre || !name || !releaseDate) {
    setErrorResponse(res, 'Received wrong query params for Book POST Request');
    return;
  }/* else -- valid values */

  const newBook = await prisma.book.create({ data: { authorId, genre, name, releaseDate }, include: { author: true }});
  setSuccessResponse(res, { requestedBook: newBook, requestedBooks: undefined/*none requested*/ });
};
