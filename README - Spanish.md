# Sistema de Gestión Bibliotecaria

If you're looking for the English version of this README.md file, look at 
README.md

DISCLAIMER: Esta aplicación fue desarrollada con propósitos educativos y
no es representa un producto listo para un entorno de producción.

El 'Sistema de Gestión Bibliotecaria' es un proyecto desarrollado para
aprender a usar las siguientes tecnologías:
- NextJS 
- NextAuth
- Prisma
- SupaBase

Así como las siguientes librerías:
- Formik
- Yup
- jsPDF
- NodeMailer

# Objetivos
La aplicación es una representación de un sistema que debería ayudar a una
biblioteca ficticia a mejorar su administración. Originalmente este era un 
proyecto que hice para la escuela, pero la versión anterior tenía una funcionalidad
mucho menor (por ejemplo, carecía de autenticación). Esta versión fue por
tanto desarrollada para ver cómo sería realizar un proyecto más completo.

# Resumen de la Arquitectura
La aplicación está hecha con NextJS, que provee las herramientas necesarias
para administrar el FrontEnd y el BackEnd de la aplicación. Se está usando 
Prisma como un adaptador para comunicarse, a través de NextAuth, con SupaBase,
que hace uso de una base de datos con PostgreSQL y una bucket para almacenar
los archivos PDF generados por la aplicación.

