import { Author, Book } from '@prisma/client';
import { NextApiRequest } from 'next';

import { Modify } from 'type';

import { BookDeleteRequestParams } from './delete';
import { BookGetRequestParams } from './get';

// ********************************************************************************
// == Type ========================================================================
export type NonTransformedBook = Book & { author: Author; };
export type TransformedBook = Modify<Book, { genre: string; releaseDate: string; }> & { authorName: string; };

// == Interface ===================================================================
export interface BookRequest extends NextApiRequest {
  query: BookGetRequestParams | BookDeleteRequestParams;
  body: BookRequestBody;
}

export interface BookRequestBody { 
  authorId: Author['id'] | undefined/*not creating a book*/; 
  bookId: Book['id'] | undefined/*not looking for a book*/; 
  bookGenre: Book['genre'];
  bookName: Book['name']; 
  bookReleaseDate: Book['releaseDate']; 
}

export interface BookRequestResponse { 
  requestedBook: NonTransformedBook | undefined/*not requesting a book or not a valid response for the used method*/;
  requestedBooks: NonTransformedBook[] | undefined/*not requesting books or not a valid response for the used method*/;
}
