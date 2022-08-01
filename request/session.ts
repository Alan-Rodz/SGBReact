// NOTE: This file must not import prisma from 'db/ or 'cant run in the browser' error will be thrown
import { User } from '@prisma/client';
import { GetServerSidePropsContext, PreviewData } from 'next';
import { Session } from 'next-auth';
import { getSession } from 'next-auth/react';
import { ParsedUrlQuery } from 'node:querystring';

import { redirectToLoginObject } from 'general';

import { parseObjectFromServer } from './util';

// ********************************************************************************
// == Type ========================================================================
// NOTE: Using email since using id causes prisma findUnique error
type ValidatedSession = Session & { user: User & { email: string; }; };
export interface UserPageProps { user: User; }

// == Util ========================================================================
export const getUserFromContext = async (context: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>) => {
  // .. Validation ................................................................
  const session = await getSession(context);
  if(!isValidSession(session)) return redirectToLoginObject/*redirect to login if not authed*/;
    
  // .. Query .....................................................................
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });

  // .. Returned Props ............................................................
  return { props: { user: parseObjectFromServer(user) } };
};

// == Type Guard ==================================================================
export const isValidSession = (session: Session | null): session is ValidatedSession => {
  if(!session) return false/*by definition*/;
  if(!session.user) return false;

  return 'email' in session.user;
};

