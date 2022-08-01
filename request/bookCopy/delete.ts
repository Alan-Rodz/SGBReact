import axios, { AxiosResponse } from 'axios';
import { NextApiResponse } from 'next';

import { API, EJEMPLAR } from 'general';
import { logRequestError, setErrorResponse, setSuccessResponse } from 'request';

import { BookCopyRequest, BookCopyRequestResponse } from './type';

// ********************************************************************************
// == Interface ===================================================================
export interface BookCopyDeleteRequestParams {
  [key: string]: string;
  deletedBookCopyId: string;
}

// == Request =====================================================================
export const deleteBookCopy = async (params: BookCopyDeleteRequestParams) => {
  try {
    await axios.delete<BookCopyRequestResponse, AxiosResponse<BookCopyRequestResponse>, BookCopyDeleteRequestParams>(`/${API}/${EJEMPLAR}/`, { params });
  } catch (error) {
    logRequestError(error, 'deleteBookCopy');    
  }
};

// == Handler =====================================================================
export const handleBookCopyDelete = async (req: BookCopyRequest, res: NextApiResponse<BookCopyRequestResponse>) => {
  const { deletedBookCopyId } = req.query;
  if(!deletedBookCopyId) {
    setErrorResponse(res, 'Received wrong query params for BookCopy DELETE Request');
    return;
  }/* else -- valid values */

  await prisma.bookCopy.delete({where: { id: deletedBookCopyId }});
  setSuccessResponse(res, { requestedBookCopy: undefined/*none requested*/, requestedBookCopies: undefined/*none requested*/ })
};
