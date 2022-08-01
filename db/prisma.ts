import { PrismaClient } from '@prisma/client';

// ********************************************************************************
// == Prisma ======================================================================
export const prisma = global.prisma || new PrismaClient();

// -- Logic -----------------------------------------------------------------------
if(process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}/* else -- production, do not set as global obj */
