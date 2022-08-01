import { signIn, SignInResponse } from 'next-auth/react';

// NOTE: These run on the client
// ********************************************************************************
// == Google ======================================================================
export const signInWithGoogle = () => signIn('google', { callbackUrl: '/' });

// == Email =======================================================================
export const signInWithEmail = async (email: string) => {
  let signInResult = false/*default*/;

  try {
    // Send the email to the given email
    const signInResponse: SignInResponse | undefined = await signIn('email', { redirect: false, callbackUrl: '/', email });
    if(!signInResponse)
      throw new Error(`Did not receive valid SignInResponse: ${signInResponse}`);
      
    const { error, ok } = signInResponse;
    if(error)
      throw new Error(`SignInResponse returned error: ${error}`);
      
    if(ok) signInResult = true;
  } catch (err) {
    console.log(`Something went wrong while logging in: ${err}`);
  } 
  
  return signInResult;
};
