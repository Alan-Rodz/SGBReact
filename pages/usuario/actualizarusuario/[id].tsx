import { LibraryUser, Sale, User } from '@prisma/client';
import { useToast, Center, FormControl, FormErrorMessage, FormLabel, IconButton, Input, Spinner, Text, Tooltip } from '@chakra-ui/react';
import { Field, FormikHelpers } from 'formik';
import type { GetServerSideProps, NextPage } from 'next';
import { getSession } from 'next-auth/react';
import { useState } from 'react';
import { HiOutlineDocumentDownload } from 'react-icons/hi';

import { createCommonInputTextFieldProps, dateToISOString, redirectToLoginObject, pdfJSONBufferToURL, objectsHaveSameValues, GeneralForm, TOAST_DURATION, TOAST_POSITION } from 'general';
import { isValidSession, parseObjectFromServer, getLibraryUsers, logRequestError, patchLibraryUser } from 'request';
import { membershipSaleSchema } from 'schema';
import { AppLayout, CenterLayout } from 'ui';

// ********************************************************************************
// == Type ========================================================================
type UpdateLibraryUserFormValues = Omit<LibraryUser, 'createdAt' | 'updatedAt' | 'membershipSaleId' | 'membershipExpDate'> & { membershipExpDate: string; };

// == Interface ===================================================================
interface UpdateLibraryUserProps {
  user: User;
  libraryUser: LibraryUser;
  libraryUserMembershipSale: Sale;
}

// == Server Side =================================================================
export const getServerSideProps: GetServerSideProps<UpdateLibraryUserProps> = async (context) => {
  // -- Validation ----------------------------------------------------------------
  const session = await getSession(context);
  if(!isValidSession(session)) return redirectToLoginObject/*redirect to login if not authed*/;

  // -- Query ---------------------------------------------------------------------
  const libraryUserId = context.query.id;
  if(typeof libraryUserId !== 'string') throw new Error(`Received wrong query id: ${libraryUserId}`);

  const appUser = await prisma.user.findUnique({ where: { email: session.user.email } }),
        libraryUser = await prisma.libraryUser.findUnique({ where: { id: libraryUserId }, include: { membershipSale: true } });

  // -- Returned Props ------------------------------------------------------------
  return {
    props: {
      user: parseObjectFromServer(appUser),
      libraryUser: parseObjectFromServer(libraryUser),
      libraryUserMembershipSale: parseObjectFromServer(libraryUser?.membershipSale),
    }
  };
};

