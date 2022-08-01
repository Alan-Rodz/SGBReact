import { useToast, FormControl, FormErrorMessage, FormLabel, Text } from '@chakra-ui/react';
import { Field, FormikHelpers } from 'formik';
import type { GetServerSideProps, NextPage } from 'next';
import { useState } from 'react';

import { AppLayout, CenterLayout } from 'ui';
import { createCommonInputTextFieldProps, GeneralForm, TOAST_DURATION, TOAST_POSITION } from 'general';
import { getUserFromContext, postAuthor, logRequestError, UserPageProps } from 'request';
import { authorSchema } from 'schema';

// ********************************************************************************
// == Interface ===================================================================
interface RegisterAuthorFormValues {
  [key: string]: string;
  name: string;
}

// == Server Side =================================================================
export const getServerSideProps: GetServerSideProps<UserPageProps> = async (context) => getUserFromContext(context);

// == Client Side =================================================================
const RegistrarAutor: NextPage<UserPageProps> = ({ user }) => {
  const toast = useToast();

  // -- State ---------------------------------------------------------------------
  const [isPostingAuthor, setIsPostingAuthor] = useState(false);
  const [hasPostedAuthor, setHasPostedAuthor] = useState(false);

  // -- Handler -------------------------------------------------------------------
  const handleSubmit = async (values: RegisterAuthorFormValues, formikHelpers: FormikHelpers<RegisterAuthorFormValues>) => {
    try {
      const { name } = values;
      setIsPostingAuthor(true);
      toast({ title: 'Registrando Autor...', status: 'info', duration: TOAST_DURATION, position: TOAST_POSITION });

      const data = await postAuthor({ authorId: undefined/*creating a new author*/, authorName: name });
      if(!data || !data.requestedAuthor || data.requestedAuthor.name !== name)
        throw new Error('There was an error while registering the author');
      /* else -- successful registering */

      toast({ title: 'Autor registrado exitosamente', status: 'success', duration: TOAST_DURATION, position: TOAST_POSITION });
      setHasPostedAuthor(true);
    } catch (error) {
      logRequestError(error, 'Posting Author');
      toast({ title: 'Ocurrió un error mientras se registraba al autor...', status: 'error', duration: TOAST_DURATION, position: TOAST_POSITION });
    } finally {
      setIsPostingAuthor(false);
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
        <GeneralForm<RegisterAuthorFormValues>
          initialValues={{ name: '' }}
          validationSchema={authorSchema}

          // .. Submit Handler ....................................................
          onSubmitHandler={handleSubmit}

          // .. Render Function ...................................................
          renderFormFunction={(errors, touched, setFieldValue) =>
            <>
              <Text as='strong'>Registrar Autor</Text>
              <FormControl isInvalid={!!errors.name && touched.name}>
                <FormLabel htmlFor='author-name'>Nombre del Autor</FormLabel>
                <Field
                  id='author-name'
                  name='name'
                  placeholder='Nombre del Autor'
                  {...createCommonInputTextFieldProps(isPostingAuthor || hasPostedAuthor)}
                />
                <FormErrorMessage>{errors.name}</FormErrorMessage>
              </FormControl>
            </>
          }

          // .. Remaining Props ...................................................
          performOperationString='Registrar Autor'
          performAnotherOperationString='Registrar otro Autor'
          isPerformingOperation={isPostingAuthor}
          hasPerformedOperation={hasPostedAuthor}
          isObjectDeleted={false/*object cannot ever be deleted when registering an author*/}
        />
      </CenterLayout>
    </AppLayout>
  );
};

export default RegistrarAutor;
