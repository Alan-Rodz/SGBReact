import { BookCopy } from '@prisma/client';
import { SchemaOf, object } from 'yup';

import { createDefaultStringSchema, createDefaultNumberSchema, createDefaultFloatSchema } from './default';

// ********************************************************************************
export const bookCopySchema: SchemaOf<Omit<BookCopy, 'id' | 'createdAt' | 'updatedAt' | 'bookId'>> = object({
  edition: createDefaultStringSchema('El ejemplar debe tener una edición'),
  pages: createDefaultNumberSchema('El ejemplar debe tener una cantidad de páginas'),
  publisher: createDefaultStringSchema('El ejemplar debe tener una editorial'),
  quantityInStock: createDefaultNumberSchema('La cantidad actual de ejemplares debe definirse'),
  priceMXN: createDefaultFloatSchema('El precio del ejemplar debe definirse'),
});
