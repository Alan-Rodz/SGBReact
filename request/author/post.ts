import axios, { AxiosResponse } from 'axios';
import { NextApiResponse } from 'next';

import { API, AUTOR } from 'general';
import { logRequestError, setErrorResponse, setSuccessResponse } from 'request';

import { AuthorRequest, AuthorRequestBody, AuthorRequestResponse } from './type';

// ********************************************************************************
// == Request =====================================================================
export const postAuthor = async (authorRequestBody: AuthorRequestBody) => {
  try {
    const { data: requestedAuthor } = await axios.post<AuthorRequestResponse, AxiosResponse<AuthorRequestResponse>, AuthorRequestBody>(`/${API}/${AUTOR}/`, authorRequestBody);
    return requestedAuthor;
  } catch (error) {
    logRequestError(error, 'postAuthor');    
  }
};

// == Handler =====================================================================
export const handleAuthorPost = async (req: AuthorRequest, res: NextApiResponse<AuthorRequestResponse>) => {
  const { authorName } = req.body;
  if(!authorName) {
    setErrorResponse(res, 'Received wrong query params for Author POST Request');
    return;
  }/* else -- valid author name */

  const newAuthor = await prisma.author.create({ data: { name: authorName }, });
  setSuccessResponse(res, { requestedAuthor: newAuthor, requestedAuthors: undefined/*none requested*/ });
};
