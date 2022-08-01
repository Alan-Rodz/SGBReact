import { PrismaClient } from '@prisma/client';
import { SupabaseClient } from '@supabase/supabase-js';

// ********************************************************************************
// NOTE: the following global export is done so that functions can access prisma,
//       and at the same time, prisma is not instantiated in the client
declare global {
  // must be vars so that they are globally available
  var prisma: PrismaClient;
  var supabase: SupabaseClient;
}

export {/*nothing to export*/};
