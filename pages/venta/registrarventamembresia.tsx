import { useToast, Box, FormControl, FormErrorMessage, FormLabel, Input, Text } from '@chakra-ui/react';
import { User } from '@prisma/client';
import { Field, FormikHelpers } from 'formik';
import type { GetServerSideProps, NextPage } from 'next';
import { getSession } from 'next-auth/react';
import { useState } from 'react';


import { applyTaxRateToPrice, createCommonInputTextFieldProps, createCommonNumberTextFieldProps, dateToISOString, redirectToLoginObject, pdfJSONBufferToURL, GeneralForm, GeneralModal, CREATED_AT_ORDER, NOT_AVAILABLE, TOAST_POSITION, TOAST_DURATION } from 'general';
import { getLibraryUsers, isValidSession, logRequestError, parseObjectFromServer, postMembershipSale, performSaleGetRequest } from 'request';
import { membershipSaleSchema } from 'schema';
import { AppLayout, CenterLayout } from 'ui';

// ********************************************************************************
// == Constant ====================================================================
const getDateOneYearFromNow = () => {
  const currentYearPlusOne = new Date().getFullYear() + 1/*current year plus 1*/;

  const todayPlusOneYear = new Date();
  todayPlusOneYear.setFullYear(currentYearPlusOne);
  return todayPlusOneYear;
};

// == Interface ===================================================================
interface RegisterMembershipSaleFormValues {
  [key: string]: string | number;
  name: string/*name of the user who acquires the membership*/;
  email: string/*email of the user who acquires the membership*/;
  membershipExpDate: string;
  membershipSalePrice: number;
  totalSalePrice: number;
}

interface RegisterMembershipSaleProps {
  user: User;
  currentMembershipPrice: number;
  currentTaxRatePercentage: number;
}

// == Server Side =================================================================
export const getServerSideProps: GetServerSideProps<RegisterMembershipSaleProps> = async (context) => {
  // -- Validation ----------------------------------------------------------------
  const session = await getSession(context);
  if(!isValidSession(session)) return redirectToLoginObject/*redirect to login if not authed*/;

  // -- Query ---------------------------------------------------------------------
  const appUser = await prisma.user.findUnique({ where: { email: session.user.email } }),

    allMembershipPrices = await prisma.membershipPrice.findMany({ orderBy: { createdAt: CREATED_AT_ORDER } }),
    currentMembershipPrice = allMembershipPrices[0/*most recently registered membershipPrice*/].membershipPrice,

    allTaxRates = await prisma.taxRate.findMany({ orderBy: { createdAt: CREATED_AT_ORDER } }),
    currentTaxRatePercentage = allTaxRates[0/*most recently registered taxRate*/].percentage;

  // -- Returned Props ------------------------------------------------------------
  return {
    props: {
      user: parseObjectFromServer(appUser),
      currentMembershipPrice: parseObjectFromServer(currentMembershipPrice),
      currentTaxRatePercentage: parseObjectFromServer(currentTaxRatePercentage),
    }
  };
};

