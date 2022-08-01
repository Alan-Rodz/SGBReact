import { Author } from '@prisma/client';
import { NextApiRequest } from 'next';

import { AuthorDeleteRequestParams } from './delete';
import { AuthorGetRequestParams } from './get';

// ********************************************************************************
// == Interface ===================================================================
export interface AuthorRequest extends NextApiRequest {
  query: AuthorGetRequestParams | AuthorDeleteRequestParams;
  body: AuthorRequestBody;
}

export interface AuthorRequestBody { 
  authorId: Author['id'] | undefined/*not posting an author*/; 
  authorName: Author['name']; 
}

export interface AuthorRequestResponse { 
  requestedAuthor: Author | undefined/*not requesting an author or not a valid response for the used method*/;
  requestedAuthors: Author[] | undefined/*not requesting authors or not a valid response for the used method*/;
}

