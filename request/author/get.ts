import axios, { AxiosResponse } from 'axios';
import { NextApiResponse } from 'next';

import { computeBiggerThanPageIndex, API, AUTOR, CREATED_AT_ORDER, LOOKUP_SIZE, PAGINATION_SIZE } from 'general';
import { logRequestError, setErrorResponse, setSuccessResponse } from 'request';

import { AuthorRequest, AuthorRequestResponse } from './type';

// ********************************************************************************
// == Interface ===================================================================
export interface AuthorGetRequestParams {
  [key: string]: string;
  requestedAuthorId: string;
  requestedAuthorNameStartsWith: string;
  requestedAuthorsPage: string;
}

// == Request =====================================================================
export const getAuthors = async (params: AuthorGetRequestParams) => {
  try {
    const { data } = await axios.get<AuthorRequestResponse, AxiosResponse<AuthorRequestResponse>, AuthorGetRequestParams>(`/${API}/${AUTOR}/`, { params });
    return data;
  } catch (error) {
    logRequestError(error, 'getAuthors');    
  }
};

// == Handler =====================================================================
export const handleAuthorGet = async (req: AuthorRequest, res: NextApiResponse<AuthorRequestResponse>) => {
  const { requestedAuthorNameStartsWith, requestedAuthorsPage } = req.query;
  if(requestedAuthorNameStartsWith/*get authors whose name starts with*/) {
    const authors = await prisma.author.findMany( { where: { name: { startsWith: requestedAuthorNameStartsWith } }, take: LOOKUP_SIZE });
    setSuccessResponse(res, { requestedAuthor: undefined/*none requested*/, requestedAuthors: authors });
    return;
    
  } else if(requestedAuthorsPage/*get authors for a page*/) {
    const biggerThanIndex = computeBiggerThanPageIndex(Number(requestedAuthorsPage));
    const authors = await prisma.author.findMany({ orderBy: { createdAt: CREATED_AT_ORDER } }),
          filteredAuthors = authors.filter((author, index) => index > Number(biggerThanIndex)).slice(0, PAGINATION_SIZE/*get first N amount*/);
    setSuccessResponse(res, { requestedAuthor: undefined, requestedAuthors: filteredAuthors });
    return;
  } /* else -- error */

  setErrorResponse(res, 'Received wrong query params for Author GET Request');
};
