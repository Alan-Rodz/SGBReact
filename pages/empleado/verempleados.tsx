import { Box, Text } from '@chakra-ui/react';
import { User } from '@prisma/client';
import type { GetServerSideProps, NextPage } from 'next';
import { getSession } from 'next-auth/react';
import Router from 'next/router';

import { redirectToLoginObject, userIsAdmin, GeneralSeeAll, PAGINATION_SIZE, CREATED_AT_ORDER, EMPLEADO, ACTUALIZAR_EMPLEADO } from 'general';
import { isValidSession, parseObjectFromServer, getEmployees } from 'request';
import { AppLayout, CenterLayout } from 'ui';

// ********************************************************************************
// == Interface ===================================================================
interface ShowAuthorsProps {
  user: User;
  totalEmployees: number;
  firstEmployees: User[];
}

// == Server Side =================================================================
export const getServerSideProps: GetServerSideProps<ShowAuthorsProps> = async (context) => {
  // -- Validation ----------------------------------------------------------------
  const session = await getSession(context);
  if(!isValidSession(session)) return redirectToLoginObject/*redirect to login if not authed*/;

  // -- Query ---------------------------------------------------------------------
  const appUser = await prisma.user.findUnique({ where: { email: session.user.email } }),
    totalEmployees = await prisma.user.count(),
    firstUsers = await prisma.user.findMany({ take: PAGINATION_SIZE, orderBy: [{ createdAt: CREATED_AT_ORDER }] });

  // -- Returned Props ------------------------------------------------------------
  return {
    props: {
      user: parseObjectFromServer(appUser),
      totalEmployees: parseObjectFromServer(totalEmployees),
      firstEmployees: parseObjectFromServer(firstUsers),
    }
  };
};

// == Client Side =================================================================
const VerEmpleados: NextPage<ShowAuthorsProps> = ({ user, totalEmployees, firstEmployees }) => {
  // -- Handler -------------------------------------------------------------------
  const lookForEmployee = async (requestedEmployeeNameStartsWith: string) => {
    const data = await getEmployees({ requestedEmployeeNameStartsWith, requestedEmployeesPage: ''/*none*/, })
    if(!data || !data.requestedEmployees) {
      return [];
    } /* else -- authors found  */
    return data.requestedEmployees;
  };

  const seeEmployeeDetails = (user: User) => Router.push(`/${EMPLEADO}/${ACTUALIZAR_EMPLEADO}/${user.id}`);

  const setEmployeesPage = async (currentPage: number) => {
    const data = await getEmployees({ requestedEmployeeNameStartsWith: ''/*none*/, requestedEmployeesPage: currentPage.toString() })
    if(!data || !data.requestedEmployees) {
      throw new Error('Wrong response from getEmployees');
    }/* else -- valid response */

    return data.requestedEmployees;
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
          <Text as='strong'>Ver Empleados</Text>
        </Box>
        <GeneralSeeAll<User>
          totalPageObjects={totalEmployees}
          initialPageObjects={firstEmployees}
          tableColumnNames={['Nombre']}
          displayedPageObjectProperties={['name']}
          showLeftButtons={userIsAdmin(user)}
          leftButtonsString='Editar'

          // .. Input Callback ......................................................
          inputValueChangeCallback={lookForEmployee}

          // .. Route Callback ......................................................
          editRouteCallback={seeEmployeeDetails}

          // .. Pages Callback ......................................................
          setPageObjectsCallback={setEmployeesPage}
        />
      </CenterLayout>
    </AppLayout>
  );
}

export default VerEmpleados;
