import axios, { AxiosResponse } from 'axios';
import { NextApiResponse } from 'next';

import { API, LIBRO } from 'general';
import { logRequestError, setErrorResponse, setSuccessResponse } from 'request';

import { BookRequest, BookRequestBody, BookRequestResponse } from './type';

// == Request =====================================================================
export const patchBook = async (bookRequestBody: BookRequestBody) => {
  try {
    const { data: patchedBook } = await axios.patch<BookRequestResponse, AxiosResponse<BookRequestResponse>, BookRequestBody>(`/${API}/${LIBRO}/`, bookRequestBody);
    return patchedBook;
  } catch (error) {
    logRequestError(error, 'patchBook');    
  }
};

// == Handler =====================================================================
export const handleBookPatch = async (req: BookRequest, res: NextApiResponse<BookRequestResponse>) => {
  const { authorId, bookId, bookGenre: genre, bookName: name, bookReleaseDate: releaseDate } = req.body;
  if(!authorId || !bookId || !genre || !name || !releaseDate) {
    setErrorResponse(res, 'Received wrong query params for Book PATCH Request');
    return;
  }/* else -- valid values */

  const patchedBook = await prisma.book.update( { where: { id: bookId }, data: { authorId, genre, name, releaseDate }, include: { author: true } });
  setSuccessResponse(res, { requestedBook: patchedBook, requestedBooks: undefined/*no books requested*/ })
};
