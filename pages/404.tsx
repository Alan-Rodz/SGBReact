import { Button, Flex, Text } from '@chakra-ui/react';
import type { NextPage } from 'next';
import Router from 'next/router';

import { FullPageLayout } from 'ui';
import { LIGHT_GRAY } from 'general';

// ********************************************************************************
// == Client Side =================================================================
const NotFoundPage: NextPage = () =>
  <FullPageLayout>
    <Flex
      flexDir='column'
      gap='50px'
      alignItems='center'
      justifyContent='center'
      width='full'
      height='full'
      backgroundColor={LIGHT_GRAY}
    >
      <Text fontSize='20px'>La página solicitada no ha sido encontrada.</Text>
      <Button
        colorScheme='twitter'
        fontSize='20px'
        onClick={() => Router.replace('/')}
      >
        Regresar al Menú Principal
      </Button>
    </Flex>
  </FullPageLayout>
  
export default NotFoundPage;
