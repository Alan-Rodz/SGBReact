import { Avatar, Button, Center, Flex, Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react';
import { EmployeeLevel } from '@prisma/client';
import { signOut } from 'next-auth/react';
import Router from 'next/router';
import Image from 'next/image';

import { menus, CLICKABLE_CLASS, IVA, LIGHT_GRAY, SGB_ICON_ROUTE, PERFIL, LOGIN } from 'general';

// ********************************************************************************
// == Interface ===================================================================
interface Props {
  userId: string;
  userIMG: string | null;
  employeeLevel: EmployeeLevel;
}

// == Component ===================================================================
export const DesktopNavBar: React.FC<Props> = ({ userId, userIMG, employeeLevel }) =>
  <Flex
    gap={1}
    justifyContent='space-evenly'
    width='100%'
    padding='5px'
    paddingBlock='10px'
    backgroundColor={LIGHT_GRAY}
  >
    <Center>
      <Image
        src={SGB_ICON_ROUTE}
        width='30px'
        height='30px'
        alt='logo'
        className={CLICKABLE_CLASS}
        onClick={() => Router.push('/')}
      />
    </Center>
    {
      menus.map((menu, menuIndex) =>
        menu.availableFor.includes(employeeLevel) ?
          <Menu key={menuIndex}>
            <MenuButton
              as={Button}
              leftIcon={menu.icon}
              colorScheme='twitter'
              textTransform={menu.name === IVA ? 'uppercase' : 'capitalize'}
            >
              {menu.name}
            </MenuButton>
            <MenuList>
              {
                menu.subMenu.subMenuOptions.map((subMenuOption, subMenuOptionIndex) =>
                  subMenuOption.availableFor.includes(employeeLevel) ?
                    <MenuItem
                      key={subMenuOptionIndex}
                      onClick={() => Router.push(`/${menu.name.toLocaleLowerCase()}/${subMenuOption.route}`)}
                    >
                      {subMenuOption.description}
                    </MenuItem>
                    : null/*employee level not allowed to interact with this menu*/
                )
              }
            </MenuList>
          </Menu>
          : null/*employee level not allowed to interact with this menu*/
      )
    }
    <Menu>
      <MenuButton as={Avatar} src={userIMG ? userIMG : ''} className={CLICKABLE_CLASS} />
      <MenuList>
        <MenuItem onClick={() => Router.push(`/${PERFIL}/${userId}`)}>Ir a mi Perfil</MenuItem>
        <MenuItem onClick={() => { signOut(); Router.replace(`/${LOGIN}`); }}>Cerrar Sesión</MenuItem>
      </MenuList>
    </Menu>
  </Flex>; 
