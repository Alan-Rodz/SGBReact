import { Box, Text } from '@chakra-ui/react';
import { Author, User } from '@prisma/client';
import type { GetServerSideProps, NextPage } from 'next';
import { getSession } from 'next-auth/react';
import Router from 'next/router';

import { AppLayout, CenterLayout } from 'ui';
import { prisma } from 'db';
import { redirectToLoginObject, userIsAdminOrSecretary, GeneralSeeAll, AUTOR, ACTUALIZAR_AUTOR, CREATED_AT_ORDER, PAGINATION_SIZE } from 'general';
import { getAuthors, isValidSession, lookForAuthor, parseObjectFromServer } from 'request';

// ********************************************************************************
// == Interface ===================================================================
interface ShowAuthorsProps {
  user: User;
  totalAuthors: number;
  firstAuthors: Author[];
}

// == Server Side =================================================================
export const getServerSideProps: GetServerSideProps<ShowAuthorsProps> = async (context) => {
  // -- Validation ----------------------------------------------------------------
  const session = await getSession(context);
  if(!isValidSession(session)) return redirectToLoginObject/*redirect to login if not authed*/;

  // -- Query ---------------------------------------------------------------------
  const appUser = await prisma.user.findUnique({ where: { email: session.user.email } }),
    totalAuthors = await prisma.author.count(),
    firstAuthors = await prisma.author.findMany({ take: PAGINATION_SIZE, orderBy: [{ createdAt: CREATED_AT_ORDER }] });

  // -- Returned Props ------------------------------------------------------------
  return {
    props: {
      user: parseObjectFromServer(appUser),
      totalAuthors: parseObjectFromServer(totalAuthors),
      firstAuthors: parseObjectFromServer(firstAuthors),
    }
  };
};

// == Client Side =================================================================
const VerAutores: NextPage<ShowAuthorsProps> = ({ user, totalAuthors, firstAuthors }) => {
  // -- Handler -------------------------------------------------------------------
  const seeAuthorDetails = (author: Author) => Router.push(`/${AUTOR}/${ACTUALIZAR_AUTOR}/${author.id}`);

  const setAuthorsPage = async (currentPage: number) => {
    const data = await getAuthors({ requestedAuthorId: ''/*not looking for an author*/, requestedAuthorNameStartsWith: ''/*none*/, requestedAuthorsPage: currentPage.toString() })
    if(!data || !data.requestedAuthors) {
      throw new Error('Wrong response from getAuthors');
    }/* else -- valid response */

    return data.requestedAuthors;
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
          <Text as='strong'>Ver Autores</Text>
        </Box>
        <GeneralSeeAll<Author>
          totalPageObjects={totalAuthors}
          initialPageObjects={firstAuthors}
          tableColumnNames={['Nombre']}
          displayedPageObjectProperties={['name']}
          showLeftButtons={userIsAdminOrSecretary(user)}
          leftButtonsString='Editar'

          // .. Input Callback ......................................................
          inputValueChangeCallback={lookForAuthor}

          // .. Route Callback ......................................................
          editRouteCallback={seeAuthorDetails}

          // .. Pages Callback ......................................................
          setPageObjectsCallback={setAuthorsPage}
        />
      </CenterLayout>
    </AppLayout>
  );
}

export default VerAutores;