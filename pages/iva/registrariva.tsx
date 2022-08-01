import { useToast, FormControl, FormErrorMessage, FormLabel, Text } from '@chakra-ui/react';
import { Field, FormikHelpers } from 'formik';
import type { GetServerSideProps, NextPage } from 'next';
import Router  from 'next/router';
import { useState } from 'react';
import { AppLayout, CenterLayout } from 'ui';

import { taxRateSchema } from 'schema';
import { getUserFromContext, postTaxRate, logRequestError, UserPageProps } from 'request';
import { createCommonNumberTextFieldProps, createCommonInputTextFieldProps, dateToISOString, GeneralForm, DEFAULT_FINAL_DATE, TOAST_DURATION, TOAST_POSITION } from 'general';

// ********************************************************************************
// == Interface ===================================================================
interface RegisterTaxRateFormValues {
  [key: string]: string | number;
  percentage: number;
  startDate: string;
  endDate: string;
}

// == Server Side =================================================================
export const getServerSideProps: GetServerSideProps<UserPageProps> = async (context) => getUserFromContext(context);

// == Client Side =================================================================
const RegistrarIVA: NextPage<UserPageProps> = ({ user }) => {
  const toast = useToast();

  // -- State ---------------------------------------------------------------------
  const [isPostingTaxRate, setIsPostingTaxRate] = useState(false);
  const [hasPostedTaxRate, setHasPostedTaxRate] = useState(false);

  // -- Handler -------------------------------------------------------------------
  const handleSubmit = async (values: RegisterTaxRateFormValues, formikHelpers: FormikHelpers<RegisterTaxRateFormValues>) => {
    try {
      setIsPostingTaxRate(true);
      toast({ title: 'Registrando Tasa de IVA...', status: 'info', duration: TOAST_DURATION, position: TOAST_POSITION });

      const data = await postTaxRate({ percentage: values.percentage, startDate: new Date(values.startDate), endDate: new Date(values.endDate) });
      if(!data || !data.requestedTaxRate || data.requestedTaxRate.percentage !== values.percentage)
        throw new Error('There was an error while registering the taxRate');
      /* else -- successful registering */

      toast({ title: 'Tasa de IVA registrada exitosamente. Regresando a la página anterior...', status: 'success', duration: TOAST_DURATION, position: TOAST_POSITION });
      setHasPostedTaxRate(true);
      setTimeout(() => Router.back(), TOAST_DURATION);
    } catch (error) {
      logRequestError(error, 'Posting TaxRate');
      toast({ title: 'Ocurrió un error mientras se registraba la Tasa de IVA...', status: 'error', duration: TOAST_DURATION, position: TOAST_POSITION });
    } finally {
      setIsPostingTaxRate(false);
    }
  };

  // -- UI ------------------------------------------------------------------------
  return (
    <AppLayout
      userId={user.id}
      userIMG={user.image}
      employeeLevel={user.employeeLevel}
    >
      <CenterLayout>
        <GeneralForm<RegisterTaxRateFormValues>
          initialValues={{ percentage: 0, startDate: dateToISOString(new Date()), endDate: dateToISOString(new Date(DEFAULT_FINAL_DATE)) }}
          validationSchema={taxRateSchema}

          // .. Submit Handler ....................................................
          onSubmitHandler={handleSubmit}

          // .. Render Function ...................................................
          renderFormFunction={(errors, touched, setFieldValue) =>
            <>
              <Text as='strong'>Registrar Tasa de IVA</Text>

              {/* .. Percentage ............................................... */}
              <FormControl isInvalid={!!errors.percentage && touched.percentage}>
                <FormLabel htmlFor='taxRate-percentage'>Porcentaje de la Tasa de IVA</FormLabel>
                <Field
                  id='taxRate-percentage'
                  name='percentage'
                  placeholder='Porcentaje'
                  {...createCommonNumberTextFieldProps(isPostingTaxRate || hasPostedTaxRate)}
                />
                <FormErrorMessage>{errors.percentage}</FormErrorMessage>
              </FormControl>

              {/* .. StartDate ................................................ */}
              <FormControl isInvalid={!!errors.startDate && touched.startDate}>
                <FormLabel htmlFor='taxRate-startDate'>Fecha de Inicio</FormLabel>
                <Field
                  id='taxRate-startDate'
                  name='startDate'
                  placeholder='Fecha de Inicio'
                  {...createCommonInputTextFieldProps(true/*start date must be set at registration time and cannot change*/)}
                />
                <FormErrorMessage>{errors.startDate}</FormErrorMessage>
              </FormControl>

              {/* .. StartDate ................................................ */}
              <FormControl isInvalid={!!errors.endDate && touched.endDate}>
                <FormLabel htmlFor='taxRate-endDate'>Fecha de Término</FormLabel>
                <Field
                  id='taxRate-endDate'
                  name='endDate'
                  placeholder='Fecha de Término'
                  {...createCommonInputTextFieldProps(true/*end date must be set to the default*/)}
                />
                <FormErrorMessage>{errors.endDate}</FormErrorMessage>
              </FormControl>
            </>
          }

          // .. Remaining Props ...................................................
          performOperationString='Registrar Tasa de IVA'
          performAnotherOperationString='Regresando...'
          isPerformingOperation={isPostingTaxRate}
          hasPerformedOperation={hasPostedTaxRate}
          isObjectDeleted={hasPostedTaxRate/*disable button after registering taxRate*/}
        />
      </CenterLayout>
    </AppLayout>
  );
};

export default RegistrarIVA;