// == Client Side =================================================================
const RegistrarVentaMembresia: NextPage<RegisterMembershipSaleProps> = ({ user, currentMembershipPrice, currentTaxRatePercentage }) => {
  const toast = useToast();

  // -- State ---------------------------------------------------------------------
  const [saleValues, setSaleValues] = useState<RegisterMembershipSaleFormValues | undefined/*no values set yet*/>(undefined);
  const [pricesChanged, setPricesChanged] = useState(false)/*only used if prices have changed since the last time they were queried*/;
  const [showProceedWithSaleModal, setShowProceedWithSaleModal] = useState(false);
  const [isPostingMembershipSale, setIsPostingMembershipSale] = useState(false);
  const [hasPostedMembershipSale, setHasPostedMembershipSale] = useState(false);

  // -- Handler -------------------------------------------------------------------
  const handleSubmit = async (values: RegisterMembershipSaleFormValues, formikHelpers: FormikHelpers<RegisterMembershipSaleFormValues>) => { 
    setSaleValues(values); 
    setShowProceedWithSaleModal(true); 
  };

  const confirmSale = async () => {
    if(!saleValues) return/*nothing to do*/;
    
    try {
      setIsPostingMembershipSale(true);
      const saleRequestAnswer = await performSaleGetRequest(undefined/*get latest sale information*/);
      if(!saleRequestAnswer || !saleRequestAnswer.currentSaleInfo) {
        throw new Error('Something went wrong while querying the latest sale information');
      }/* else -- got valid saleRequest answer */

      const { currentSaleInfo } = saleRequestAnswer,
            { currentMembershipPrice: latestMembershipPrice, currentTaxRatePercentage: latestTaxPercentage } = currentSaleInfo;

      if(currentMembershipPrice !== latestMembershipPrice || currentTaxRatePercentage !== latestTaxPercentage) {
        toast({ title: 'Los precios han cambiado desde la última vez que fueron consultados. Venta cancelada. Por favor, recargue la página.', status: 'warning', duration: 7000/*ms*/, position: TOAST_POSITION });
        setPricesChanged(true);
        setHasPostedMembershipSale(true)/*do not allow to retry*/;
        return;
      }/* else -- prices still match, proceed with sale*/
        
      toast({ title: 'Registrando Venta de Membresía...', status: 'info', duration: TOAST_DURATION, position: TOAST_POSITION });

      const data = await postMembershipSale({
        saleFields: {
          currentMembershipPrice: currentMembershipPrice,
          currentTaxRatePercentage: currentTaxRatePercentage,
          totalSalePrice: saleValues.totalSalePrice,
          employeeId: user.id,
          employeeName: user.name ?? NOT_AVAILABLE,
        },
        libraryUserFields: {
          libraryUserName: saleValues.name,
          libraryUserEmail: saleValues.email,
          membershipExpDate: saleValues.membershipExpDate,
        }
      });
      if(!data || !data.requestedSale || !data.requestedSale.pdfBucketRoute || !data.requestedLibraryUser || data.requestedLibraryUser.name !== saleValues.name) {
        throw new Error('There was an error while registering the membership sale');
      }/* else -- successful registering */

      const libraryUserResponse = await getLibraryUsers({
        requestedLibraryUserId: ''/*none requested*//*none requested*/,
        requestedLibraryUserNameStartsWith: ''/*none requested*/,
        requestedLibraryUsersPage: ''/*none requested*/,
        requestedLibraryUserMembershipRoute: data.requestedSale.pdfBucketRoute
      });
      if(!libraryUserResponse || !libraryUserResponse.salePDFJSONBuffer) {
        throw new Error('PDFBlob was not returned from server');
      }/* else -- got buffer */

      toast({ title: 'Venta de Membresía registrada exitosamente', status: 'success', duration: TOAST_DURATION, position: TOAST_POSITION });
      setHasPostedMembershipSale(true);

      window.open(pdfJSONBufferToURL(libraryUserResponse.salePDFJSONBuffer));
    } catch (error) {
      logRequestError(error, 'Posting MembershipSale');
      toast({ title: 'Ocurrió un error mientras se registraba la Venta de Membresía...', status: 'error', duration: TOAST_DURATION, position: TOAST_POSITION });
    } finally {
      setShowProceedWithSaleModal(false);
      setIsPostingMembershipSale(false);
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
        <Box marginRight='auto'>
          <Text as='strong'>Registrar Venta de Membresía</Text>
        </Box>
        <GeneralForm<RegisterMembershipSaleFormValues>
          initialValues={{ 
            name: '', 
            email: '', 
            membershipExpDate: dateToISOString(getDateOneYearFromNow()), 
            membershipSalePrice: currentMembershipPrice, 
            totalSalePrice: applyTaxRateToPrice(currentMembershipPrice, currentTaxRatePercentage) 
          }}
          validationSchema={membershipSaleSchema}

          // .. Submit Handler ....................................................
          onSubmitHandler={handleSubmit}

          // .. Render Function ...................................................
          renderFormFunction={(errors, touched, setFieldValue) =>
            <>
              {/*.. Name ...................................................... */}
              <FormControl isInvalid={!!errors.name && touched.name}>
                <FormLabel htmlFor='libraryUser-name'>Nombre del Usuario</FormLabel>
                <Field
                  id='libraryUser-name'
                  name='name'
                  placeholder='Nombre del Usuario'
                  {...createCommonInputTextFieldProps(isPostingMembershipSale || hasPostedMembershipSale)}
                />
                <FormErrorMessage>{errors.name}</FormErrorMessage>
              </FormControl>

              {/*.. Email ..................................................... */}
              <FormControl isInvalid={!!errors.email && touched.email}>
                <FormLabel htmlFor='libraryUser-email'>Email del Usuario</FormLabel>
                <Field
                  id='libraryUser-email'
                  name='email'
                  placeholder='Email del Usuario'
                  {...createCommonInputTextFieldProps(isPostingMembershipSale || hasPostedMembershipSale)}
                />
                <FormErrorMessage>{errors.email}</FormErrorMessage>
              </FormControl>

              {/* .. Expiration Date ............................................. */}
              <FormControl isInvalid={!!errors.membershipExpDate && touched.membershipExpDate}>
                <FormLabel htmlFor='libraryUser-membershipExpDate'>Fecha de Expiración de la Membresía</FormLabel>
                <Field
                  id='libraryUser-membershipExpDate'
                  name='membershipExpDate'
                  // NOTE: manually added props since exp date has to be at least 1 year in future
                  as={Input}
                  isDisabled={isPostingMembershipSale || hasPostedMembershipSale}
                  type='date'
                  variant='filled'
                  min={new Date().toISOString().slice(0, 10/*YYY-MM-DD*/)}
                />
                <FormErrorMessage>{errors.membershipExpDate}</FormErrorMessage>
              </FormControl>

              {/* .. Membership Price ......................................... */}
              <FormControl isInvalid={!!errors.membershipSalePrice && touched.membershipSalePrice}>
                <FormLabel htmlFor='libraryUser-membershipSalePrice'>Precio de la Membresía (MXN)</FormLabel>
                <Field
                  id='libraryUser-membershipSalePrice'
                  name='membershipSalePrice'
                  {...createCommonNumberTextFieldProps(true/*membership price cannot be edited*/)}
                />
                <FormErrorMessage>{errors.membershipSalePrice}</FormErrorMessage>
              </FormControl>

              {/* .. Total Sale Price ......................................... */}
              <FormControl isInvalid={!!errors.totalSalePrice && touched.totalSalePrice}>
                <FormLabel htmlFor='libraryUser-totalSalePrice'>{`Precio de la Membresía con IVA de ${currentTaxRatePercentage}% (MXN)`}</FormLabel>
                <Field
                  id='libraryUser-totalSalePrice'
                  name='totalSalePrice'
                  {...createCommonNumberTextFieldProps(true/*membership price cannot be edited*/)}
                />
                <FormErrorMessage>{errors.totalSalePrice}</FormErrorMessage>
              </FormControl>
            </>
          }

          // .. Remaining Props ...................................................
          performOperationString='Registrar Venta de Membresía'
          performAnotherOperationString={ pricesChanged ? 'Recargar la Página' : 'Registrar otra Venta de Membresía'}
          isPerformingOperation={isPostingMembershipSale}
          hasPerformedOperation={hasPostedMembershipSale}
          isObjectDeleted={false/*object cannot ever be deleted when registering a libraryUser*/}
        />
        
        {/* .. Modal .......................................................... */}
        <GeneralModal
          modalTitle='Confirmar Venta'
          bodyString='¿Proceder con la venta?'
          isOpen={showProceedWithSaleModal}
          onClose={() => setShowProceedWithSaleModal(false)}
          buttons={
            [
              {
                text: 'Cancelar',
                onClick: () => setShowProceedWithSaleModal(false),
                isDisabled: isPostingMembershipSale || hasPostedMembershipSale/*disable while registering the sale or once the sale has been done*/,
                isLoading: false/*cancel should not be loading*/,
              },
              {
                text: 'Confirmar Venta',
                onClick: confirmSale,
                isDisabled: isPostingMembershipSale || hasPostedMembershipSale,
                isLoading: isPostingMembershipSale,
              },
            ]
          }
        />
      </CenterLayout>
    </AppLayout>
  );
};

export default RegistrarVentaMembresia;
