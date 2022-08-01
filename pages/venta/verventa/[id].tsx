import { Book, BookCopiesOnSale, BookCopy, LibraryUser, Sale, User } from '@prisma/client';
import { useToast, Center, Text, Tooltip, IconButton, Input, Table, TableContainer, Tbody, Td, Th, Thead, Tr, VStack, Box } from '@chakra-ui/react';
import type { GetServerSideProps, NextPage } from 'next';
import { getSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { HiOutlineDocumentDownload } from 'react-icons/hi';

import { applyTaxRateToPrice, dateToISOString, redirectToLoginObject, pdfJSONBufferToURL, NOT_AVAILABLE } from 'general';
import { getLibraryUsers, isValidSession, logRequestError, parseObjectFromServer, performSaleGetRequest } from 'request';
import { AppLayout, CenterLayout, LoadingScreen } from 'ui';

// ********************************************************************************
interface SeeSaleProps {
  user: User;
  sale: Sale & { libraryUser: LibraryUser; };
  employeeWhoMadeSale: User;
  appliedTaxRatePercentage: number;
  books: Book[];
  bookCopiesOnSale: (BookCopiesOnSale & { bookCopy: BookCopy; })[];
}
// == Server Side =================================================================
export const getServerSideProps: GetServerSideProps<SeeSaleProps> = async (context) => {
  // -- Validation ----------------------------------------------------------------
  const session = await getSession(context);
  if (!isValidSession(session)) return redirectToLoginObject/*redirect to login if not authed*/;

  // -- Query ---------------------------------------------------------------------
  const saleId = context.query.id;
  if (typeof saleId !== 'string') throw new Error(`Received wrong query id: ${saleId}`);

  const appUser = await prisma.user.findUnique({ where: { email: session.user.email } }),
        sale = await prisma.sale.findUnique({ where: { id: saleId }, include: { libraryUser: true } }),
        employeeWhoMadeSale = await prisma.user.findUnique({ where: { id: sale?.employeeId } }),
        taxRatePercentages = await prisma.taxRate.findMany({ where: { startDate: { lte: sale?.date } } })/*get percentages whose startDate is less than the date of the sale */,
        appliedTaxRatePercentage = taxRatePercentages[taxRatePercentages.length - 1].percentage/*get most recent of all percentages */,
        bookCopiesOnSale = await prisma.bookCopiesOnSale.findMany({ where: { saleId: sale?.id }, include: { bookCopy: true } });

  const books: Book[] = [];
  for (const bookCopyOnSale of bookCopiesOnSale) {
    const book = await prisma.book.findUnique({ where: { id: bookCopyOnSale.bookCopy.bookId } });
    if (!book) {
      continue;
    }/* else -- book exists */

    books.push(book);
  }

  // -- Returned Props ------------------------------------------------------------
  return {
    props: {
      user: parseObjectFromServer(appUser),
      employeeWhoMadeSale: parseObjectFromServer(employeeWhoMadeSale),
      appliedTaxRatePercentage: parseObjectFromServer(appliedTaxRatePercentage),
      sale: parseObjectFromServer(sale),
      books: parseObjectFromServer(books),
      bookCopiesOnSale: parseObjectFromServer(bookCopiesOnSale),
    }
  };
};

// == Client Side =================================================================
const VerVenta: NextPage<SeeSaleProps> = ({ user, sale, employeeWhoMadeSale, appliedTaxRatePercentage, books, bookCopiesOnSale }) => {
  const toast = useToast();

  // -- State ---------------------------------------------------------------------
  const [isGettingPDF, setIsGettingPDf] = useState(false);
  const [hasCheckedForLibraryUser, setHasCheckedForLibraryUser] = useState(false);
  const [libraryUser, setLibraryUser] = useState<LibraryUser | undefined>(undefined);

  // -- Effect --------------------------------------------------------------------
  useEffect(() => {
    const lookForLibraryUser = async () => {
      if(!sale.libraryUser) {
        return;
      }/* else - membership sale */

      const libraryUserResponse = await getLibraryUsers({
        requestedLibraryUserId: sale.libraryUser.id,
        requestedLibraryUserNameStartsWith: ''/*not looking for library user*/,
        requestedLibraryUsersPage: ''/*not requesting a page*/,
        requestedLibraryUserMembershipRoute: ''/*not requesting the PDF for a sale*/
      });

      if(!libraryUserResponse || !libraryUserResponse.requestedLibraryUser) { 
        return;
      }/* else -- library user exists*/
      setLibraryUser(libraryUserResponse.requestedLibraryUser);
      setHasCheckedForLibraryUser(true);
    }

    lookForLibraryUser();
  }, []);

  // -- Handler -------------------------------------------------------------------
  const getSalePDF = async () => {
    try {
      setIsGettingPDf(true);
      const saleInfo = await performSaleGetRequest({
        saleIdStartsWith: ''/*not looking for sales*/,
        requestedSalesPage: ''/*not looking for a page*/,
        saleId: sale.id,
        bookId: ''/*not looking for bookCopies of a bookId*/,
        editionNameStartsWith: ''/*not looking for bookCopies of a bookId*/,
        bookCopyId: '', /*not looking for a specific bookCopy*/
      });
      if (!saleInfo || !saleInfo.salePDFJSONBuffer) {
        throw new Error('PDFBlob was not returned from server');
      }/* else -- got buffer */
      window.open(pdfJSONBufferToURL(saleInfo.salePDFJSONBuffer));

    } catch (error) {
      logRequestError(error, 'gettingPDF for Sale');
    } finally {
      setIsGettingPDf(false);
    }
  };

  // -- UI ------------------------------------------------------------------------
  // NOTE: Not awaiting for the useEffect check to be done causes dates to be set
  //       as undefined. Hence the LoadingScreen
  if(!hasCheckedForLibraryUser) {
    return <LoadingScreen />
  }/* else -- already checked for user */

  return (
    <AppLayout
      userId={user.id}
      userIMG={user.image}
      employeeLevel={user.employeeLevel}
    >
      <CenterLayout>
        <VStack
          align='flex-start'
          spacing={4}
        >
          <Center width='full'>
            <Text as='strong'>Ver Detalles de Venta</Text>
            <Tooltip label='Ver PDF de Venta'>
              <IconButton
                icon={<HiOutlineDocumentDownload />}
                marginLeft='auto'
                aria-label='getMembershipSalePDF'
                isDisabled={isGettingPDF}
                onClick={getSalePDF}
              />
            </Tooltip>
          </Center>
          {/* .. Preamble  .................................................... */}
          <Text>ID de la Venta</Text>
          <Input value={sale.id} readOnly />

          <Text>Nombre del Empleado</Text>
          <Input value={employeeWhoMadeSale.name ?? NOT_AVAILABLE} readOnly />

          <Text>Fecha de la Venta</Text>
          <Input value={dateToISOString(new Date(sale.date))} readOnly />

          <Text>Tasa de IVA Aplicada</Text>
          <Input value={`${appliedTaxRatePercentage}%`} readOnly />

          {sale.libraryUser
            ?
            <>
              <Text>Nombre del Usuario</Text>
              <Input value={libraryUser?.name} readOnly />

              <Text>Email del Usuario</Text>
              <Input value={libraryUser?.email} readOnly />

              <Text>Fecha de Expiración de la Membresía</Text>
              <Input value={dateToISOString(new Date(libraryUser?.membershipExpDate ?? NOT_AVAILABLE))} readOnly />
            </>
            :
            <Box width='full'>
              <TableContainer>
                <Table>
                  <Thead>
                    <Tr>
                      <Th>Nombre del Libro</Th>
                      <Th>Edición</Th>
                      <Th isNumeric>Precio (MXN)</Th>
                      <Th isNumeric>Precio con IVA (MXN)</Th>
                      <Th isNumeric>Cantidad</Th>
                      <Th isNumeric>Importe Total (MXN)</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {bookCopiesOnSale.map((bookCopyOnSale, bookCopyOnSaleIndex) => {
                      const priceWithTax = applyTaxRateToPrice(bookCopyOnSale.bookCopy.priceMXN, appliedTaxRatePercentage);
                      return (
                        <Tr key={bookCopyOnSaleIndex}>
                          <Td>{books[bookCopyOnSaleIndex].name}</Td>
                          <Td>{bookCopyOnSale.bookCopy.edition}</Td>
                          <Td isNumeric>{bookCopyOnSale.bookCopy.priceMXN}</Td>
                          <Td isNumeric>{priceWithTax}</Td>
                          <Td isNumeric>{bookCopyOnSale.quantity}</Td>
                          <Td isNumeric>{priceWithTax * bookCopyOnSale.quantity}</Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </TableContainer>
            </Box>
          }
          <Text>Costo Total de la Venta</Text>
          <Input value={sale.price} readOnly />
        </VStack>
      </CenterLayout>
    </AppLayout>
  );
};

export default VerVenta;
