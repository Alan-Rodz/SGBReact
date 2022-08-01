import { ChakraProvider } from '@chakra-ui/react';
import type { AppProps } from 'next/app';
import { SessionProvider as AuthProvider } from 'next-auth/react';

import { FullPageLayout, LayoutProvider, PageLoadingProvider } from 'ui';
import ErrorBoundary from 'ui/ErrorBoundary';

import 'styles.css';

// ********************************************************************************
// == App =========================================================================
const SGBApp = ({ Component, pageProps: { session, ...pageProps } }: AppProps) =>
  <ChakraProvider>
    <ErrorBoundary>
      <FullPageLayout>
        <LayoutProvider>
          <AuthProvider session={session}>
            <PageLoadingProvider>
              <Component {...pageProps} />
            </PageLoadingProvider>
          </AuthProvider>
        </LayoutProvider>
      </FullPageLayout>
    </ErrorBoundary>
  </ChakraProvider>

export default SGBApp;
