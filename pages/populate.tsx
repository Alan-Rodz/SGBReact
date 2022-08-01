import { useToast, Button, Flex } from '@chakra-ui/react';
import type { NextPage } from 'next';
import { useState } from 'react';

import { FullPageLayout } from 'ui';
import { LIGHT_GRAY, TOAST_DURATION, TOAST_POSITION } from 'general';

// ********************************************************************************
// NOTE: This page is for development purposes only
// == Client Side =================================================================
const PopulatePage: NextPage = () => {
  const toast = useToast();

  // -- State ---------------------------------------------------------------------
  const [isPostingData, setIsPostingData] = useState(false);
  
  // -- Handler -------------------------------------------------------------------
  const makeDBRequest = async () => {
    try {
      toast({ title: 'Actualizando Base de Datos', status: 'info', duration: TOAST_DURATION, position: TOAST_POSITION })
      setIsPostingData(true);
      // await axios.post(`/${API}/${POPULATE}`, DATA HERE);
      toast({ title: 'Base de Datos Actualizada correctamente', status: 'success', duration: TOAST_DURATION, position: TOAST_POSITION })
    } catch (error) {
      toast({ title: 'Error al actualizar la Base de Datos', status: 'error', duration: TOAST_DURATION, position: TOAST_POSITION })
      console.warn(error);
    } finally {
      setIsPostingData(false);
    }
  }

  // -- UI ------------------------------------------------------------------------
  return (
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
        <Button
          colorScheme='twitter'
          fontSize='20px'
          disabled={isPostingData}
          onClick={() => makeDBRequest()}
        >
          Hacer conexión a la base de datos
        </Button>
      </Flex>
    </FullPageLayout>
  );
}

export default PopulatePage;
