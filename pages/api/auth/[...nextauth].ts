import { PrismaAdapter } from '@next-auth/prisma-adapter';
import NextAuth from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import GoogleProvider from 'next-auth/providers/google';

import { prisma } from 'db';

import { sendLoginLinkEmail, sendWelcomeEmail } from '../email';

// == Auth ========================================================================
export default NextAuth({
  // defaults for custom sign in pages
  pages: { signIn: '/', signOut: '/', error: '/', verifyRequest: '/' },

  providers: [
    // magic links are valid for 10 min only
    EmailProvider({ maxAge: 10 * 60, sendVerificationRequest: sendLoginLinkEmail }),

    // vars must be set in .env file
    GoogleProvider({ clientId: process.env.GOOGLE_CLIENT_ID!, clientSecret: process.env.GOOGLE_CLIENT_SECRET! }),
  ],

  adapter: PrismaAdapter(prisma),

  // async function called by NextAuth when the adapter creates a new user on sing-in
  events: { createUser: sendWelcomeEmail }
});
