import { useMediaQuery } from '@chakra-ui/react';
import { ReactNode } from 'react';

import { LayoutContext } from './LayoutContext';

// ********************************************************************************
// == Constant ====================================================================
const PHONE_WIDTH = 425/*px*/;

// == Interface ===================================================================
interface Props { children: ReactNode; }

// == Component ===================================================================
export const LayoutProvider: React.FC<Props> = ({ children }) => {
  // -- State ---------------------------------------------------------------------
  const [isPhone] = useMediaQuery(`(max-width:${PHONE_WIDTH}px)`);
  
  // -- Value ---------------------------------------------------------------------
  return <LayoutContext.Provider value={{ isPhone }}>{children}</LayoutContext.Provider>;
};
