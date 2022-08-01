// ********************************************************************************
export type GeneralObject = { [key: string]: string | number | Date | null; }

// type of the setFieldValue helper provided by Formik
export type SetFieldValueType = (field: string, value: any, shouldValidate?: boolean | undefined) => void;
