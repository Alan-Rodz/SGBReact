import { Avatar, Center, Text } from '@chakra-ui/react';
import type { GetServerSideProps, NextPage } from 'next';

import { stringTranslator } from 'general';
import { getUserFromContext, UserPageProps } from 'request';
import { AppLayout, CenterLayout } from 'ui';

// ********************************************************************************
// == Server Side =================================================================
export const getServerSideProps: GetServerSideProps<UserPageProps> = async (context) => getUserFromContext(context);

// == Client Side =================================================================
const Perfil: NextPage<UserPageProps> = ({ user }) =>
  <AppLayout
    userId={user.id}
    userIMG={user.image}
    employeeLevel={user.employeeLevel}
  >
    <CenterLayout>
      <Center>
        <Avatar src={user.image ? user.image : ''} size='2xl' />
      </Center>
      <Text textTransform='capitalize'>
        {`Nombre: ${user.name ? user.name.toLowerCase() : 'No definido'}`}
      </Text>
      <p>{`Email: ${user.email ? user.email : 'No definido'}`}</p>
      <p>{`Nivel de Empleado: ${stringTranslator.employee.employeeLevel[user.employeeLevel]}`}</p>
    </CenterLayout>
  </AppLayout>;

export default Perfil;
