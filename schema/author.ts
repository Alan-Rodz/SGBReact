import { Author } from '@prisma/client';

import { SchemaOf, object } from 'yup';

import { createDefaultStringSchema } from './default';

// ********************************************************************************
export const authorSchema: SchemaOf<Pick<Author, 'name'>> = object({
  name: createDefaultStringSchema('Se debe indicar un nombre para el autor.').required('Se debe indicar un nombre para el autor.')
});
