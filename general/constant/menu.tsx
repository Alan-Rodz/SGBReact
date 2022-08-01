import { EmployeeLevel, User } from '@prisma/client';
import { AiOutlineBook } from 'react-icons/ai';
import { BiBookOpen, BiUser, BiPencil } from 'react-icons/bi';
import { FaBookReader } from 'react-icons/fa';
import { HiOutlineReceiptTax } from 'react-icons/hi';
import { MdAttachMoney, MdPointOfSale } from 'react-icons/md';

import { AUTOR, EJEMPLAR, EMPLEADO, IVA, LIBRO, MODIFICAR_PRECIO_MEMBRESIA, PRECIO, REGISTRAR_AUTOR, REGISTRAR_EJEMPLAR, REGISTRAR_IVA, REGISTRAR_LIBRO, REGISTRAR_VENTA, REGISTRAR_VENTA_MEMBRESIA, USUARIO, VENTA, VER_AUTORES, VER_EJEMPLARES, VER_EMPLEADOS, VER_IVAS, VER_LIBROS, VER_PRECIOS_MEMBRESIA, VER_USUARIOS, VER_VENTAS } from './route';

// ********************************************************************************
// == Access ======================================================================
const ADMIN = [EmployeeLevel.ADMIN];
export const userIsAdmin = (user: User) => user.employeeLevel == EmployeeLevel.ADMIN;

const ADMIN_OR_SECRETARY = [EmployeeLevel.ADMIN, EmployeeLevel.SECRETARY];
export const userIsAdminOrSecretary = (user: User) => user.employeeLevel == EmployeeLevel.ADMIN || user.employeeLevel == EmployeeLevel.SECRETARY;

const ANY_USER_LEVEL = Object.values(EmployeeLevel);
export const userIsAnyEmployeeLevel = (user: User) => user.employeeLevel in EmployeeLevel;

// == Menu ========================================================================
// -- Type ------------------------------------------------------------------------
export type Menu = {
  name: string;
  icon: React.ReactNode;
  availableFor: EmployeeLevel[];
  subMenu: SubMenu;
};
type SubMenu = {
  subMenuOptions: SubMenuOption[];
};
type SubMenuOption = {
  description: string;
  route: string;
  availableFor: EmployeeLevel[];
};

// -- Employee --------------------------------------------------------------------
const menuEmpleados: Menu = {
  name: EMPLEADO,
  icon: <BiUser />,
  availableFor: ADMIN,
  subMenu: {
    subMenuOptions: [
      {
        description: 'Ver Empleados',
        route: `${VER_EMPLEADOS}`,
        availableFor: ADMIN
      }
    ]
  }
};

// -- LibraryUser -----------------------------------------------------------------
const menuUsuarios: Menu = {
  name: USUARIO,
  icon: <FaBookReader />,
  availableFor: ADMIN_OR_SECRETARY,
  subMenu: {
    subMenuOptions: [
      {
        description: 'Ver Usuarios',
        route: `${VER_USUARIOS}`,
        availableFor: ADMIN_OR_SECRETARY
      },
    ]
  }
};

// -- Book ------------------------------------------------------------------------
const menuLibros: Menu = {
  name: LIBRO,
  icon: <AiOutlineBook />,
  availableFor: ANY_USER_LEVEL,
  subMenu: {
    subMenuOptions: [
      {
        description: 'Registrar Libro',
        route: `${REGISTRAR_LIBRO}`,
        availableFor: ADMIN_OR_SECRETARY
      },
      {
        description: 'Ver Libros',
        route: `${VER_LIBROS}`,
        availableFor: ANY_USER_LEVEL
      },
    ]
  }
};

// -- BookCopy --------------------------------------------------------------------
const menuEjemplares: Menu = {
  name: EJEMPLAR,
  icon: <BiBookOpen />,
  availableFor: ANY_USER_LEVEL,
  subMenu: {
    subMenuOptions: [
      {
        description: 'Registrar Ejemplar',
        route: `${REGISTRAR_EJEMPLAR}`,
        availableFor: ADMIN_OR_SECRETARY
      },
      {
        description: 'Ver Ejemplares',
        route: `${VER_EJEMPLARES}`,
        availableFor: ANY_USER_LEVEL
      }
    ]
  }
};

// -- Sale ------------------------------------------------------------------------
const menuVentas: Menu = {
  name: VENTA,
  icon: <MdPointOfSale />,
  availableFor: ADMIN_OR_SECRETARY,
  subMenu: {
    subMenuOptions: [
      {
        description: 'Registrar Venta',
        route: `${REGISTRAR_VENTA}`,
        availableFor: ADMIN_OR_SECRETARY
      },
      {
        description: 'Registrar Venta de Membresía',
        route: `${REGISTRAR_VENTA_MEMBRESIA}`,
        availableFor: ADMIN_OR_SECRETARY
      },
      {
        description: 'Ver Ventas',
        route: `${VER_VENTAS}`,
        availableFor: ADMIN_OR_SECRETARY
      }
    ]
  }
};

// -- Author ----------------------------------------------------------------------
const menuAutores: Menu = {
  name: AUTOR,
  icon: <BiPencil />,
  availableFor: ANY_USER_LEVEL,
  subMenu: {
    subMenuOptions: [
      {
        description: 'Registrar Autor',
        route: `${REGISTRAR_AUTOR}`,
        availableFor: ADMIN_OR_SECRETARY
      },
      {
        description: 'Ver Autores',
        route: `${VER_AUTORES}`,
        availableFor: ANY_USER_LEVEL
      }
    ]
  }
};

// -- TaxRate ---------------------------------------------------------------------
const menuIVA: Menu = {
  name: IVA,
  icon: <HiOutlineReceiptTax />,
  availableFor: ADMIN,
  subMenu: {
    subMenuOptions: [
      {
        description: 'Registrar Tasa de IVA',
        route: `${REGISTRAR_IVA}`,
        availableFor: ADMIN
      },
      {
        description: 'Ver Tasas de IVA',
        route: `${VER_IVAS}`,
        availableFor: ADMIN
      },
    ]
  }
};

// -- Price -----------------------------------------------------------------------
const menuPrecios: Menu = {
  name: PRECIO,
  icon: <MdAttachMoney />,
  availableFor: ADMIN,
  subMenu: {
    subMenuOptions: [
      {
        description: 'Registrar Nuevo Precio de Membresía',
        route: `${MODIFICAR_PRECIO_MEMBRESIA}`,
        availableFor: ADMIN
      },
      {
        description: 'Ver Precios de Membresía',
        route: `${VER_PRECIOS_MEMBRESIA}`,
        availableFor: ADMIN
      },
    ]
  }
};

// --------------------------------------------------------------------------------
export const menus: Menu[] = [
  menuEmpleados,
  menuUsuarios,
  menuLibros,
  menuEjemplares,
  menuVentas,
  menuAutores,
  menuIVA,
  menuPrecios
];
