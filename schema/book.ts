import { Book, Genre } from '@prisma/client';
import { SchemaOf, object } from 'yup';

import { Modify } from 'type';

import { createDefaultStringSchema, createEnumSchema } from './default';

// ********************************************************************************
export const bookSchema: SchemaOf<Modify<Omit<Book, 'id' | 'createdAt' | 'updatedAt' |'authorId'>, { authorName: string; releaseDate: string }>> = object({
  authorName: createDefaultStringSchema('El libro debe tener un autor.'),
  genre: createEnumSchema(Genre),
  name: createDefaultStringSchema('Se debe indicar un nombre para el libro.').required('Se debe indicar un nombre para el libro.'),
  releaseDate: createDefaultStringSchema()/*modifiable through date input, no comment*/
});
