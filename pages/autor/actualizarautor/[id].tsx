import { Author, User } from '@prisma/client';
import { useToast, FormControl, FormErrorMessage, FormLabel, IconButton, Text, Center, Tooltip } from '@chakra-ui/react';
import { Field, FormikHelpers } from 'formik';
import type { GetServerSideProps, NextPage } from 'next';
import { getSession } from 'next-auth/react';
import Router from 'next/router';
import { useState } from 'react';
import { BsTrash } from 'react-icons/bs';

import { AppLayout, CenterLayout } from 'ui';
import { prisma } from 'db';
import { createCommonInputTextFieldProps, deleteObjectUIProcess, redirectToLoginObject, GeneralForm, GeneralModal, AUTOR, TOAST_DURATION, TOAST_POSITION, VER_AUTORES } from 'general';
import { isValidSession, parseObjectFromServer, patchAuthor, logRequestError, deleteAuthor } from 'request';
import { authorSchema } from 'schema';

// ********************************************************************************
// == Type ========================================================================
type UpdateAuthorFormValues = Pick<Author, 'name'>

// == Interface ===================================================================
interface UpdateAuthorProps {
  user: User;
  author: Author;
}
// == Server Side =================================================================
export const getServerSideProps: GetServerSideProps<UpdateAuthorProps> = async (context) => {
  // -- Validation ----------------------------------------------------------------
  const session = await getSession(context);
  if(!isValidSession(session)) return redirectToLoginObject/*redirect to login if not authed*/;

  // -- Query ---------------------------------------------------------------------
  const authorId = context.query.id;
  if(typeof authorId !== 'string') throw new Error(`Received wrong query id: ${authorId}`);

  const appUser = await prisma.user.findUnique({ where: { email: session.user.email } }),
    author = await prisma.author.findUnique({ where: { id: authorId } });

  // -- Returned Props ------------------------------------------------------------
  return {
    props: {
      user: parseObjectFromServer(appUser),
      author: parseObjectFromServer(author),
    }
  };
};

// == Client Side =================================================================
const ActualizarAutor: NextPage<UpdateAuthorProps> = ({ user, author }) => {
  const toast = useToast();

  // -- State ---------------------------------------------------------------------
  const [currentAuthor, setCurrentAuthor] = useState(author);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isUpdatingAuthor, setIsUpdatingAuthor] = useState(false);
  const [isAuthorDeleted, setIsAuthorDeleted] = useState(false);

  // -- Handler -------------------------------------------------------------------
  const handleSubmit = async (values: UpdateAuthorFormValues, formikHelpers: FormikHelpers<UpdateAuthorFormValues>) => {
    const { name } = values;
    if(name === currentAuthor.name) {
      toast({ title: 'Mismo valor encontrado, actualización cancelada.', status: 'info', duration: TOAST_DURATION, position: TOAST_POSITION });
      return;
    }/* else -- different name */
    try {
      setIsUpdatingAuthor(true);
      toast({ title: 'Actualizando Autor...', status: 'info', duration: TOAST_DURATION, position: TOAST_POSITION });

      const data = await patchAuthor({ authorId: currentAuthor.id, authorName: name });
      if(!data || !data.requestedAuthor || data.requestedAuthor.name !== name)
        throw new Error('There was an error while updating the author');
      /* else -- successful update */

      toast({ title: 'Autor actualizado exitosamente', status: 'success', duration: TOAST_DURATION, position: TOAST_POSITION });
      setCurrentAuthor(data.requestedAuthor);
      return;
    } catch (error) {
      logRequestError(error, 'Updating Author');
      toast({ title: 'Ocurrió un error mientras se actualizaba al autor...', status: 'error', duration: TOAST_DURATION, position: TOAST_POSITION });
    } finally {
      setIsUpdatingAuthor(false);
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
        <GeneralForm<UpdateAuthorFormValues>
          initialValues={{ name: currentAuthor.name }}
          validationSchema={authorSchema}

          // .. Submit Handler ....................................................
          onSubmitHandler={handleSubmit}

          // .. Render Function ...................................................
          renderFormFunction={(errors, touched, setFieldValue) =>
            <>
              <Center width='full'>
                <Text as='strong'>Actualizar Autor</Text>
                <Tooltip label='Eliminar Autor'>
                  <IconButton icon={<BsTrash />} marginLeft='auto' isDisabled={isAuthorDeleted} aria-label='deleteAuthor' onClick={() => setShowDeleteModal(true)} />
                </Tooltip>
              </Center>

              {/* .. Name ................................................... */}
              <FormControl isInvalid={!!errors.name && touched.name}>
                <FormLabel htmlFor='author-name'>
                  Nombre del Autor
                </FormLabel>
                <Field
                  id='author-name'
                  name='name'
                  placeholder='Nombre del Autor'
                  {...createCommonInputTextFieldProps(isUpdatingAuthor || isAuthorDeleted)}
                />
                <FormErrorMessage>{errors.name}</FormErrorMessage>
              </FormControl>
            </>
          }

          // .. Remaining Props ...................................................
          performOperationString='Actualizar'
          performAnotherOperationString='Regresando...'
          isPerformingOperation={isUpdatingAuthor}
          hasPerformedOperation={isAuthorDeleted}
          isObjectDeleted={isAuthorDeleted}
        />

        {/* .. Modal .......................................................... */}
        <GeneralModal
          modalTitle='Eliminar Autor'
          bodyString='¿Estás seguro de que quieres eliminar a este autor? Esta acción no puede ser deshecha.'
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          buttons={
            [
              {
                text: 'Cancelar',
                onClick: () => setShowDeleteModal(false),
                isDisabled: isUpdatingAuthor || isAuthorDeleted/*disable while updating or on deleted*/,
                isLoading: false/*cancel should not be loading*/,
              },
              {
                text: 'Eliminar',
                onClick: async () => await deleteObjectUIProcess(
                  {
                    deletedObjectName: 'Autor',
                    isUpdatingCallback: setIsUpdatingAuthor,
                    toast: toast,
                    deleteCallback: async () => await deleteAuthor({ deletedAuthorId: currentAuthor.id }),
                    replaceRouteCallback: () => Router.replace(`/${AUTOR}/${VER_AUTORES}`),
                    setShowDeleteModalCallback: setShowDeleteModal,
                    setIsObjectDeletedCallback: setIsAuthorDeleted,
                  }
                ),
                isDisabled: isUpdatingAuthor || isAuthorDeleted,
                isLoading: isUpdatingAuthor,
              },
            ]
          }
        />
      </CenterLayout>
    </AppLayout>
  );
};

export default ActualizarAutor;

