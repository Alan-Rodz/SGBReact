import { LibraryUser, MembershipPrice } from '@prisma/client';
import { SchemaOf, object } from 'yup';

import { Modify } from 'type';

import { createDefaultFloatSchema, createDefaultStringSchema } from './default';

// ********************************************************************************
export const membershipSaleSchema: SchemaOf<Modify<Omit<LibraryUser, 'id' | 'createdAt' | 'updatedAt' | 'membershipSaleId'/*set on server*/>, { membershipExpDate: string; }>> = object({
  name: createDefaultStringSchema('Se debe indicar un nombre para el usuario.').required('Se debe indicar un nombre para el usuario.'),
  email: createDefaultStringSchema('Se debe indicar un email para el usuario.').required('Se debe indicar un email para el usuario.'),
  membershipExpDate: createDefaultStringSchema()/*modifiable through date input, no comment*/,
});

export const membershipPriceSchema: SchemaOf<Modify<Omit<MembershipPrice, 'id' | 'createdAt' | 'updatedAt'>, { startDate: string; endDate: string;  }>> = object({
  membershipPrice: createDefaultFloatSchema('Debe indicarse el precio de la membresía'),
  startDate: createDefaultStringSchema()/*modifiable through date input, no comment*/,
  endDate: createDefaultStringSchema()/*modifiable through date input, no comment*/,
});
