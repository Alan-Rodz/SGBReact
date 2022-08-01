import type { GetServerSideProps, NextPage } from 'next';
import { signOut } from 'next-auth/react';
import { useEffect } from 'react';

import { LoadingScreen } from 'ui';
import { getUserFromContext, UserPageProps } from 'request';

// ********************************************************************************
// == Server Side =================================================================
// NOTE: getCurrentUser handles redirection to login once session cookie 
//       is wiped out by the signOut() call
export const getServerSideProps: GetServerSideProps<UserPageProps> = async (context) => getUserFromContext(context);

// == Client Side =================================================================
const LogOut: NextPage = () => {
  // -- Effect --------------------------------------------------------------------
  useEffect(() => {
    signOut();
  }, []);

  // -- UI ------------------------------------------------------------------------
  return <LoadingScreen />;
};

export default LogOut;
