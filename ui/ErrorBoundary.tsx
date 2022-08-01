import { Box, Button, Flex, Heading, Text } from '@chakra-ui/react';
import Link from 'next/link';
import React, { ErrorInfo } from 'react';

// ********************************************************************************
// == Interface ===================================================================
interface Props { children: React.ReactNode; }
interface State {
  hasError: boolean;
  redirect: boolean;
}

// == Class =======================================================================
class ErrorBoundary extends React.Component<Props, State> {
  // -- State ---------------------------------------------------------------------
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, redirect: false };
  }

  // -- Handler -------------------------------------------------------------------
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) { console.log({ error, errorInfo }); }

  // -- UI ------------------------------------------------------------------------
  render() {
    if(this.state.hasError) {
      return (
        <Flex
          alignItems='center'
          flexDirection='column'
          justifyContent='center'
          width='100wh'
          height='105vh'
          backgroundColor='gray.200'
        >
          <Box
            textAlign='center'
            paddingX={6}
            paddingY={10}
          >
            <Heading
              as='h1'
              marginTop={6}
              marginBottom={2}
              size='xl'
            >
              Error
            </Heading>
            <Text color='gray.500'>Hubo un error mientras se cargaba la aplicación</Text>
            <Button
              marginTop={5}
              colorScheme='twitter'
              onClick={() => this.setState({ hasError: true, redirect: true })}
            >
              Regresar a la página principal
            </Button>
            {this.state.redirect && <Link href='/' replace={true} />/*will redirect when rendered*/}
          </Box>
        </Flex>
      );
    }/* else -- no error */

    return this.props.children;
  }
}

export default ErrorBoundary;
