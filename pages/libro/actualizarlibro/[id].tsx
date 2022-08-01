import { Author, Book, Genre, User } from '@prisma/client';
import { useToast, FormControl, FormErrorMessage, FormLabel, IconButton, Text, Center, Tooltip } from '@chakra-ui/react';
import { Field, FormikHelpers } from 'formik';
import type { GetServerSideProps, NextPage } from 'next';
import { getSession } from 'next-auth/react';
import Router from 'next/router';
import { useState } from 'react';
import { BsTrash } from 'react-icons/bs';

import { prisma } from 'db';
import { createCommonInputDateFieldProps, createCommonSelectFieldProps, createCommonInputTextFieldProps, dateToISOString, deleteObjectUIProcess, redirectToLoginObject, objectsHaveSameValues, stringTranslator, GeneralForm, GeneralLookUpModal, GeneralModal, NOT_AVAILABLE, TOAST_DURATION, TOAST_POSITION, LIBRO, VER_LIBROS } from 'general';
import { chooseAuthor, deleteBook, isValidSession, logRequestError, lookForAuthor, parseObjectFromServer, patchBook } from 'request';
import { authorSchema } from 'schema';
import { AppLayout, CenterLayout } from 'ui';

// ********************************************************************************
// == Type ========================================================================
type UpdateBookFormValues = Omit<Book, 'id' | 'createdAt' | 'updatedAt' | 'authorId' | 'releaseDate'> & {
  authorName: string;
  releaseDate: string;
}

// == Interface ===================================================================
interface UpdateBookProps {
  user: User;
  book: Book;
  bookAuthor: Author;
}
// == Server Side =================================================================
export const getServerSideProps: GetServerSideProps<UpdateBookProps> = async (context) => {
  // -- Validation ----------------------------------------------------------------
  const session = await getSession(context);
  if(!isValidSession(session)) return redirectToLoginObject/*redirect to login if not authed*/;

  // -- Query ---------------------------------------------------------------------
  const bookId = context.query.id;
  if(typeof bookId !== 'string') throw new Error(`Received wrong query id: ${bookId}`);

  const appUser = await prisma.user.findUnique({ where: { email: session.user.email } }),
    book = await prisma.book.findUnique({ where: { id: bookId } }),
    bookAuthor = await prisma.author.findUnique({ where: { id: book?.authorId } });

  // -- Returned Props ------------------------------------------------------------
  return {
    props: {
      user: parseObjectFromServer(appUser),
      book: parseObjectFromServer(book),
      bookAuthor: parseObjectFromServer(bookAuthor),
    }
  };
};

