import { Book, BookCopy, User } from '@prisma/client';
import { useToast, FormControl, FormErrorMessage, FormLabel, IconButton, Text, Center, Tooltip } from '@chakra-ui/react';
import { Field, FormikHelpers } from 'formik';
import type { GetServerSideProps, NextPage } from 'next';
import { getSession } from 'next-auth/react';
import Router from 'next/router';
import { useState } from 'react';
import { BsTrash } from 'react-icons/bs';

import { AppLayout, CenterLayout } from 'ui';
import { prisma } from 'db';
import { createCommonInputTextFieldProps, createCommonNumberTextFieldProps, deleteObjectUIProcess, redirectToLoginObject, objectsHaveSameValues, GeneralForm, GeneralModal, TOAST_DURATION, TOAST_POSITION, EJEMPLAR, VER_EJEMPLARES } from 'general';
import { isValidSession, parseObjectFromServer, patchBookCopy, logRequestError, deleteBookCopy } from 'request';
import { bookCopySchema } from 'schema';

// ********************************************************************************
// == Type ========================================================================
type UpdateBookCopyFormValues = Omit<BookCopy, 'id' | 'createdAt' | 'updatedAt' | 'bookId'> & { bookName: string; };

// == Interface ===================================================================
interface UpdateBookProps {
  user: User;
  bookCopy: BookCopy;
  book: Book;
}
// == Server Side =================================================================
export const getServerSideProps: GetServerSideProps<UpdateBookProps> = async (context) => {
  // -- Validation ----------------------------------------------------------------
  const session = await getSession(context);
  if(!isValidSession(session)) return redirectToLoginObject/*redirect to login if not authed*/;

  // -- Query ---------------------------------------------------------------------
  const bookCopyId = context.query.id;
  if(typeof bookCopyId !== 'string') throw new Error(`Received wrong query id: ${bookCopyId}`);

  const appUser = await prisma.user.findUnique({ where: { email: session.user.email } }),
    bookCopy = await prisma.bookCopy.findUnique({ where: { id: bookCopyId }, include: { book: true } });

  // -- Returned Props ------------------------------------------------------------
  return {
    props: {
      user: parseObjectFromServer(appUser),
      bookCopy: parseObjectFromServer(bookCopy),
      book: parseObjectFromServer(bookCopy?.book),
    }
  };
};

