import { Box, Flex } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import { useLayoutProvider } from './useLayoutProvider';

// ********************************************************************************
// == Interface ===================================================================
interface Props { children: React.ReactNode; }

// == Component ===================================================================
export const CenterLayout: React.FC<Props> = ({ children }) => {
  // -- State ---------------------------------------------------------------------
  const { isPhone } = useLayoutProvider();

  // NOTE: These are to ensure there are no NextJS server-client warnings
  const [width, setWidth] = useState('auto');
  const [margin, setMargin] = useState('');
  const [marginBottom, setMarginBottom] = useState('');
  
  // -- Effect ---------------------------------------------------------------------
  useEffect(() => {
    if(!isPhone) { 
      setWidth('70%');
      setMarginBottom('10%');
      return;
    }/* else -- is phone */
  
    setMargin('20px');
  }, [isPhone]);

  // -- UI ------------------------------------------------------------------------
  return (
    <Box
      alignItems='center'
      display='flex'
      justifyContent='center'
      paddingTop='10px'
      minHeight='100vh'
      backgroundColor='gray.100'
      textAlign='center'
    >
      <Flex
        flexDir='column'
        gap={2}
        margin={margin}
        marginBottom={marginBottom}
        width={width}
        padding='20px'
        overflow='auto'
        borderRadius='15px'
        backgroundColor='gray.300'
      >
        {children}
      </Flex>
    </Box>
  );
};
