import axios, { AxiosResponse } from 'axios';
import { NextApiResponse } from 'next';

import { computeBiggerThanPageIndex, pdfBlobToJSONBuffer, API, CREATED_AT_ORDER, LOOKUP_SIZE, PAGINATION_SIZE, USUARIO } from 'general';
import { logRequestError, setErrorResponse, setSuccessResponse } from 'request';

import { LibraryUserRequest, LibraryUserRequestResponse } from './type';

// ********************************************************************************
// == Interface ===================================================================
export interface LibraryUserGetRequestParams {
  [key: string]: string;
  requestedLibraryUserId: string;
  requestedLibraryUserNameStartsWith: string;
  requestedLibraryUsersPage: string;
  requestedLibraryUserMembershipRoute: string;
}

// == Request =====================================================================
export const getLibraryUsers = async (params: LibraryUserGetRequestParams) => {
  try {
    const { data } = await axios.get<LibraryUserRequestResponse, AxiosResponse<LibraryUserRequestResponse>, LibraryUserRequestResponse>(`/${API}/${USUARIO}/`, { params });
    return data;
  } catch (error) {
    logRequestError(error, 'getLibraryUsers');    
  }
};

// == Handler =====================================================================
export const handleLibraryUserGet = async (req: LibraryUserRequest, res: NextApiResponse<LibraryUserRequestResponse>) => {
  const { requestedLibraryUserId, requestedLibraryUserNameStartsWith, requestedLibraryUsersPage, requestedLibraryUserMembershipRoute } = req.query;
  if(requestedLibraryUserId) {
    const libraryUser = await prisma.libraryUser.findUnique({ where: { id: requestedLibraryUserId }});

    if(!libraryUser) {
      setErrorResponse(res, 'Received wrong query params for LibraryUser GET Request');
      return;
    }/* else -- libraryUser exists */
    setSuccessResponse(res, { 
      requestedSale: undefined/*none requested*/, 
      requestedLibraryUser: libraryUser, 
      requestedLibraryUsers: undefined/*none requested*/, 
      salePDFJSONBuffer: undefined/*none requested*/ 
    });
    return;

  } else if(requestedLibraryUserNameStartsWith/*get libraryUsers whose name starts with*/) {
    const libraryUsers = await prisma.libraryUser.findMany( { where: { name: { startsWith: requestedLibraryUserNameStartsWith } }, take: LOOKUP_SIZE });
    setSuccessResponse(res, { 
      requestedSale: undefined/*none requested*/, 
      requestedLibraryUser: undefined/*none requested*/, 
      requestedLibraryUsers: libraryUsers, 
      salePDFJSONBuffer: undefined/*none requested*/ 
    });
    return;

  } else if(requestedLibraryUsersPage/*get libraryUsers for a page*/) {
    const biggerThanIndex = computeBiggerThanPageIndex(Number(requestedLibraryUsersPage));
    const libraryUsers = await prisma.libraryUser.findMany({ orderBy: { createdAt: CREATED_AT_ORDER } }),
          filteredLibraryUsers = libraryUsers.filter((libraryUser, index) => index > Number(biggerThanIndex)).slice(0, PAGINATION_SIZE/*get first N amount*/);
    setSuccessResponse(res, { 
      requestedSale: undefined/*none requested*/, 
      requestedLibraryUser: undefined/*none requested*/, 
      requestedLibraryUsers: filteredLibraryUsers, 
      salePDFJSONBuffer: undefined/*none requested*/ 
    });
    return;

  } else if(requestedLibraryUserMembershipRoute) {
    const { data: pdfBlob } = await supabase.storage.from(process.env.SUPABASE_BUCKET!/*must be set in env*/).download(requestedLibraryUserMembershipRoute);
    if(!pdfBlob) {
      throw new Error(`PDF does not exist in bucket at route: ${requestedLibraryUserMembershipRoute}`);
    }/* else -- pdfBlob exists */
    const pdfJSONBuffer = await pdfBlobToJSONBuffer(pdfBlob);
    setSuccessResponse(res, { 
      requestedSale: undefined/*none requested*/, 
      requestedLibraryUser: undefined/*none requested*/, 
      requestedLibraryUsers: undefined/*none requested*/, 
      salePDFJSONBuffer: pdfJSONBuffer 
    });
    return;
  }/* else -- error */

  setErrorResponse(res, 'Received wrong query params for LibraryUser GET Request');
}