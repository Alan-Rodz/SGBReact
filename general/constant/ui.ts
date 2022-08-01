import { Input, InputProps, Select, SelectProps } from '@chakra-ui/react';
import { FieldProps } from 'formik';

// ********************************************************************************
export const commonInputProps = {
  autoComplete: 'off',
  autoCorrect: 'off',
  spellCheck: false,
  maxLength: 64,
}
export const createCommonInputTextFieldProps = (shouldFieldBeDisabled: boolean): Partial<FieldProps> & Partial<InputProps> => ({
  as: Input,
  isDisabled: shouldFieldBeDisabled,
  type: 'text',
  variant: 'filled',
  ...commonInputProps
});

export const createCommonNumberTextFieldProps = (shouldFieldBeDisabled: boolean): Partial<FieldProps> & Partial<InputProps> => ({
  as: Input,
  isDisabled: shouldFieldBeDisabled,
  type: 'number',
  variant: 'filled',
  ...commonInputProps
});

export const createCommonInputDateFieldProps = (shouldFieldBeDisabled: boolean): Partial<FieldProps> & Partial<InputProps> => ({
  as: Input,
  isDisabled: shouldFieldBeDisabled,
  type: 'date',
  variant: 'filled',
  max: new Date().toISOString().slice(0, 10/*YYY-MM-DD*/)
});

export const createCommonSelectFieldProps = (shouldFieldBeDisabled: boolean): Partial<FieldProps> & Partial<SelectProps> => ({
  as: Select,
  isDisabled: shouldFieldBeDisabled,
  variant: 'filled',
});
