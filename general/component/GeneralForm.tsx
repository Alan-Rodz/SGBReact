import { VStack, Button } from '@chakra-ui/react';
import { Formik, FormikErrors, FormikHelpers, FormikProps, FormikTouched } from 'formik';
import Router from 'next/router';
import { ObjectSchema } from 'yup';

import { GeneralObject, SetFieldValueType } from 'type';

// ********************************************************************************
// == Interface ===================================================================
interface Props<T extends GeneralObject> {
  initialValues: T;
  validationSchema: ObjectSchema<any>;
  onSubmitHandler: (values: T, formikHelpers: FormikHelpers<T>) => void | Promise<any>;
  renderFormFunction: (errors: FormikErrors<T>, touched: FormikTouched<T>, setFieldValue: SetFieldValueType) => React.ReactNode;
  performOperationString: string;
  performAnotherOperationString: string;
  isPerformingOperation: boolean;
  hasPerformedOperation: boolean;
  isObjectDeleted: boolean;
}

// == Component ===================================================================
export const GeneralForm = <T extends GeneralObject>({ initialValues, validationSchema, renderFormFunction, onSubmitHandler, performOperationString, performAnotherOperationString, isPerformingOperation, hasPerformedOperation, isObjectDeleted }: Props<T>) =>
  <Formik
    initialValues={initialValues}
    validationSchema={validationSchema}
    onSubmit={onSubmitHandler}
  >
    {(props: FormikProps<T>) => (
      <form onSubmit={props.handleSubmit}>
        <VStack
          align='flex-start'
          spacing={4}
        >
          {renderFormFunction(props.errors, props.touched, props.setFieldValue)}
          {
            hasPerformedOperation
              ?
              <Button
                width='full'
                colorScheme='twitter'
                isDisabled={isObjectDeleted}
                onClick={() => Router.reload()}
              >
                {performAnotherOperationString}
              </Button>
              :
              <Button
                disabled={isPerformingOperation || hasPerformedOperation || isObjectDeleted}
                type='submit'
                width='full'
                colorScheme='twitter'
              >
                {performOperationString}
              </Button>
          }
        </VStack>
      </form>
    )}
  </Formik>;
