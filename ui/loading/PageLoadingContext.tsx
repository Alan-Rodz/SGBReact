import { createContext } from 'react';

// ********************************************************************************
export type  PageLoadingState = Readonly<{ isPageLoading: boolean; }>;
export const PageLoadingContext = createContext<PageLoadingState>({ isPageLoading: false/*default*/ });
             PageLoadingContext.displayName = 'PageLoadingContext';
