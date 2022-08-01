import axios, { AxiosResponse } from 'axios';
import { NextApiResponse } from 'next';

import { API, AUTOR } from 'general';
import { logRequestError, setErrorResponse, setSuccessResponse } from 'request';

import { AuthorRequest, AuthorRequestBody, AuthorRequestResponse } from './type';

// ********************************************************************************
// == Request =====================================================================
export const patchAuthor = async (authorRequestBody: AuthorRequestBody) => {
  try {
    const { data: patchedAuthor } = await axios.patch<AuthorRequestResponse, AxiosResponse<AuthorRequestResponse>, AuthorRequestBody>(`/${API}/${AUTOR}/`, authorRequestBody);
    return patchedAuthor;
  } catch (error) {
    logRequestError(error, 'patchAuthor');    
  }
};

export const handleAuthorPatch = async (req: AuthorRequest, res: NextApiResponse<AuthorRequestResponse>) => {
  const { authorId, authorName } = req.body;
  if(!authorId || !authorName) {
    setErrorResponse(res, 'Received wrong query params for Author PATCH Request');
    return;
  }/* else -- valid values */

  const patchedAuthor = await prisma.author.update( { where: { id: authorId }, data: { name: authorName } });
  setSuccessResponse(res, { requestedAuthor: patchedAuthor, requestedAuthors: undefined/*none requested*/ })
};
