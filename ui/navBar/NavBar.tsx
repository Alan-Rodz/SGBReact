import { EmployeeLevel } from '@prisma/client';

import { useLayoutProvider } from 'ui';

import { DesktopNavBar } from './DesktopNavBar';
import { PhoneNavBar } from './PhoneNavBar';

// ********************************************************************************
// == Interface ===================================================================
interface Props { 
  userId: string; 
  userIMG: string | null; 
  employeeLevel: EmployeeLevel; 
}

// == Component ===================================================================
const NavBar: React.FC<Props> = ({ userId, userIMG, employeeLevel }) => {
  // -- State ---------------------------------------------------------------------
  const { isPhone } = useLayoutProvider();

  // -- UI ------------------------------------------------------------------------
  if(isPhone)
    return (<PhoneNavBar userId={userId} employeeLevel={employeeLevel} />);
  /* else -- desktop */

  return (<DesktopNavBar userId={userId} userIMG={userIMG} employeeLevel={employeeLevel} />);
};

export default NavBar;