// == Client Side =================================================================
const ActualizarLibro: NextPage<UpdateBookProps> = ({ user, book, bookAuthor: initialBookAuthor }) => {
  const toast = useToast();
  if(!initialBookAuthor)
    throw new Error('Book does not have an author when it should');

  // -- State ---------------------------------------------------------------------
  const [currentBook, setCurrentBook] = useState<Book>(book);
  const [currentBookAuthor, setCurrentBookAuthor] = useState<Author | undefined/*not set yet*/>(initialBookAuthor);
  const [showAuthorLookUpModal, setShowAuthorLookUpModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isUpdatingBook, setIsUpdatingBook] = useState(false);
  const [isBookDeleted, setIsBookDeleted] = useState(false);

  // -- Handler -------------------------------------------------------------------
  const handleSubmit = async (values: UpdateBookFormValues, formikHelpers: FormikHelpers<UpdateBookFormValues>) => {
    if(!currentBookAuthor) return/*not defined yet*/;

    const { name } = values;
    if(objectsHaveSameValues<UpdateBookFormValues>(
      values,
      {
        ...currentBook,
        authorName: currentBookAuthor.name,
        releaseDate: dateToISOString(new Date(currentBook.releaseDate)),
      },
      ['authorName', 'genre', 'name', 'releaseDate'])) {
      toast({ title: 'Mismos valores encontrados, actualización cancelada.', status: 'info', duration: TOAST_DURATION, position: TOAST_POSITION });
      return;
    }/* else -- different values */
    try {
      setIsUpdatingBook(true);
      toast({ title: 'Actualizando Libro...', status: 'info', duration: TOAST_DURATION, position: TOAST_POSITION });

      const data = await patchBook({ authorId: currentBookAuthor.id, bookId: currentBook.id, bookGenre: values.genre, bookName: values.name, bookReleaseDate: new Date(values.releaseDate) });
      if(!data || !data.requestedBook || data.requestedBook.name !== name)
        throw new Error('There was an error while updating the book');
      /* else -- successful update */

      toast({ title: 'Libro actualizado exitosamente', status: 'success', duration: TOAST_DURATION, position: TOAST_POSITION });
      setCurrentBook(data.requestedBook);
      return;
    } catch (error) {
      logRequestError(error, 'Updating Book');
      toast({ title: 'Ocurrió un error mientras se actualizaba el libro...', status: 'error', duration: TOAST_DURATION, position: TOAST_POSITION });
    } finally {
      setIsUpdatingBook(false);
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
        <GeneralForm<UpdateBookFormValues>
          initialValues={{ authorName: currentBookAuthor?.name ?? NOT_AVAILABLE, genre: book.genre, name: book.name, releaseDate: dateToISOString(new Date(book.releaseDate)) }}
          validationSchema={authorSchema}

          // .. Submit Handler ....................................................
          onSubmitHandler={handleSubmit}

          // .. Render Function ...................................................
          renderFormFunction={(errors, touched, setFieldValue) => {
            return (
              <>
                <Center width='full'>
                  <Text as='strong'>Actualizar Libro</Text>
                  <Tooltip label='Eliminar Libro'>
                    <IconButton icon={<BsTrash />} marginLeft='auto' isDisabled={isBookDeleted} aria-label='deleteBook' onClick={() => setShowDeleteModal(true)} />
                  </Tooltip>
                </Center>
                <FormControl isInvalid={!!errors.name && touched.name}>

                  {/* .. Author Name ............................................ */}
                  <FormLabel htmlFor='author-name'>
                    Nombre del Autor
                  </FormLabel>
                  <Field
                    id='author-name'
                    name='authorName'
                    placeholder='Nombre del Autor'
                    isReadOnly
                    onClick={() => setShowAuthorLookUpModal(true)}
                    {...createCommonInputTextFieldProps(isUpdatingBook || isBookDeleted)}
                  />
                  <FormErrorMessage>{errors.name}</FormErrorMessage>
                  <GeneralLookUpModal<Author>
                    modalTitle='Escoger Autor'
                    inputPlaceholder='Buscar Autor'
                    keyToShow={'name'}
                    isOpen={showAuthorLookUpModal}
                    inputValueChangeCallback={lookForAuthor}
                    chosenObjectCallback={(chosenAuthor) => chooseAuthor(chosenAuthor, setShowAuthorLookUpModal, setCurrentBookAuthor, setFieldValue)}
                    onClose={() => setShowAuthorLookUpModal(false)}
                  />
                </FormControl>

                {/* .. Genre .................................................. */}
                <FormControl>
                  <FormLabel htmlFor='book-genre'>
                    Género del Libro
                  </FormLabel>
                  <Field
                    id='book-genre'
                    name='genre'
                    placeholder='Género del Libro'
                    {...createCommonSelectFieldProps(isUpdatingBook || isBookDeleted)}
                  >
                    {Object.keys(Genre).map((genre, genreIndex) => <option key={genreIndex} value={genre}>{stringTranslator.book.genre[genre]}</option>)}
                  </Field>
                  <FormErrorMessage>{errors.name}</FormErrorMessage>
                </FormControl>

                {/* .. Book Name .............................................. */}
                <FormControl>
                  <FormLabel htmlFor='book-name'>
                    Nombre del Libro
                  </FormLabel>
                  <Field
                    id='book-name'
                    name='name'
                    placeholder='Nombre del Libro'
                    {...createCommonInputTextFieldProps(isUpdatingBook || isBookDeleted)}
                  />
                  <FormErrorMessage>{errors.name}</FormErrorMessage>
                </FormControl>

                {/* .. Release Date ........................................... */}
                <FormControl>
                  <FormLabel htmlFor='book-releaseDate'>
                    Fecha de la Primera Publicación del Libro
                  </FormLabel>
                  <Field
                    id='book-releaseDate'
                    name='releaseDate'
                    placeholder='Fecha de Publicación'
                    {...createCommonInputDateFieldProps(isUpdatingBook || isBookDeleted)}
                  />
                  <FormErrorMessage>{errors.name}</FormErrorMessage>
                </FormControl>
              </>
            );
          }}
          
          // .. Remaining Props ...................................................
          performOperationString='Actualizar'
          performAnotherOperationString='Regresando...'
          isPerformingOperation={isUpdatingBook}
          hasPerformedOperation={isBookDeleted}
          isObjectDeleted={isBookDeleted}
        />

        {/* .. Modal .......................................................... */}
        <GeneralModal
          modalTitle='Eliminar Libro'
          bodyString='¿Estás seguro de que quieres eliminar este libro? Esta acción no puede ser deshecha.'
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          buttons={
            [
              {
                text: 'Cancelar',
                onClick: () => setShowDeleteModal(false),
                isDisabled: isUpdatingBook || isBookDeleted/*disable while updating or on deleted*/,
                isLoading: false/*cancel should not be loading*/,
              },
              {
                text: 'Eliminar',
                onClick: async () => await deleteObjectUIProcess(
                  {
                    deletedObjectName: 'Autor',
                    isUpdatingCallback: setIsUpdatingBook,
                    toast: toast,
                    deleteCallback: async () => await deleteBook({ deletedBookId: currentBook.id }),
                    replaceRouteCallback: () => Router.replace(`/${LIBRO}/${VER_LIBROS}`),
                    setShowDeleteModalCallback: setShowDeleteModal,
                    setIsObjectDeletedCallback: setIsBookDeleted,
                  }
                ),
                isDisabled: isUpdatingBook || isBookDeleted,
                isLoading: isUpdatingBook,
              },
            ]
          }
        />
      </CenterLayout>
    </AppLayout>
  );
};

export default ActualizarLibro;