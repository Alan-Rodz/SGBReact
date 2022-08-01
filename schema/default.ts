import { mixed, number, string } from 'yup';

// ********************************************************************************
// == Constant ====================================================================
// -- String ----------------------------------------------------------------------
const MIN_STRING_LENGTH = 4;
const MIN_STRING_LENGTH_ERROR = 'El valor ingresado es demasiado corto';
const MAX_STRING_LENGTH = 200;
const MAX_STRING_LENGTH_ERROR = 'El valor ingresado es demasiado largo';

// -- Number ----------------------------------------------------------------------
const MIN_NUMBER_VALUE = 1;
const MIN_NUMBER_VALUE_ERROR = 'Valor no permitido';
const MAX_NUMBER_VALUE = 100000/*pages/priceMXN*/;
const MAX_NUMBER_VALUE_ERROR = 'Valor no permitido';
const NON_INTEGER_ERROR = 'El valor ingresado debe ser un numero entero';

// == Schema ======================================================================
// -- String ----------------------------------------------------------------------
export const createDefaultStringSchema = (definedMessage?: string) => string()
                                                                      .defined(definedMessage)
                                                                      .trim()
                                                                      .min(MIN_STRING_LENGTH, MIN_STRING_LENGTH_ERROR)
                                                                      .max(MAX_STRING_LENGTH, MAX_STRING_LENGTH_ERROR);
                                                 
// -- Number ----------------------------------------------------------------------
export const createDefaultFloatSchema = (definedMessage?: string) => number()
                                                                    .defined(definedMessage)
                                                                    .min(MIN_NUMBER_VALUE, MIN_NUMBER_VALUE_ERROR)
                                                                    .max(MAX_NUMBER_VALUE, MAX_NUMBER_VALUE_ERROR);

export const createDefaultNumberSchema = (definedMessage?: string) => createDefaultFloatSchema(definedMessage)
                                                                      .integer(NON_INTEGER_ERROR);

// -- Enum ------------------------------------------------------------------------
export const createEnumSchema = (enumObject: { [key: string]: string; }) => mixed().oneOf(Object.keys(enumObject));
