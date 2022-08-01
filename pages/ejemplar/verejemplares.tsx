import { Box, Text } from '@chakra-ui/react';
import { BookCopy, User } from '@prisma/client';
import type { GetServerSideProps, NextPage } from 'next';
import { getSession } from 'next-auth/react';
import Router from 'next/router';

import { AppLayout, CenterLayout } from 'ui';
import { prisma } from 'db';
import { redirectToLoginObject, userIsAdminOrSecretary, GeneralSeeAll, CREATED_AT_ORDER, EJEMPLAR, ACTUALIZAR_EJEMPLAR, PAGINATION_SIZE } from 'general';
import { isValidSession, parseObjectFromServer, getBookCopies, NonTransformedBookCopy, TransformedBookCopy } from 'request';

// ********************************************************************************
// == Type ========================================================================
// Ensure the name of the referenced book gets added
const transformBookCopies = (nonTransformedBookCopies: NonTransformedBookCopy[]): TransformedBookCopy[] => {
  const transformedBookCopies: TransformedBookCopy[] = [];
  nonTransformedBookCopies.forEach(nonTransformedBookCopy => transformedBookCopies.push({ ...nonTransformedBookCopy, bookName: nonTransformedBookCopy.book.name  }));
  return transformedBookCopies;
};

// == Interface ===================================================================
interface showBookCopiesProps {
  user: User;
  totalBookCopies: number;
  firstBookCopies: TransformedBookCopy[];
}

// == Server Side =================================================================
export const getServerSideProps: GetServerSideProps<showBookCopiesProps> = async (context) => {
  // -- Validation ----------------------------------------------------------------
  const session = await getSession(context);
  if(!isValidSession(session)) return redirectToLoginObject/*redirect to login if not authed*/;

  // -- Query ---------------------------------------------------------------------
  const appUser = await prisma.user.findUnique({ where: { email: session.user.email } }),
        totalBookCopies = await prisma.bookCopy.count(),
        firstBookCopies = await prisma.bookCopy.findMany({ take: PAGINATION_SIZE, orderBy: [{ createdAt: CREATED_AT_ORDER }], include: { book: true } })

  // -- Returned Props ------------------------------------------------------------
  return {
    props: {
      user: parseObjectFromServer(appUser),
      totalBookCopies: parseObjectFromServer(totalBookCopies),
      firstBookCopies: parseObjectFromServer(transformBookCopies(firstBookCopies)),
    }
  };
};

// == Client Side =================================================================
const VerEjemplares: NextPage<showBookCopiesProps> = ({ user, totalBookCopies, firstBookCopies }) => {
  // -- Handler -------------------------------------------------------------------
  const lookForAndTransformBookCopies = async (bookCopyEditionNameStartsWith: string) => {
    const data = await getBookCopies({ requestedBookCopyEditionNameStartsWith: bookCopyEditionNameStartsWith, requestedBookCopiesPage: ''/*not requesting a page*/, })
    if(!data || !data.requestedBookCopies) {
      return [];
    } /* else -- books found  */
    return transformBookCopies(data.requestedBookCopies); 
  }

  const seeBookCopyDetails = (bookCopy: BookCopy) => Router.push(`/${EJEMPLAR}/${ACTUALIZAR_EJEMPLAR}/${bookCopy.id}`);

  const setBookCopiesPage = async (currentPage: number) => {
    const data = await getBookCopies({ requestedBookCopyEditionNameStartsWith: ''/*none*/, requestedBookCopiesPage: currentPage.toString() })
    if(!data || !data.requestedBookCopies) {
      throw new Error('Wrong response from getBookCopies');
    }/* else -- valid response */

    return transformBookCopies(data.requestedBookCopies); 
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
        <Text as='strong'>Ver Ejemplares</Text>
      </Box>
      <GeneralSeeAll<TransformedBookCopy>
        totalPageObjects={totalBookCopies}
        initialPageObjects={firstBookCopies}
        tableColumnNames={['Nombre del Libro', 'Edición', 'Páginas', 'Editorial', 'Cantidad en Inventario', 'Precio (MXN)']}
        displayedPageObjectProperties={['bookName', 'edition', 'pages', 'publisher', 'quantityInStock', 'priceMXN']}
        showLeftButtons={userIsAdminOrSecretary(user)}
        leftButtonsString='Editar'

        // .. Input Callback ......................................................
        inputValueChangeCallback={lookForAndTransformBookCopies}

        // .. Route Callback ......................................................
        editRouteCallback={seeBookCopyDetails}

        // .. Pages Callback ......................................................
        setPageObjectsCallback={setBookCopiesPage}
      />
    </CenterLayout>
  </AppLayout>
  )
}

export default VerEjemplares;

