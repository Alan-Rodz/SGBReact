import { useToast, FormControl, FormErrorMessage, FormLabel, Text } from '@chakra-ui/react';
import { Book } from '@prisma/client';
import { Field, FormikHelpers } from 'formik';
import type { GetServerSideProps, NextPage } from 'next';
import { useState } from 'react';

import { AppLayout, CenterLayout } from 'ui';
import { createCommonInputTextFieldProps, createCommonNumberTextFieldProps, GeneralForm, GeneralLookUpModal, TOAST_DURATION, TOAST_POSITION } from 'general';
import { getUserFromContext, postBookCopy, logRequestError, getBooks, UserPageProps } from 'request';
import { bookCopySchema } from 'schema';
import { SetFieldValueType } from 'type';

// ********************************************************************************
// == Interface ===================================================================
interface RegisterBookCopyFormValues {
  [key: string]: string | number;
  bookName: string;
  edition: string;
  pages: number;
  publisher: string;
  quantityInStock: number;
  priceMXN: number;
}

// == Server Side =================================================================
export const getServerSideProps: GetServerSideProps<UserPageProps> = async (context) => getUserFromContext(context);

// == Client Side =================================================================
const RegistrarEjemplar: NextPage<UserPageProps> = ({ user }) => {
  const toast = useToast();

  // -- State ---------------------------------------------------------------------
  const [book, setBook] = useState<Book | undefined/*not fetched yet*/>(undefined);
  const [showBookLookUpModal, setShowBookLookUpModal] = useState(false);
  const [isPostingBookCopy, setIsPostingBookCopy] = useState(false);
  const [hasPostedBookCopy, setHasPostedBookCopy] = useState(false);

  // -- Handler -------------------------------------------------------------------
  const handleSubmit = async (values: RegisterBookCopyFormValues, formikHelpers: FormikHelpers<RegisterBookCopyFormValues>) => {
    if(!book) {
      toast({ title: 'Se debe ingresar un libro válido para el ejemplar.', status: 'info', duration: TOAST_DURATION, position: TOAST_POSITION });
      return;
    }/* else -- author set */

    try {
      setIsPostingBookCopy(true);
      toast({ title: 'Registrando Libro...', status: 'info', duration: TOAST_DURATION, position: TOAST_POSITION });

      const data = await postBookCopy({ 
        id: ''/*creating a new one, no id given*/,
        bookId: book.id,
        edition: values.edition,
        pages: values.pages,
        publisher: values.publisher,
        quantityInStock: values.quantityInStock,
        priceMXN: values.priceMXN
      });
      if(!data || !data.requestedBookCopy || data.requestedBookCopy.bookId !== book.id)
        throw new Error('There was an error while registering the bookCopy');
      /* else -- successful registering */

      toast({ title: 'Ejemplar registrado exitosamente', status: 'success', duration: TOAST_DURATION, position: TOAST_POSITION });
      setHasPostedBookCopy(true);
    } catch (error) {
      logRequestError(error, 'Posting BookCopy');
      toast({ title: 'Ocurrió un error mientras se registraba el ejemplar...', status: 'error', duration: TOAST_DURATION, position: TOAST_POSITION });
    } finally {
      setIsPostingBookCopy(false);
    }
  }

  const lookForNonTransformedBooks = async (bookNameStartsWith: string) => {
    const data = await getBooks({ requestedBookNameStartsWith: bookNameStartsWith, requestedBooksPage: ''/*not requesting a page*/, })
    if(!data || !data.requestedBooks) {
      return [];
    } /* else -- authors found  */
    return data.requestedBooks;
  }

  const chooseBook = (chosenBook: Book, setFieldValue: SetFieldValueType) => { 
    setShowBookLookUpModal(false); 
    setBook(chosenBook); 
    setFieldValue('bookName', chosenBook.name, true/*validate*/);
  }

  // -- UI ------------------------------------------------------------------------
  return (
    <AppLayout
      userId={user.id}
      userIMG={user.image}
      employeeLevel={user.employeeLevel}
    >
      <CenterLayout>
        <GeneralForm<RegisterBookCopyFormValues>
          initialValues={{ bookName: '',edition: '', pages: 0, publisher: '', quantityInStock: 0, priceMXN: 0 }}
          validationSchema={bookCopySchema}

          // .. Submit Handler ....................................................
          onSubmitHandler={handleSubmit}

          // .. Render Function ...................................................
          renderFormFunction={(errors, touched, setFieldValue) => 
            <>
              <Text as='strong'>Registrar Ejemplar</Text>

              {/* .. Book Name .............................................. */}
              <FormControl isInvalid={!!errors.bookName && touched.bookName}>
                <FormLabel htmlFor='book-bookName'>Nombre del Libro</FormLabel>
                <Field
                  id='book-bookName'
                  name='bookName'
                  placeholder='Nombre del Libro'
                  isReadOnly
                  onClick={() => setShowBookLookUpModal(true)}
                  {...createCommonInputTextFieldProps(isPostingBookCopy || hasPostedBookCopy)}
                />
                <FormErrorMessage>{errors.bookName}</FormErrorMessage>
                <GeneralLookUpModal<Book>
                  modalTitle='Escoger Libro'
                  inputPlaceholder='Buscar Libro'
                  keyToShow={'name'}
                  isOpen={showBookLookUpModal}
                  inputValueChangeCallback={lookForNonTransformedBooks}
                  chosenObjectCallback={(chosenBook) => chooseBook(chosenBook, setFieldValue)}
                  onClose={() => setShowBookLookUpModal(false)}
                />
              </FormControl>

              {/* .. Edition .................................................. */}
              <FormControl isInvalid={!!errors.edition && touched.edition}>
                <FormLabel htmlFor='book-edition'>Edición del Libro</FormLabel>
                <Field
                  id='book-edition'
                  name='edition'
                  {...createCommonInputTextFieldProps(isPostingBookCopy || hasPostedBookCopy)}
                />
                <FormErrorMessage>{errors.edition}</FormErrorMessage>
              </FormControl>

              {/* .. Pages .................................................... */}
              <FormControl isInvalid={!!errors.pages && touched.pages}>
                <FormLabel htmlFor='book-pages'>Cantidad de Páginas</FormLabel>
                <Field
                  id='book-pages'
                  name='pages'
                  {...createCommonNumberTextFieldProps(isPostingBookCopy || hasPostedBookCopy)}
                />
                <FormErrorMessage>{errors.pages}</FormErrorMessage>
              </FormControl>

              {/* .. Publisher ................................................ */}
              <FormControl isInvalid={!!errors.publisher && touched.publisher}>
                <FormLabel htmlFor='book-publisher'>Editorial</FormLabel>
                <Field
                  id='book-publisher'
                  name='publisher'
                  {...createCommonInputTextFieldProps(isPostingBookCopy || hasPostedBookCopy)}
                />
                <FormErrorMessage>{errors.publisher}</FormErrorMessage>
              </FormControl>

              {/* .. Quantity In Stock ........................................ */}
              <FormControl isInvalid={!!errors.quantityInStock && touched.quantityInStock}>
                <FormLabel htmlFor='book-quantityInStock'>Cantidad en Inventario</FormLabel>
                <Field
                  id='book-quantityInStock'
                  name='quantityInStock'
                  {...createCommonNumberTextFieldProps(isPostingBookCopy || hasPostedBookCopy)}
                />
                <FormErrorMessage>{errors.quantityInStock}</FormErrorMessage>
              </FormControl>

              {/* .. Price .................................................... */}
              <FormControl isInvalid={!!errors.priceMXN && touched.priceMXN}>
                <FormLabel htmlFor='book-priceMXN'>Precio (MXN)</FormLabel>
                <Field
                  id='book-priceMXN'
                  name='priceMXN'
                  {...createCommonNumberTextFieldProps(isPostingBookCopy || hasPostedBookCopy)}
                />
                <FormErrorMessage>{errors.priceMXN}</FormErrorMessage>
              </FormControl>
            </>
          }

          // .. Remaining Props ...................................................
          performOperationString='Registrar Ejemplar'
          performAnotherOperationString='Registrar otro Ejemplar'
          isPerformingOperation={isPostingBookCopy}
          hasPerformedOperation={hasPostedBookCopy}
          isObjectDeleted={false/*object cannot ever be deleted when registering a bookCopy*/}
        />
      </CenterLayout>
    </AppLayout>
  );
};

export default RegistrarEjemplar;
