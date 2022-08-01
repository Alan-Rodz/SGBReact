import { Box, Text } from '@chakra-ui/react';
import { User } from '@prisma/client';
import type { GetServerSideProps, NextPage } from 'next';
import { getSession } from 'next-auth/react';
import Router from 'next/router';

import { prisma } from 'db';
import { dateToISOString, redirectToLoginObject, stringTranslator, userIsAdminOrSecretary, GeneralSeeAll, ACTUALIZAR_LIBRO, CREATED_AT_ORDER, LIBRO, PAGINATION_SIZE } from 'general';
import { NonTransformedBook, TransformedBook, isValidSession, parseObjectFromServer, getBooks } from 'request';
import { AppLayout, CenterLayout } from 'ui';

// ********************************************************************************
// Ensure properties get displayed in spanish and date is correct, add authorName
const transformBooks = (nonTransformedBook: NonTransformedBook[]): TransformedBook[] => {
  const transformedBooks: TransformedBook[] = [];
  nonTransformedBook.forEach(nonTransformedBook => transformedBooks.push({
    ...nonTransformedBook,
    genre: stringTranslator.book.genre[nonTransformedBook.genre],
    releaseDate: dateToISOString(new Date(nonTransformedBook.releaseDate)),
    authorName: nonTransformedBook.author.name
  }));
  return transformedBooks;
};

// == Interface ===================================================================
interface ShowBooksProps {
  user: User;
  totalBooks: number;
  firstBooks: TransformedBook[];
}

// == Server Side =================================================================
export const getServerSideProps: GetServerSideProps<ShowBooksProps> = async (context) => {
  // -- Validation ----------------------------------------------------------------
  const session = await getSession(context);
  if(!isValidSession(session)) return redirectToLoginObject/*redirect to login if not authed*/;

  // -- Query ---------------------------------------------------------------------
  const appUser = await prisma.user.findUnique({ where: { email: session.user.email } }),
    totalBooks = await prisma.book.count(),
    firstBooks = await prisma.book.findMany({ take: PAGINATION_SIZE, orderBy: [{ createdAt: CREATED_AT_ORDER }], include: { author: true } }),
    transformedBooks = transformBooks(firstBooks);

  // -- Returned Props ------------------------------------------------------------
  return {
    props: {
      user: parseObjectFromServer(appUser),
      totalBooks: parseObjectFromServer(totalBooks),
      firstBooks: parseObjectFromServer(transformedBooks),
    }
  };
};

// == Client Side =================================================================
const VerLibros: NextPage<ShowBooksProps> = ({ user, totalBooks, firstBooks }) => {
  // -- Handler -------------------------------------------------------------------
  const lookForAndTransformBooks = async (bookNameStartsWith: string) => {
    const data = await getBooks({ requestedBookNameStartsWith: bookNameStartsWith, requestedBooksPage: ''/*not requesting a page*/, })
    if(!data || !data.requestedBooks) {
      return [];
    } /* else -- books found  */
    return transformBooks(data.requestedBooks);
  }

  const seeBookDetails = (book: TransformedBook) => Router.push(`/${LIBRO}/${ACTUALIZAR_LIBRO}/${book.id}`);

  const setBooksPage = async (currentPage: number) => {
    const data = await getBooks({ requestedBookNameStartsWith: ''/*none*/, requestedBooksPage: currentPage.toString() })
    if(!data || !data.requestedBooks) {
      throw new Error('Wrong response from getBooks');
    }/* else -- valid response */

    return transformBooks(data.requestedBooks);
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
          <Text as='strong'>Ver Libros</Text>
        </Box>
        <GeneralSeeAll<TransformedBook>
          totalPageObjects={totalBooks}
          initialPageObjects={firstBooks}
          tableColumnNames={['Autor', 'Género', 'Nombre', 'Fecha de Publicación']}
          displayedPageObjectProperties={['authorName', 'genre', 'name', 'releaseDate']}
          showLeftButtons={userIsAdminOrSecretary(user)}
          leftButtonsString='Editar'

          // .. Input Callback ......................................................
          inputValueChangeCallback={lookForAndTransformBooks}

          // .. Route Callback ......................................................
          editRouteCallback={seeBookDetails}

          // .. Pages Callback ......................................................
          setPageObjectsCallback={setBooksPage}
        />
      </CenterLayout>
    </AppLayout>
  );
}

export default VerLibros;

