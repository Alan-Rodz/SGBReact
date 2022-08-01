import { useToast, FormControl, FormErrorMessage, FormLabel, Text } from '@chakra-ui/react';
import { Author, Genre } from '@prisma/client';
import { Field, FormikHelpers } from 'formik';
import type { GetServerSideProps, NextPage } from 'next';
import { useState } from 'react';

import { createCommonInputDateFieldProps, createCommonInputTextFieldProps, createCommonSelectFieldProps, stringTranslator, GeneralForm, GeneralLookUpModal, DEFAULT_DATE, TOAST_DURATION, TOAST_POSITION } from 'general';
import { chooseAuthor, getUserFromContext, logRequestError, lookForAuthor, postBook, UserPageProps } from 'request';
import { bookSchema } from 'schema';
import { AppLayout, CenterLayout } from 'ui';

// ********************************************************************************
// == Interface ===================================================================
interface RegisterBookFormValues {
  [key: string]: string;
  authorName: string;
  genre: Genre;
  name: string;
  releaseDate: string;
}

// == Server Side =================================================================
export const getServerSideProps: GetServerSideProps<UserPageProps> = async (context) => getUserFromContext(context);

// == Client Side =================================================================
const RegistrarLibro: NextPage<UserPageProps> = ({ user }) => {
  const toast = useToast();

  // -- State ---------------------------------------------------------------------
  const [bookAuthor, setBookAuthor] = useState<Author | undefined/*not fetched yet*/>(undefined);
  const [showAuthorLookUpModal, setShowAuthorLookUpModal] = useState(false);
  const [isPostingBook, setIsPostingBook] = useState(false);
  const [hasPostedBook, setHasPostedBook] = useState(false);

  // -- Handler -------------------------------------------------------------------
  const handleSubmit = async (values: RegisterBookFormValues, formikHelpers: FormikHelpers<RegisterBookFormValues>) => {
    if(!bookAuthor) {
      toast({ title: 'Se debe ingresar un autor válido para el libro.', status: 'info', duration: TOAST_DURATION, position: TOAST_POSITION });
      return;
    }/* else -- author set */

    try {
      setIsPostingBook(true);
      toast({ title: 'Registrando Libro...', status: 'info', duration: TOAST_DURATION, position: TOAST_POSITION });

      const data = await postBook({ 
        authorId: bookAuthor.id, 
        bookId: undefined/*not querying for a book*/, 
        bookGenre: values.genre,
        bookName: values.name, 
        bookReleaseDate: new Date(values.releaseDate),

      });
      if(!data || !data.requestedBook || data.requestedBook.name !== values.name)
        throw new Error('There was an error while registering the book');
      /* else -- successful registering */

      toast({ title: 'Libro registrado exitosamente', status: 'success', duration: TOAST_DURATION, position: TOAST_POSITION });
      setHasPostedBook(true);
    } catch (error) {
      logRequestError(error, 'Posting Book');
      toast({ title: 'Ocurrió un error mientras se registraba el libro...', status: 'error', duration: TOAST_DURATION, position: TOAST_POSITION });
    } finally {
      setIsPostingBook(false);
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
        <GeneralForm<RegisterBookFormValues>
          initialValues={{ genre: Genre.LITERARY/*default*/, name: '', releaseDate: DEFAULT_DATE, authorName: '' }}
          validationSchema={bookSchema}

          // .. Submit Handler ....................................................
          onSubmitHandler={handleSubmit}

          // .. Render Function ...................................................
          renderFormFunction={(errors, touched, setFieldValue) => 
            <>
              <Text as='strong'>Registrar Libro</Text>

              {/* .. Author Name .............................................. */}
              <FormControl isInvalid={!!errors.authorName && touched.authorName}>
                <FormLabel htmlFor='book-authorName'>Nombre del Autor</FormLabel>
                <Field
                  id='book-authorName'
                  name='authorName'
                  placeholder='Nombre del Autor'
                  isReadOnly
                  onClick={() => setShowAuthorLookUpModal(true)}
                  {...createCommonInputTextFieldProps(isPostingBook || hasPostedBook)}
                />
                <FormErrorMessage>{errors.authorName}</FormErrorMessage>
                <GeneralLookUpModal<Author>
                  modalTitle='Escoger Autor'
                  inputPlaceholder='Buscar Autor'
                  keyToShow={'name'}
                  isOpen={showAuthorLookUpModal}
                  inputValueChangeCallback={lookForAuthor}
                  chosenObjectCallback={(chosenAuthor)=> chooseAuthor(chosenAuthor, setShowAuthorLookUpModal, setBookAuthor, setFieldValue)}
                  onClose={() => setShowAuthorLookUpModal(false)}
                />
              </FormControl>

              {/* .. Genre .................................................... */}
              <FormControl isInvalid={!!errors.genre && touched.genre}>
                <FormLabel htmlFor='book-genre'>
                  Género del Libro
                </FormLabel>
                <Field
                  id='book-genre'
                  name='genre'
                  {...createCommonSelectFieldProps(isPostingBook || hasPostedBook)}
                >
                  {Object.keys(Genre).map((genre, genreIndex) => <option key={genreIndex} value={genre}>{stringTranslator.book.genre[genre]}</option>)}
                </Field>
                <FormErrorMessage>{errors.genre}</FormErrorMessage>
              </FormControl>

              {/* .. Name ................................................... */}
              <FormControl isInvalid={!!errors.name && touched.name}>
                <FormLabel htmlFor='book-name'>Nombre del Libro</FormLabel>
                <Field
                  id='book-name'
                  name='name'
                  placeholder='Nombre del Libro'
                  {...createCommonInputTextFieldProps(isPostingBook || hasPostedBook)}
                />
                <FormErrorMessage>{errors.name}</FormErrorMessage>
              </FormControl>

              {/* .. Release Date ............................................. */}
              <FormControl isInvalid={!!errors.releaseDate && touched.releaseDate}>
                <FormLabel htmlFor='book-releaseDate'>Fecha de la Primera Publicación del Libro</FormLabel>
                <Field
                  id='book-releaseDate'
                  name='releaseDate'
                  {...createCommonInputDateFieldProps(isPostingBook || hasPostedBook)}
                />
                <FormErrorMessage>{errors.releaseDate}</FormErrorMessage>
              </FormControl>
            </>
          }

          // .. Remaining Props ...................................................
          performOperationString='Registrar Libro'
          performAnotherOperationString='Registrar otro Libro'
          isPerformingOperation={isPostingBook}
          hasPerformedOperation={hasPostedBook}
          isObjectDeleted={false/*object cannot ever be deleted when registering a book*/}
        />
      </CenterLayout>
    </AppLayout>
  );
};

export default RegistrarLibro;
