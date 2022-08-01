import { User } from '@prisma/client';
import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

import { RequestMethod } from 'type';

import { isValidSession } from './session';

// ********************************************************************************
// == Server ======================================================================
export const parseObjectFromServer = (serverValue: any) => JSON.parse(JSON.stringify(serverValue));

// == Verification ================================================================
export const verifyUserAuthAndAuthority = async (req: NextApiRequest, res: NextApiResponse, authorityVerifier: (user: User) => boolean) => {
  // Check if user is authenticated
  const session = await getSession({ req });
  if(!isValidSession(session))
    return setUnauthorizedResponse(res);
  /* else -- user is authed */
  const authedUser = await prisma.user.findUnique({ where: { email: session.user.email } });

  // Check if authedUser is general authority
  if(!authedUser || !authorityVerifier(authedUser)) {
    return setUnauthorizedResponse(res);
  } /* else -- authedUser has right authority, do not return */
};

// == Response ====================================================================
export const setErrorResponse = (res: NextApiResponse, message: string) => res.status(500/*error*/).json({ message });
export const setUnauthorizedResponse = (res: NextApiResponse) => res.status(401/*unauthorized*/).json({ message: 'Unauthorized.' });
export const setNotFoundResponse = (res: NextApiResponse, message: string) => res.status(404/*not found*/).json({ message });
export const setNonAllowedMethodResponse = (res: NextApiResponse, allowedHeadersArray: RequestMethod[], reqMethod: string | undefined) => {
  res.setHeader('Allow', allowedHeadersArray);
  res.status(405/*method not allowed*/).json({ message: `HTTP method ${reqMethod} is not supported.` });
};
export const setSuccessResponse = <T>(res: NextApiResponse<T>, returnedObj: T) => res.status(200/*ok*/).json(returnedObj);

// == Error =======================================================================
export const logRequestError = (error: unknown, errorSource: string) => {
  if(axios.isAxiosError(error) ) {
    console.warn(`Axios error (${errorSource}): (${error.message})`);
  } else {
    console.warn(`Unexpected error (${errorSource}): (${error})`);
  }
};