# Features
## Pantalla de Login
El usuario puede iniciar sesión a través de su cuenta de Gmail, o un 
link de Email provisto por NextAuth puede ser enviado al Email que
ingresen. Estos links son válidos por 10 minutos. Si es la primera vez
que el usuario inicia sesión, un Email de Bienvenida será enviado también.
![loginScreen](https://github.com/Alan-Rodz/SGBReact/blob/main/img/loginScreen.png)
![loginEmail](https://github.com/Alan-Rodz/SGBReact/blob/main/img/loginEmail.png)
![welcomeEmail](https://github.com/Alan-Rodz/SGBReact/blob/main/img/welcomeEmail.png)

## Menú Principal de la Aplicación
El menú principal muestra los Logos de la App, así como una NavBar para 
que el Usuario pueda navegar a través de su funcionalidad.
![mainMenu](https://github.com/Alan-Rodz/SGBReact/blob/main/img/mainMenu.png)

## Empleado
### Ver todos los Empleados
Un Empleado que tenga nivel de Administrador puede acceder al menú para ver
la información de todos los Empleados
![seeAllEmployee](https://github.com/Alan-Rodz/SGBReact/blob/main/img/seeAllEmployee.png)

### Actualizar la Información de un Empleado
Un Administrador puede modificar la información de otro Empleado.
![updateEmployee](https://github.com/Alan-Rodz/SGBReact/blob/main/img/updateEmployee.png)

## Usuario de la Librería
Un Empleado cuyo nivel de Empleado sea el de Administrador o Secretaría tiene acceso
a la información de los Usuarios de la Librería, y puede actualizar su información. 
Los PDFs que se generan cuando se vende una membresía pueden ser accedidos también.
![seeAllLibraryUser](https://github.com/Alan-Rodz/SGBReact/blob/main/img/seeAllLibraryUser.png)
![updateLibraryUser](https://github.com/Alan-Rodz/SGBReact/blob/main/img/updateLibraryUser.png)
![membershipSalePDF](https://github.com/Alan-Rodz/SGBReact/blob/main/img/membershipSalePDF.png)

## Libro
Los Libros pueden ser registrados, buscados, y su información puede ser actualizada.
![registerBook](https://github.com/Alan-Rodz/SGBReact/blob/main/img/registerBook.png)
![seeAllBook](https://github.com/Alan-Rodz/SGBReact/blob/main/img/seeAllBook.png)
![updateBook](https://github.com/Alan-Rodz/SGBReact/blob/main/img/updateBook.png)

## Ejemplar
Los Ejemplares pueden ser registrados, buscados, y su información puede ser actualizada.
![registerBookCopy](https://github.com/Alan-Rodz/SGBReact/blob/main/img/registerBookCopy.png)
![seeAllBookCopy](https://github.com/Alan-Rodz/SGBReact/blob/main/img/seeAllBookCopy.png)
![updateBookCopy](https://github.com/Alan-Rodz/SGBReact/blob/main/img/updateBookCopy.png)

## Venta
Las Ventas pueden ser de Libros o Membresías. Pueden ser vistas y buscadas. El PDF
que generan cuando son llevadas a cabo puede ser accedido.
![registerSale](https://github.com/Alan-Rodz/SGBReact/blob/main/img/registerSale.png)
![registerMembershipSale](https://github.com/Alan-Rodz/SGBReact/blob/main/img/registerMembershipSale.png)
![seeAllSale](https://github.com/Alan-Rodz/SGBReact/blob/main/img/seeAllSale.png)
![seeMembershipSale](https://github.com/Alan-Rodz/SGBReact/blob/main/img/seeMembershipSale.png)

## Emails de Venta
Cuando una Venta de Libros o de Membresía es realizada, el cliente recibe 
un Email como confirmación, que contiene información sobre los productos
que fueron comprados.
![saleEmail](https://github.com/Alan-Rodz/SGBReact/blob/main/img/saleEmail.png)

## Autor
Los Autores pueden ser registrados, buscados, y su información puede ser actualizada.
![registerAuthor](https://github.com/Alan-Rodz/SGBReact/blob/main/img/registerAuthor.png)
![seeAllAuthor](https://github.com/Alan-Rodz/SGBReact/blob/main/img/seeAllAuthor.png)
![updateAuthor](https://github.com/Alan-Rodz/SGBReact/blob/main/img/updateAuthor.png)

## Tasa de IVA
Las Tasas de IVA pueden ser registradas y buscadas. Una vez que son establecidas,
la única manera de cambiarlas es poniendo una nueva. Esto es para mantener la 
información de todas las Tasas de IVA que han sido aplicadas anteriormente.
![registerTaxRate](https://github.com/Alan-Rodz/SGBReact/blob/main/img/registerTaxRate.png)
![seeAllTaxRate](https://github.com/Alan-Rodz/SGBReact/blob/main/img/seeAllTaxRate.png)

## Prices
Como los Precios de las Membresías pueden variar a través del tiempo, un Administrador
puede agregar nuevos Precios de Membresía. Las mismas limitaciones que aplican a las
Tasas de IVA también aplican a estos Precios.
![registerMembershipPrice](https://github.com/Alan-Rodz/SGBReact/blob/main/img/registerMembershipPrice.png)
![seeAllMembershipPrice](https://github.com/Alan-Rodz/SGBReact/blob/main/img/seeAllMembershipPrice.png)

## Perfil
El usuario tiene acceso a la página de su perfil, donde puede encontrar información
sobre sí mismo.
![profilePage](https://github.com/Alan-Rodz/SGBReact/blob/main/img/profilePage.png)

# Otras Features
## Página 404
![404](https://github.com/Alan-Rodz/SGBReact/blob/main/img/404.png)

## Página y Ruta para llenar la Base de Datos
Una página con un botón en medio que permite poner información de prueba
en la base de datos.
![populate](https://github.com/Alan-Rodz/SGBReact/blob/main/img/populate.png)

# Esquema de la Aplicación
NOTA: Las entidades que no son discutidas a continuación están relacionadas
con NextAuth, y mayor información sobre ellas puede encontrarse en: https://next-auth.js.org/adapters/prisma

## Usuario / Empleado
Los Empleados son los usuarios de la Aplicación. Están categorizados en 3 niveles:
Administrador, Secretaria y Empleado (la categoría de menor autoridad). El Nivel de
Empleado de un Empleado determina qué operaciones puede realizar a través de la 
aplicación. Dado que los Usuarios están pueden iniciar o cerrar sesión, la misma 
entidad que es usada para los Usuarios también es usada para los Empleados en el
Esquema de Prisma.

## Autor
Los Autores son los individuos que escriben los libros que venda la biblioteca ficticia.
La única información que se guarda sobre ellos es su nombre.

## Libro
Los Libros son auto descriptivos. Se guarda información sobre su género, fecha de 
la primera publicación, y su Autor.

## Ejemplar
Un Ejemplar representa una versión determinada de un Libro. Dado que distintos
Ejemplares pueden tener diferencias entre ellos (como el precio), información como
el número específico de páginas, su precio, y cuantas copias tiene la librería 
actualmente es guardada.

## Usuario de la Librería
Esta Entidad representa un individuo que frecuenta la librería para leer libros.
Este individuo puede adquirir una membresía que le permita disfrutar de diferentes
beneficios (cosas como el préstamo de Libros están afuera del alcance de la
aplicación). Se guarda información sobre su nombre y Email.

## Precio de Membresía
Los Precios de las Membresías pueden variar a través del tiempo y pueden ser 
modificados por cualquier Empleado que tenga Nivel de Administrador. Solo pueden
ser establecidos, lo que significa que para establecer uno nuevo, el anterior debe
ser sustituido, pero permanecerá en la base de datos.

## Venta
Pueden realizarse Ventas para Membresías para la Biblioteca, que implican
el registro de un nuevo Usuario de Biblioteca, o de Libros. En ambos casos, 
se guarda información acerca del Empleado que realizó la Venta, la ruta del 
archivo PDF generado, el Precio total, entre otros.

## Tasa de IVA
Las Tasas de IVA representan el IVA que se le aplica a cierta Venta. Tienen
las mismas limitaciones que los Precios de Membresía. 

# Limitaciones del Proyecto
Existen varias cosas que están más allá del alcance de esta pequeña aplicación,
así como varias áreas que podrían mejorarse, entre las cuales se encuentran:
- Mejorar el manejo de Fechas
- Mejorar la lógica de componentes como PaginationButtons.tsx
- La relación entre Ventas, PDFs y Tablas podría mejorar.
- Mayor desarrollo de la logística de lo que implica actualizar una 
Membresía (por ejemplo, obligar la renovación de una Membresía dadas 
ciertas condiciones) podría ser implementada
- Mayor desarrollo de la logística de las Ventas de Libros podría implementarse

Y estoy seguro de que hay muchos otros aspectos que podrían mejorar. Pero como
se menciona en el disclaimer, el propósito del desarrollo de esta 
aplicación es educativo.
