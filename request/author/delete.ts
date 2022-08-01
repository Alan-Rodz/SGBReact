import axios, { AxiosResponse } from 'axios';
import { NextApiResponse } from 'next';

import { API, AUTOR } from 'general';
import { logRequestError, setErrorResponse, setSuccessResponse } from 'request';

import { AuthorRequest, AuthorRequestResponse } from './type';

// ********************************************************************************
// == Interface ===================================================================
export interface AuthorDeleteRequestParams {
  [key: string]: string;
  deletedAuthorId: string;
}

// == Request =====================================================================
export const deleteAuthor = async (params: AuthorDeleteRequestParams) => {
  try {
    await axios.delete<AuthorRequestResponse, AxiosResponse<AuthorRequestResponse>, AuthorDeleteRequestParams>(`/${API}/${AUTOR}/`, { params });
  } catch (error) {
    logRequestError(error, 'deleteAuthor');    
  }
};

// == Handler =====================================================================
export const handleAuthorDelete = async (req: AuthorRequest, res: NextApiResponse<AuthorRequestResponse>) => {
  const { deletedAuthorId } = req.query;
  if(!deletedAuthorId) {
    setErrorResponse(res, 'Received wrong query params for Author DELETE Request');
    return;
  }/* else -- valid values */

  await prisma.author.delete({where: { id: deletedAuthorId }});
  setSuccessResponse(res, { requestedAuthor: undefined/*none requested*/, requestedAuthors: undefined/*none requested*/ })
};