// == Client Side =================================================================
const ActualizarUsuario: NextPage<UpdateLibraryUserProps> = ({ user, libraryUser, libraryUserMembershipSale }) => {
  const toast = useToast();

  // -- State ---------------------------------------------------------------------
  const [currentLibraryUser, setCurrentLibraryUser] = useState(libraryUser);
  const [isUpdatingLibraryUser, setIsUpdatingLibraryUser] = useState(false);
  const [isGettingPDF, setIsGettingPDf] = useState(false);

  // -- Handler -------------------------------------------------------------------
  const handleSubmit = async (values: UpdateLibraryUserFormValues, formikHelpers: FormikHelpers<UpdateLibraryUserFormValues>) => {
    if(objectsHaveSameValues<UpdateLibraryUserFormValues>(
      values,
      { ...currentLibraryUser, membershipExpDate: dateToISOString(new Date(currentLibraryUser.membershipExpDate)) },
      ['name', 'email', 'membershipExpDate'])) {
      toast({ title: 'Mismos valores encontrados, actualización cancelada.', status: 'info', duration: TOAST_DURATION, position: TOAST_POSITION });
      return;
    }/* else -- different values */

    try {
      setIsUpdatingLibraryUser(true);
      toast({ title: 'Actualizando Usuario...', status: 'info', duration: TOAST_DURATION, position: TOAST_POSITION });

      const data = await patchLibraryUser({
        libraryUserId: values.id,
        libraryUserName: values.name,
        libraryUserEmail: values.email,
        libraryUserMembershipExpDate: dateToISOString(new Date(values.membershipExpDate))
      });

      if(!data || !data.requestedLibraryUser)
        throw new Error('There was an error while updating the libraryUser');
      /* else -- successful update */

      toast({ title: 'Usuario actualizado exitosamente', status: 'success', duration: TOAST_DURATION, position: TOAST_POSITION });
      setCurrentLibraryUser(data.requestedLibraryUser);
      return;
    } catch (error) {
      logRequestError(error, 'Updating LibraryUser');
      toast({ title: 'Ocurrió un error mientras se registraba al usuario...', status: 'error', duration: TOAST_DURATION, position: TOAST_POSITION });
    } finally {
      setIsUpdatingLibraryUser(false);
    }
  }
  
  const getMembershipSalePDF = async () => {
    try {
      setIsGettingPDf(true);
      const libraryUserResponse = await getLibraryUsers({
        requestedLibraryUserId: ''/*none requested*//*none requested*/,
        requestedLibraryUserNameStartsWith: ''/*none requested*/,
        requestedLibraryUsersPage: ''/*none requested*/,
        requestedLibraryUserMembershipRoute: libraryUserMembershipSale.pdfBucketRoute ?? ''/*none if not present*/
      });
      if(!libraryUserResponse || !libraryUserResponse.salePDFJSONBuffer) {
        throw new Error('PDFBlob was not returned from server');
      }/* else -- got buffer */
      window.open(pdfJSONBufferToURL(libraryUserResponse.salePDFJSONBuffer));
    } catch (error) {
      logRequestError(error, 'gettingPDF for membershipSale');                
    } finally {
      setIsGettingPDf(false);
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
        <GeneralForm<UpdateLibraryUserFormValues>
          initialValues={{
            id: libraryUser.id,
            name: libraryUser.name,
            email: libraryUser.email,
            membershipExpDate: dateToISOString(new Date(libraryUser.membershipExpDate)),
          }}
          validationSchema={membershipSaleSchema}

          // .. Submit Handler ....................................................
          onSubmitHandler={handleSubmit}

          // .. Render Function ...................................................
          renderFormFunction={(errors, touched, setFieldValue) =>
            <>
              <Center width='full'>
                <Text as='strong'>Actualizar Usuario</Text>
                <Tooltip label='Ver PDF de Venta de Membresía'>
                  <IconButton 
                    icon={isGettingPDF ? <Spinner /> : <HiOutlineDocumentDownload />} 
                    marginLeft='auto' 
                    isDisabled={isGettingPDF || isUpdatingLibraryUser} 
                    aria-label='getMembershipSalePDF' 
                    onClick={getMembershipSalePDF} 
                  />
                </Tooltip>
              </Center>

              {/* .. Name ................................................... */}
              <FormControl isInvalid={!!errors.name && touched.name}>
                <FormLabel htmlFor='libraryUser-name'>
                  Nombre del Usuario
                </FormLabel>
                <Field
                  id='libraryUser-name'
                  name='name'
                  placeholder='Nombre del Empleado'
                  {...createCommonInputTextFieldProps(isUpdatingLibraryUser)}
                />
                <FormErrorMessage>{errors.name}</FormErrorMessage>
              </FormControl>

              {/* .. Email .................................................... */}
              <FormControl isInvalid={!!errors.email && touched.email}>
                <FormLabel htmlFor='libraryUser-email'>
                  Email del Usuario
                </FormLabel>
                <Field
                  id='libraryUser-email'
                  name='email'
                  placeholder='Nombre del Empleado'
                  {...createCommonInputTextFieldProps(isUpdatingLibraryUser)}
                />
                <FormErrorMessage>{errors.email}</FormErrorMessage>
              </FormControl>

              {/* .. Membership Expiration Date ............................... */}
              <FormControl isInvalid={!!errors.membershipExpDate && touched.membershipExpDate}>
                <FormLabel htmlFor='libraryUser-membershipExpDate'>
                  Fecha de Expiración de la Membresía
                </FormLabel>
                {/* NOTE: Not using createCommonInputDateFieldProps cause membershipExpDate can be set to anything */}
                <Field
                  id='libraryUser-membershipExpDate'
                  name='membershipExpDate'
                  as={Input}
                  isDisabled={isUpdatingLibraryUser}
                  type='date'
                  variant='filled'
                />
                <FormErrorMessage>{errors.membershipExpDate}</FormErrorMessage>
              </FormControl>
            </>
          }

          // .. Remaining Props ...................................................
          performOperationString='Actualizar'
          performAnotherOperationString=''/*no other operation besides updating*/
          isPerformingOperation={isUpdatingLibraryUser}
          hasPerformedOperation={false/*ensures update button is always available*/}
          isObjectDeleted={false/*cannot delete libraryUsers, only update their membership*/}
        />
      </CenterLayout>
    </AppLayout>
  );
};

export default ActualizarUsuario;
