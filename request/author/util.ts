import { Author } from '@prisma/client';
import { Dispatch, SetStateAction } from 'react';

import { SetFieldValueType } from 'type';

import { getAuthors } from './get';

// ********************************************************************************
// functions used in ui pages
export const lookForAuthor = async (authorNameStartsWith: string) => {
  const data = await getAuthors({ requestedAuthorId: ''/*not looking for an author*/, requestedAuthorNameStartsWith: authorNameStartsWith, requestedAuthorsPage: ''/*not requesting a page*/, })
  if(!data || !data.requestedAuthors) {
    return [];
  } /* else -- authors found  */
  return data.requestedAuthors;
};

export const chooseAuthor = (chosenAuthor: Author, setShowAuthorLookUpModal: Dispatch<SetStateAction<boolean>>, setCurrentBookAuthor: Dispatch<SetStateAction<Author | undefined/*no author chosen yet*/>>,  setFieldValue: SetFieldValueType) => { 
  setShowAuthorLookUpModal(false); 
  setCurrentBookAuthor(chosenAuthor); 
  setFieldValue('authorName', chosenAuthor.name, true/*validate*/);
};
