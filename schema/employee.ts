import { EmployeeLevel, Sex, CivilState, Shift, DayOfWeek } from '@prisma/client';
import { SchemaOf, object } from 'yup';

import { UpdateUserType } from 'request';

import { createDefaultStringSchema, createEnumSchema } from './default';

// ********************************************************************************
export const employeeSchema: SchemaOf<UpdateUserType>= object({
  name: createDefaultStringSchema('Se debe ingresar un nombre para el empleado.').required('Se debe ingresar un nombre para el empleado.'),
  employeeLevel: createEnumSchema(EmployeeLevel),
  birthDate: createDefaultStringSchema()/*modifiable through date input, no comment*/,
  address: createDefaultStringSchema('Se debe ingresar una dirección válida.').required('Se debe ingresar una dirección válida.'),
  sex: createEnumSchema(Sex),
  hireDate: createDefaultStringSchema()/*modifiable through date input, no comment*/,
  fireDate: createDefaultStringSchema()/*modifiable through date input, no comment*/,
  civilState: createEnumSchema(CivilState),
  shift: createEnumSchema(Shift),
  restDay: createEnumSchema(DayOfWeek)
});
