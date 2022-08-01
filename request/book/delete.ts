import axios, { AxiosResponse } from 'axios';
import { NextApiResponse } from 'next';

import { API, LIBRO } from 'general';
import { logRequestError, setErrorResponse, setSuccessResponse } from 'request';

import { BookRequest, BookRequestResponse } from './type';

// == Interface ===================================================================
export interface BookDeleteRequestParams {
  [key: string]: string;
  deletedBookId: string;
}

// == Request =====================================================================
export const deleteBook = async (params: BookDeleteRequestParams) => {
  try {
    await axios.delete<BookRequestResponse, AxiosResponse<BookRequestResponse>, BookDeleteRequestParams>(`/${API}/${LIBRO}/`, { params });
  } catch (error) {
    logRequestError(error, 'deleteBook');    
  }
};

// == Handler =====================================================================
export const handleBookDelete = async (req: BookRequest, res: NextApiResponse<BookRequestResponse>) => {
  const { deletedBookId } = req.query;
  if(!deletedBookId) {
    setErrorResponse(res, 'Received wrong query params for Book DELETE Request');
    return;
  }/* else -- valid book id */

  await prisma.book.delete({where: { id: deletedBookId }});
  setSuccessResponse(res, { requestedBook: undefined/*no book requested*/, requestedBooks: undefined/*no books requested*/ })
};
