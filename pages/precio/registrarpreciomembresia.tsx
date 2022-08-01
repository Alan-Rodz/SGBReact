import { useToast, Box, FormControl, FormErrorMessage, FormLabel, Text } from '@chakra-ui/react';
import { Field, FormikHelpers } from 'formik';
import type { GetServerSideProps, NextPage } from 'next';
import Router  from 'next/router';
import { useState } from 'react';

import { createCommonInputTextFieldProps, createCommonNumberTextFieldProps, dateToISOString, GeneralForm, DEFAULT_FINAL_DATE, TOAST_DURATION, TOAST_POSITION } from 'general';
import { getUserFromContext, postMembershipPrice, logRequestError, UserPageProps } from 'request';
import { membershipPriceSchema } from 'schema';
import { AppLayout, CenterLayout } from 'ui';

// ********************************************************************************
// == Interface ===================================================================
interface RegisterMembershipPriceFormValues {
  [key: string]: string | number;
  membershipPrice: number;
  startDate: string;
  endDate: string;
}

// == Server Side =================================================================
export const getServerSideProps: GetServerSideProps<UserPageProps> = async (context) => getUserFromContext(context);

// == Client Side =================================================================
const RegistrarPrecioMembresia: NextPage<UserPageProps> = ({ user }) => {
  const toast = useToast();

  // -- State ---------------------------------------------------------------------
  const [isPostingMembershipPrice, setIsPostingMembershipPrice] = useState(false);
  const [hasPostedMembershipPrice, setHasPostedMembershipPrice] = useState(false);

  // -- Handler -------------------------------------------------------------------
  const handleSubmit = async (values: RegisterMembershipPriceFormValues, formikHelpers: FormikHelpers<RegisterMembershipPriceFormValues>) => {
    try {
      setIsPostingMembershipPrice(true);
      toast({ title: 'Registrando Precio de Membresía...', status: 'info', duration: TOAST_DURATION, position: TOAST_POSITION });

      const data = await postMembershipPrice({ priceType: 'membership', price: values.membershipPrice, startDate: new Date(values.startDate), endDate: new Date(values.endDate) });
      if(!data || !data.requestedMembershipPrice || data.requestedMembershipPrice.membershipPrice !== values.membershipPrice)
      throw new Error('There was an error while registering the membershipPrice');
      /* else -- successful registering */

      toast({ title: 'Precio de Membresía registrado exitosamente. Regresando a la página anterior...', status: 'success', duration: TOAST_DURATION, position: TOAST_POSITION });
      setHasPostedMembershipPrice(true);
      setTimeout(() => Router.back(), TOAST_DURATION);
    } catch (error) {
      logRequestError(error, 'Posting MembershipPrice');
      toast({ title: 'Ocurrió un error mientras se registraba el precio de la membresía...', status: 'error', duration: TOAST_DURATION, position: TOAST_POSITION });
    } finally {
      setIsPostingMembershipPrice(false);
    }
  }

  // -- UI ------------------------------------------------------------------------
  return (
    <AppLayout
      userId={user.id}
      userIMG={user.image}
      employeeLevel={user.employeeLevel}
    >
      <CenterLayout>
        <Box marginRight='auto'>
          <Text as='strong'>Registrar Nuevo Precio de Membresía</Text>
        </Box>
        <GeneralForm<RegisterMembershipPriceFormValues>
          initialValues={{ membershipPrice: 0, startDate: dateToISOString(new Date()), endDate: dateToISOString(new Date(DEFAULT_FINAL_DATE)) }}
          validationSchema={membershipPriceSchema}

          // .. Submit Handler ....................................................
          onSubmitHandler={handleSubmit}

          // .. Render Function ...................................................
          renderFormFunction={(errors, touched, setFieldValue) =>
            <>
              {/* .. Percentage ............................................... */}
              <FormControl isInvalid={!!errors.membershipPrice && touched.membershipPrice}>
                <FormLabel htmlFor='membership-membershipPrice'>Precio de la Membresía (sin IVA)</FormLabel>
                <Field
                  id='membership-membershipPrice'
                  name='membershipPrice'
                  placeholder='Precio'
                  {...createCommonNumberTextFieldProps(isPostingMembershipPrice || hasPostedMembershipPrice)}
                />
                <FormErrorMessage>{errors.membershipPrice}</FormErrorMessage>
              </FormControl>

              {/* .. StartDate ................................................ */}
              <FormControl isInvalid={!!errors.startDate && touched.startDate}>
                <FormLabel htmlFor='membership-startDate'>Fecha de Inicio</FormLabel>
                <Field
                  id='membership-startDate'
                  name='startDate'
                  placeholder='Fecha de Inicio'
                  {...createCommonInputTextFieldProps(true/*start date must be set at registration time and cannot change*/)}
                />
                <FormErrorMessage>{errors.startDate}</FormErrorMessage>
              </FormControl>

              {/* .. StartDate ................................................ */}
              <FormControl isInvalid={!!errors.endDate && touched.endDate}>
                <FormLabel htmlFor='membership-endDate'>Fecha de Término</FormLabel>
                <Field
                  id='membership-endDate'
                  name='endDate'
                  placeholder='Fecha de Término'
                  {...createCommonInputTextFieldProps(true/*end date must be set to the default*/)}
                />
                <FormErrorMessage>{errors.endDate}</FormErrorMessage>
              </FormControl>
            </>
          }

          // .. Remaining Props ...................................................
          performOperationString='Registrar Precio de Membresía'
          performAnotherOperationString='Regresando...'
          isPerformingOperation={isPostingMembershipPrice}
          hasPerformedOperation={hasPostedMembershipPrice}
          isObjectDeleted={hasPostedMembershipPrice/*disable button after registering membershipPrice*/}
        />
      </CenterLayout>
    </AppLayout>
  );
};

export default RegistrarPrecioMembresia;