// == Client Side =================================================================
const ActualizarEjemplar: NextPage<UpdateBookProps> = ({ user, bookCopy, book }) => {
  const toast = useToast();

  // -- State ---------------------------------------------------------------------
  const [currentBookCopy, setCurrentBookCopy] = useState<BookCopy>(bookCopy);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isUpdatingBookCopy, setIsUpdatingBookCopy] = useState(false);
  const [isBookCopyDeleted, setIsBookCopyDeleted] = useState(false);

  // -- Handler -------------------------------------------------------------------
  const handleSubmit = async (values: UpdateBookCopyFormValues, formikHelpers: FormikHelpers<UpdateBookCopyFormValues>) => {
    if(objectsHaveSameValues<UpdateBookCopyFormValues>(
      values,
      { ...currentBookCopy, bookName: book.name },
      ['edition', 'pages', 'publisher', 'quantityInStock', 'priceMXN'])) {
      toast({ title: 'Mismos valores encontrados, actualización cancelada.', status: 'info', duration: TOAST_DURATION, position: TOAST_POSITION });
      return;
    }/* else -- different values */
    try {
      setIsUpdatingBookCopy(true);
      toast({ title: 'Actualizando Ejemplar...', status: 'info', duration: TOAST_DURATION, position: TOAST_POSITION });

      const data = await patchBookCopy({
        id: currentBookCopy.id,
        bookId: currentBookCopy.bookId,
        edition: values.edition,
        pages: values.pages,
        publisher: values.publisher,
        quantityInStock: values.quantityInStock,
        priceMXN: values.priceMXN
      });
      if(!data || !data.requestedBookCopy || data.requestedBookCopy.edition !== values.edition) {
        throw new Error('There was an error while updating the bookCopy');
      }/* else -- successful update */

      toast({ title: 'Ejemplar actualizado exitosamente', status: 'success', duration: TOAST_DURATION, position: TOAST_POSITION });
      setCurrentBookCopy(data.requestedBookCopy);
      return;
    } catch (error) {
      logRequestError(error, 'Updating BookCopy');
      toast({ title: 'Ocurrió un error mientras se actualizaba el ejemplar...', status: 'error', duration: TOAST_DURATION, position: TOAST_POSITION });
    } finally {
      setIsUpdatingBookCopy(false);
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
        <GeneralForm<UpdateBookCopyFormValues>
          initialValues={{ bookName: book.name, edition: bookCopy.edition, pages: bookCopy.pages, publisher: bookCopy.publisher, quantityInStock: bookCopy.quantityInStock, priceMXN: bookCopy.priceMXN }}
          validationSchema={bookCopySchema}

          // .. Submit Handler ....................................................
          onSubmitHandler={handleSubmit}

          // .. Render Function ...................................................
          renderFormFunction={(errors, touched, setFieldValue) =>
            <>
              <Center width='full'>
                <Text as='strong'>Actualizar Ejemplar</Text>
                <Tooltip label='Eliminar Ejemplar'>
                  <IconButton icon={<BsTrash />} marginLeft='auto' isDisabled={isBookCopyDeleted} aria-label='deleteBook' onClick={() => setShowDeleteModal(true)} />
                </Tooltip>
              </Center>


              {/* .. Book Name .............................................. */}
              <FormControl isInvalid={!!errors.bookName && touched.bookName}>
                <FormLabel htmlFor='book-bookName'>Nombre del Libro</FormLabel>
                <Field
                  id='book-bookName'
                  name='bookName'
                  {...createCommonInputTextFieldProps(true/*field cannot be modified*/)}
                />
                <FormErrorMessage>{errors.bookName}</FormErrorMessage>
              </FormControl>

              {/* .. Edition .................................................. */}
              <FormControl isInvalid={!!errors.edition && touched.edition}>
                <FormLabel htmlFor='book-edition'>Edición del Libro</FormLabel>
                <Field
                  id='book-edition'
                  name='edition'
                  {...createCommonInputTextFieldProps(isUpdatingBookCopy || isBookCopyDeleted)}
                />
                <FormErrorMessage>{errors.edition}</FormErrorMessage>
              </FormControl>

              {/* .. Pages .................................................... */}
              <FormControl isInvalid={!!errors.pages && touched.pages}>
                <FormLabel htmlFor='book-pages'>Cantidad de Páginas</FormLabel>
                <Field
                  id='book-pages'
                  name='pages'
                  {...createCommonNumberTextFieldProps(isUpdatingBookCopy || isBookCopyDeleted)}
                />
                <FormErrorMessage>{errors.pages}</FormErrorMessage>
              </FormControl>

              {/* .. Publisher ................................................ */}
              <FormControl isInvalid={!!errors.publisher && touched.publisher}>
                <FormLabel htmlFor='book-publisher'>Editorial</FormLabel>
                <Field
                  id='book-publisher'
                  name='publisher'
                  {...createCommonInputTextFieldProps(isUpdatingBookCopy || isBookCopyDeleted)}
                />
                <FormErrorMessage>{errors.publisher}</FormErrorMessage>
              </FormControl>

              {/* .. Quantity In Stock ........................................ */}
              <FormControl isInvalid={!!errors.quantityInStock && touched.quantityInStock}>
                <FormLabel htmlFor='book-quantityInStock'>Cantidad en Inventario</FormLabel>
                <Field
                  id='book-quantityInStock'
                  name='quantityInStock'
                  {...createCommonNumberTextFieldProps(isUpdatingBookCopy || isBookCopyDeleted)}
                />
                <FormErrorMessage>{errors.quantityInStock}</FormErrorMessage>
              </FormControl>

              {/* .. Price .................................................... */}
              <FormControl isInvalid={!!errors.priceMXN && touched.priceMXN}>
                <FormLabel htmlFor='book-priceMXN'>Precio (MXN)</FormLabel>
                <Field
                  id='book-priceMXN'
                  name='priceMXN'
                  {...createCommonNumberTextFieldProps(isUpdatingBookCopy || isBookCopyDeleted)}
                />
                <FormErrorMessage>{errors.priceMXN}</FormErrorMessage>
              </FormControl>
            </>
          }

          // .. Remaining Props ...................................................
          performOperationString='Actualizar'
          performAnotherOperationString='Regresando...'
          isPerformingOperation={isUpdatingBookCopy}
          hasPerformedOperation={isBookCopyDeleted}
          isObjectDeleted={isBookCopyDeleted}
        />

        {/* .. Modal .......................................................... */}
        <GeneralModal
          modalTitle='Eliminar Ejemplar'
          bodyString='¿Estás seguro de que quieres eliminar este ejemplar? Esta acción no puede ser deshecha.'
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          buttons={
            [
              {
                text: 'Cancelar',
                onClick: () => setShowDeleteModal(false),
                isDisabled: isUpdatingBookCopy || isBookCopyDeleted/*disable while updating or on deleted*/,
                isLoading: false/*cancel should not be loading*/,
              },
              {
                text: 'Eliminar',
                onClick: async () => await deleteObjectUIProcess(
                  {
                    deletedObjectName: 'Ejemplar',
                    isUpdatingCallback: setIsUpdatingBookCopy,
                    toast: toast,
                    deleteCallback: async () => await deleteBookCopy({ deletedBookCopyId: currentBookCopy.id }),
                    replaceRouteCallback: () => Router.replace(`/${EJEMPLAR}/${VER_EJEMPLARES}`),
                    setShowDeleteModalCallback: setShowDeleteModal,
                    setIsObjectDeletedCallback: setIsBookCopyDeleted,
                  }
                ),
                isDisabled: isUpdatingBookCopy || isBookCopyDeleted,
                isLoading: isUpdatingBookCopy,
              },
            ]
          }
        />
      </CenterLayout>
    </AppLayout>
  );
};

export default ActualizarEjemplar;
