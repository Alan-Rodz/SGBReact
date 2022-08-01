import { useDisclosure, useToast, Box, Button, FormControl, FormLabel, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay } from '@chakra-ui/react';
import { NextPage } from 'next';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { HiOutlineMail } from 'react-icons/hi';

import { useLayoutProvider, CenterLayout } from 'ui';
import { isValidEmail, signInWithEmail, signInWithGoogle, SGB_LOGO_ROUTE, TOAST_DURATION, TOAST_POSITION, } from 'general';

// ********************************************************************************
// == Component ===================================================================
const LoginPage: NextPage = () => {
  const initialRef = useRef(null);
  const finalRef = useRef(null);
  const toast = useToast();

  // -- State ---------------------------------------------------------------------
  const { isPhone } = useLayoutProvider();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [emailValue, setEmailValue] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  // NOTE: These are to ensure there are no NextJS server-client warnings
  const [width, setWidth] = useState('600%');
  const [height, setHeight] = useState('700%');


  // -- Effect --------------------------------------------------------------------
  useEffect(() => {
    if(!isPhone) return;

    setWidth('100%');
    setHeight('200%');
  }, [isPhone]);

  // -- Handler -------------------------------------------------------------------
  const handleSendEmailClick = async () => {
    if(!isValidEmail(emailValue.trim())) {
      toast({ title: 'La dirección de correo ingresada es inválida', status: 'error', duration: TOAST_DURATION, position: TOAST_POSITION });
      return;
    } /* else -- valid email address */

    setSendingEmail(true);
    const signInResult = await signInWithEmail(emailValue);
    setSendingEmail(false);
    if(!signInResult) {
      toast({ title: 'Hubo un error enviando el correo.', status: 'error', duration: TOAST_DURATION, position: TOAST_POSITION });
      return;
    } /* else -- sending was a success */

    toast({ title: 'Verificación exitosa. En breve recibirás un correo para iniciar sesión.', status: 'success', duration: TOAST_DURATION, position: TOAST_POSITION });
    setEmailValue('');
    onClose();
  };

  // -- UI ------------------------------------------------------------------------
  return (
    <CenterLayout>
      <Box>
        <Image
          src={SGB_LOGO_ROUTE}
          width={width}
          height={height}
          alt='logo'
          priority
        />
      </Box>
      <strong>Sistema de Gestión Bibliotecaria</strong>
      <Button onClick={() => signInWithGoogle()}>Iniciar Sesión con Google</Button>
      <Button onClick={onOpen}>Iniciar Sesión con Email</Button>
      <Modal
        initialFocusRef={initialRef}
        finalFocusRef={finalRef}
        isOpen={isOpen}
        onClose={onClose}
      >
        <ModalOverlay />
        <ModalContent width='90%'>
          <ModalHeader>Iniciar Sesión con Correo Electrónico</ModalHeader>
          <ModalCloseButton />
          <ModalBody paddingBottom={6}>
            <FormControl>
              <FormLabel>Email</FormLabel>
              <Input
                autoComplete='off'
                ref={initialRef}
                value={emailValue}
                placeholder='Email'
                onChange={(event) => setEmailValue(event.target.value)}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button
              aria-label='sendEmailButton'
              isLoading={sendingEmail}
              colorScheme='blue'
              mr={3}
              onClick={handleSendEmailClick}
              leftIcon={<HiOutlineMail size='16px' />}
            >
              Enviar Correo
            </Button>
            <Button onClick={onClose}>
              Cancelar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </CenterLayout>
  );
};

export default LoginPage;
