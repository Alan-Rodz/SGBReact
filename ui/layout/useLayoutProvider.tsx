import { useContext } from 'react';

import { LayoutContext } from './LayoutContext';

// ****************************************************************************
// == Hook ====================================================================
export const useLayoutProvider = () =>{
  const layoutContext = useContext(LayoutContext);
  if(!layoutContext) { 
    throw new Error('useLayoutProvider hook must be used within a LayoutContext'); 
  }/* else -- layoutContext defined */

  return layoutContext;
};
