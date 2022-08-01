import { useDisclosure, IconButton, Menu, MenuList, MenuItem, MenuButton, MenuGroup, MenuDivider } from '@chakra-ui/react';
import { EmployeeLevel } from '@prisma/client';
import { signOut } from 'next-auth/react';
import Router from 'next/router';
import { BiMenu } from 'react-icons/bi';

import { menus, IVA, PERFIL, LOGIN } from 'general';

// ********************************************************************************
// == Interface ===================================================================
interface Props {
  userId: string;
  employeeLevel: EmployeeLevel;
}

// == Component ===================================================================
export const PhoneNavBar: React.FC<Props> = ({ userId, employeeLevel }) => {
  // -- State ---------------------------------------------------------------------
  const { isOpen, onOpen, onClose } = useDisclosure();

  // -- UI ------------------------------------------------------------------------
  return (
    <Menu isOpen={isOpen} onOpen={onOpen} onClose={onClose}>
      <MenuButton
        as={IconButton}
        variant='outline'
        width='100%'
        icon={<BiMenu />}
        aria-label='navBarMenu'
      />
      <MenuList  maxHeight='66vh' overflow='scroll' zIndex={3/*show above other buttons*/}>
        <MenuGroup title='Menu Principal'>
          <MenuItem onClick={() => Router.push(`/`)}>
            Ir al Menú Principal
          </MenuItem>
        </MenuGroup>
        {
          menus.map((menu, menuIndex) =>
            menu.availableFor.includes(employeeLevel) ?
              <Menu key={menuIndex}>
                <MenuGroup
                  title={menu.name}
                  textTransform={menu.name === IVA ? 'uppercase' : 'capitalize'}
                >
                  {
                    menu.subMenu.subMenuOptions.map((subMenuOption, subMenuOptionIndex) =>
                      subMenuOption.availableFor.includes(employeeLevel) ?
                        <MenuItem
                          key={subMenuOptionIndex}
                          onClick={() => { Router.push(`/${menu.name.toLocaleLowerCase()}/${subMenuOption.route}`); onClose(); }}
                        >
                          {subMenuOption.description}
                        </MenuItem>
                        : null/*employee level not allowed to interact with this submenu option*/
                    )
                  }
                  <MenuDivider />
                </MenuGroup>
              </Menu>
              : null/*employee level not allowed to interact with this menu*/
          )
        }
        <MenuGroup title={'Perfil'}>
          <MenuItem onClick={() => { Router.push(`/${PERFIL}/${userId}`); onClose(); }}>Ir a mi Perfil</MenuItem>
          <MenuItem onClick={() => { onClose(); signOut(); Router.replace(`/${LOGIN}`) }}>Cerrar Sesión</MenuItem>
        </MenuGroup>
      </MenuList>
    </Menu>
  );
};
