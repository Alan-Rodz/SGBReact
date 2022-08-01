import { Book, BookCopy } from '@prisma/client';
import { NextApiRequest } from 'next';

import { BookCopyDeleteRequestParams } from './delete';
import { BookCopyGetRequestParams } from './get';

// ********************************************************************************
// == Type ========================================================================
export type NonTransformedBookCopy = BookCopy & { book: Book };
export type TransformedBookCopy = BookCopy & { bookName: string; };

// == Interface ===================================================================
export interface BookCopyRequest extends NextApiRequest {
  query: BookCopyGetRequestParams | BookCopyDeleteRequestParams;
  body: BookCopyRequestBody;
}

export interface BookCopyRequestBody { 
  id: string/*id of the book copy*/;
  bookId: string;
  edition: string;
  pages: number;
  publisher: string;
  quantityInStock: number;
  priceMXN: number;
}

export interface BookCopyRequestResponse { 
  requestedBookCopy: NonTransformedBookCopy | undefined/*not requesting a bookCopy or not a valid response for the used method*/;
  requestedBookCopies: NonTransformedBookCopy[] | undefined/*not requesting a bookCopy or not a valid response for the used method*/;
}
