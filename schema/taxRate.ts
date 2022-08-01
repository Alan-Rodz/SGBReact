import { TaxRate } from '@prisma/client';
import { SchemaOf, object, number } from 'yup';

import { Modify } from 'type';

import { createDefaultStringSchema } from './default';

// ********************************************************************************
export const taxRateSchema: SchemaOf<Modify<Omit<TaxRate, 'id' | 'createdAt' | 'updatedAt'>, { startDate: string; endDate: string;  }>> = object({
  percentage: number()
              .integer('El porcentaje debe ser un entero')
              .defined('El porcentaje debe estar definido')
              .min(1, 'El porcentaje debe ser mayor a cero.')
              .max(100, 'El porcentaje debe ser menor o igual a cien'),
  startDate: createDefaultStringSchema()/*modifiable through date input, no comment*/,
  endDate: createDefaultStringSchema()/*modifiable through date input, no comment*/,
});
