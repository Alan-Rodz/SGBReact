import { Box } from '@chakra-ui/react';
import type { GetServerSideProps, NextPage } from 'next';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import { useLayoutProvider, AppLayout, CenterLayout } from 'ui';
import { SGB_LOGO_ROUTE } from 'general';
import { UserPageProps, getUserFromContext } from 'request';

// ********************************************************************************
// == Server Side =================================================================
export const getServerSideProps: GetServerSideProps<UserPageProps> = async (context) => getUserFromContext(context);

// == Client Side =================================================================
const SGBHomePage: NextPage<UserPageProps> = ({ user }) => {
  // -- State ---------------------------------------------------------------------
  const { isPhone } = useLayoutProvider();

  // NOTE: These are to ensure there are no NextJS server-client warnings
  const [width, setWidth] = useState('600%');
  const [height, setHeight] = useState('600%');

  // -- Effect --------------------------------------------------------------------
  useEffect(() => {
    if(!isPhone) return;

    setWidth('200%');
    setHeight('200%');
  }, [isPhone]);

  // -- UI ------------------------------------------------------------------------
  return (
    <AppLayout
      userId={user.id}
      userIMG={user.image}
      employeeLevel={user.employeeLevel}
    >
      <CenterLayout>
        <Box>
          <Image
            src={SGB_LOGO_ROUTE}
            width={width}
            height={height}
            alt='logo'
            priority
          />
        </Box>
        <strong>Sistema de Gestión Bibliotecaria</strong>
      </CenterLayout>
    </AppLayout>
  );
};

export default SGBHomePage;
