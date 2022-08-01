import { Box, Text } from '@chakra-ui/react';
import { LibraryUser, User } from '@prisma/client';
import type { GetServerSideProps, NextPage } from 'next';
import { getSession } from 'next-auth/react';
import Router from 'next/router';

import { dateToISOString, redirectToLoginObject, userIsAdminOrSecretary, GeneralSeeAll, ACTUALIZAR_USUARIO, CREATED_AT_ORDER, PAGINATION_SIZE, USUARIO } from 'general';
import { isValidSession, parseObjectFromServer, getLibraryUsers, TransformedLibraryUser } from 'request';
import { AppLayout, CenterLayout } from 'ui';


// ********************************************************************************
// Ensure the date gets displayed correctly
const transformLibraryUsers = (nonTransformedLibraryUsers: LibraryUser[]): TransformedLibraryUser[] => {
  const transformedLibraryUsers: TransformedLibraryUser[] = [];
  nonTransformedLibraryUsers.forEach(nonTransformedLibraryUser => transformedLibraryUsers.push({
    ...nonTransformedLibraryUser,
    membershipExpDate: dateToISOString(new Date(nonTransformedLibraryUser.membershipExpDate)),
  }));
  return transformedLibraryUsers;
};

// == Interface ===================================================================
interface ShowLibraryUsersProps {
  user: User;
  totalLibraryUsers: number;
  firstLibraryUsers: TransformedLibraryUser[];
}

// == Server Side =================================================================
export const getServerSideProps: GetServerSideProps<ShowLibraryUsersProps> = async (context) => {
  // -- Validation ----------------------------------------------------------------
  const session = await getSession(context);
  if (!isValidSession(session)) return redirectToLoginObject/*redirect to login if not authed*/;

  // -- Query ---------------------------------------------------------------------
  const appUser = await prisma.user.findUnique({ where: { email: session.user.email } }),
    totalLibraryUsers = await prisma.libraryUser.count(),
    firstLibraryUsers = await prisma.libraryUser.findMany({ take: PAGINATION_SIZE, orderBy: [{ createdAt: CREATED_AT_ORDER }] });

  // -- Returned Props ------------------------------------------------------------
  return {
    props: {
      user: parseObjectFromServer(appUser),
      totalLibraryUsers: parseObjectFromServer(totalLibraryUsers),
      firstLibraryUsers: transformLibraryUsers(parseObjectFromServer(firstLibraryUsers)),
    }
  };
};

// == Client Side =================================================================
const VerUsuarios: NextPage<ShowLibraryUsersProps> = ({ user, totalLibraryUsers, firstLibraryUsers }) => {
  // -- Handler -------------------------------------------------------------------
  const lookForLibraryUser = async (libraryUserNameStartsWith: string) => {
    const data = await getLibraryUsers({ requestedLibraryUserId: ''/*none*/, requestedLibraryUserNameStartsWith: libraryUserNameStartsWith, requestedLibraryUsersPage: ''/*none*/, requestedLibraryUserMembershipRoute: ''/*none*/  })
    if(!data || !data.requestedLibraryUsers) {
      return [];
    } /* else -- LibraryUsers found  */
    return transformLibraryUsers(data.requestedLibraryUsers); 
  };

  const seeLibraryUserDetails = (libraryUser: TransformedLibraryUser) => Router.push(`/${USUARIO}/${ACTUALIZAR_USUARIO}/${libraryUser.id}`);

  const setLibraryUsersPage = async (currentPage: number) => {
    const data = await getLibraryUsers({ requestedLibraryUserId: ''/*none*/, requestedLibraryUserNameStartsWith: ''/*none*/, requestedLibraryUsersPage: currentPage.toString(), requestedLibraryUserMembershipRoute: ''/*none*/ })
    if (!data || !data.requestedLibraryUsers) {
      throw new Error('Wrong response from getLibraryUsers');
    }/* else -- valid response */

    return transformLibraryUsers(data.requestedLibraryUsers);
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
          <Text as='strong'>Ver Usuarios</Text>
        </Box>
        <GeneralSeeAll<TransformedLibraryUser>
          totalPageObjects={totalLibraryUsers}
          initialPageObjects={firstLibraryUsers}
          tableColumnNames={['Nombre', 'Email', 'Fecha de Expiración de Membresía']}
          displayedPageObjectProperties={['name', 'email', 'membershipExpDate']}
          showLeftButtons={userIsAdminOrSecretary(user)}
          leftButtonsString='Editar'

          // .. Input Callback ......................................................
          inputValueChangeCallback={lookForLibraryUser}

          // .. Route Callback ......................................................
          editRouteCallback={(chosenLibraryUser) => seeLibraryUserDetails(chosenLibraryUser)}

          // .. Pages Callback ......................................................
          setPageObjectsCallback={setLibraryUsersPage}
        />
      </CenterLayout>
    </AppLayout>
  );
}

export default VerUsuarios;