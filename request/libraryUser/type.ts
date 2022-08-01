import { LibraryUser, Sale } from '@prisma/client';
import { NextApiRequest } from 'next';

import { PDFJSONBuffer } from 'general';
import { MembershipSaleRequestBody } from 'request';
import { Modify } from 'type';

import { LibraryUserGetRequestParams } from './get';

// ********************************************************************************
// == Type ========================================================================
export type TransformedLibraryUser = Modify<LibraryUser, { membershipExpDate: string; }>;

// == Interface ===================================================================
export interface LibraryUserRequest extends NextApiRequest {
  query: LibraryUserGetRequestParams;
  body: MembershipSaleRequestBody | LibraryUserRequestBody;
}

export interface LibraryUserRequestBody { 
  libraryUserId: LibraryUser['id'] | undefined/*not updating a LibraryUser*/; 
  libraryUserName: LibraryUser['name'] | undefined/*not updating a LibraryUser*/; 
  libraryUserEmail: LibraryUser['email'] | undefined/*not updating a LibraryUser*/; 
  libraryUserMembershipExpDate: string | undefined/*not updating a LibraryUser*/; 
}

export interface LibraryUserRequestResponse { 
  requestedSale: Sale | undefined/*not requesting a Sale or not a valid response for the used method*/;
  requestedLibraryUser: LibraryUser | undefined/*not requesting LibraryUser or not a valid response for the used method*/;
  requestedLibraryUsers: LibraryUser[] | undefined/*not requesting LibraryUsers or not a valid response for the used method*/;
  salePDFJSONBuffer: PDFJSONBuffer | undefined/*not requesting PDF or not a valid response for the used method*/;
}

// == Type Guard ==================================================================
export const isMembershipSaleRequestBody = (requestBody: any): requestBody is MembershipSaleRequestBody => 'saleFields' in requestBody && 'libraryUserFields' in requestBody;
export const isLibraryUserRequestBody = (requestBody: any): requestBody is LibraryUserRequestBody => 'libraryUserId' in requestBody && 'libraryUserName' in requestBody && 'libraryUserEmail' in requestBody && 'libraryUserMembershipExpDate' in requestBody;
