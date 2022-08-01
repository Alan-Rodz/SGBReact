import axios, { AxiosResponse } from 'axios';
import { NextApiResponse } from 'next';

import { API, USUARIO } from 'general';
import { logRequestError, setErrorResponse, setSuccessResponse } from 'request';

import { isLibraryUserRequestBody, LibraryUserRequest, LibraryUserRequestBody, LibraryUserRequestResponse } from './type';

// ********************************************************************************
// == Request =====================================================================
export const patchLibraryUser = async (libraryUserRequestBody: LibraryUserRequestBody) => {
  try {
    const { data: patchedLibraryUser } = await axios.patch<LibraryUserRequestResponse, AxiosResponse<LibraryUserRequestResponse>, LibraryUserRequestBody>(`/${API}/${USUARIO}/`, libraryUserRequestBody);
    return patchedLibraryUser;
  } catch (error) {
    logRequestError(error, 'patchLibraryUser');    
  }
};

// == Handler =====================================================================
export const handleLibraryUserPatch = async (req: LibraryUserRequest, res: NextApiResponse<LibraryUserRequestResponse>) => {
  if(!isLibraryUserRequestBody(req.body) || !req.body.libraryUserName || !req.body.libraryUserEmail || !req.body.libraryUserMembershipExpDate) {
    setErrorResponse(res, 'Received wrong body params for LibraryUser PATCH Request');
    return;
  }/* else -- valid values */
  const { libraryUserId: id, libraryUserName: name, libraryUserEmail: email, libraryUserMembershipExpDate } = req.body;

  const patchedLibraryUser = await prisma.libraryUser.update( { where: { id }, data: { name, email, membershipExpDate: new Date(libraryUserMembershipExpDate) }, include: { membershipSale: true } });
  setSuccessResponse(res, { 
    requestedLibraryUser: patchedLibraryUser, 
    requestedLibraryUsers: undefined/*none requested*/, 
    requestedSale: undefined/*none requested*/, 
    salePDFJSONBuffer: undefined/*none requested*/
  });
};
