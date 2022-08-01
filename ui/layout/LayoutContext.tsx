import { createContext } from 'react';

// ********************************************************************************
// == Context =====================================================================
export type  LayoutState = Readonly<{  isPhone: boolean/*layout assumed to be desktop if false*/; }>;
export const LayoutContext = createContext<LayoutState>({ isPhone: false/*default*/ });
             LayoutContext.displayName = 'LayoutContext';
