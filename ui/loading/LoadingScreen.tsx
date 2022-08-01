import { Flex, Spinner } from '@chakra-ui/react';

import { FullPageLayout } from 'ui';
import { LIGHT_GRAY } from 'general';

// ********************************************************************************
export const LoadingScreen = () =>
  <FullPageLayout>
    <Flex
      alignItems='center'
      justifyContent='center'
      width='full'
      height='full'
      backgroundColor={LIGHT_GRAY}
    >
      <Spinner />
    </Flex>
  </FullPageLayout>;
