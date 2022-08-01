import { Router } from 'next/router';
import { useEffect, useState } from 'react';

import { LoadingScreen } from './LoadingScreen';
import { PageLoadingContext } from './PageLoadingContext';

// ********************************************************************************
// Wrapper that shows a loading spinner on NextJS page transitions
interface Props { children: React.ReactNode; }
export const PageLoadingProvider: React.FC<Props> = ({ children }) => {
  // -- State ---------------------------------------------------------------------
  const [isPageLoading, setIsPageLoading] = useState(false);

  // -- Effect --------------------------------------------------------------------
  useEffect(() => {
    Router.events.on('routeChangeStart', () => setIsPageLoading(true));
    Router.events.on('routeChangeComplete', () => setIsPageLoading(false));
    Router.events.on('routeChangeError', () => setIsPageLoading(false));

    return () => {
      Router.events.off('routeChangeStart', () => setIsPageLoading(true));
      Router.events.off('routeChangeComplete', () => setIsPageLoading(false));
      Router.events.off('routeChangeError', () => setIsPageLoading(false));
    };

  }, [Router.events]);


  // -- UI --------------------------------------------------------------------....
  return (
    <PageLoadingContext.Provider value={{ isPageLoading }}>
      {isPageLoading ? <LoadingScreen /> : children}
    </PageLoadingContext.Provider>
  );
}

