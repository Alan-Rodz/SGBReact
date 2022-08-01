import { EmployeeLevel } from '@prisma/client';
import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

import { FullPageLayout } from './FullPageLayout';

// ********************************************************************************
// == Interface ===================================================================
interface Props { 
  userId: string; 
  userIMG: string | null; 
  employeeLevel: EmployeeLevel; 
  children: ReactNode; 
}

// == Constant ====================================================================
// NOTE: Imported route -must- match folder structure
const NavBar = dynamic<Props & { children: ReactNode; }>(() => import('../navBar/NavBar'!), { ssr: false });

// == Component ===================================================================
export const AppLayout: React.FC<Props> = ({ userId, userIMG, employeeLevel, children }) => {
  return (
    <FullPageLayout>
      <NavBar userId={userId} userIMG={userIMG} employeeLevel={employeeLevel}>
      </NavBar>
      {children}
    </FullPageLayout>
  );
};
