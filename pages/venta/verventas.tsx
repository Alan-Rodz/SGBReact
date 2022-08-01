import { Box, Text } from '@chakra-ui/react';
import { Sale, User } from '@prisma/client';
import type { GetServerSideProps, NextPage } from 'next';
import { getSession } from 'next-auth/react';
import Router from 'next/router';

import { redirectToLoginObject, userIsAdminOrSecretary, GeneralSeeAll, CREATED_AT_ORDER, PAGINATION_SIZE, VENTA, VER_VENTA } from 'general';
import { isValidSession, parseObjectFromServer, performSaleGetRequest } from 'request';
import { AppLayout, CenterLayout } from 'ui';

// ********************************************************************************
// == Interface ===================================================================
interface ShowSalesProps {
  user: User;
  totalSales: number;
  firstSales: Sale[];
}

// == Server Side =================================================================
export const getServerSideProps: GetServerSideProps<ShowSalesProps> = async (context) => {
  // -- Validation ----------------------------------------------------------------
  const session = await getSession(context);
  if (!isValidSession(session)) return redirectToLoginObject/*redirect to login if not authed*/;

  // -- Query ---------------------------------------------------------------------
  const appUser = await prisma.user.findUnique({ where: { email: session.user.email } }),
    totalSales = await prisma.sale.count(),
    firstSales = await prisma.sale.findMany({ take: PAGINATION_SIZE, orderBy: [{ createdAt: CREATED_AT_ORDER }] });

  // -- Returned Props ------------------------------------------------------------
  return {
    props: {
      user: parseObjectFromServer(appUser),
      totalSales: parseObjectFromServer(totalSales),
      firstSales: parseObjectFromServer(firstSales),
    }
  };
};

// == Client Side =================================================================
const VerVentas: NextPage<ShowSalesProps> = ({ user, totalSales, firstSales }) => {
  // -- Handler -------------------------------------------------------------------
  const lookForSale = async (saleIdStartsWith: string) => {
    const data = await performSaleGetRequest({
      saleIdStartsWith,
      requestedSalesPage: ''/*not looking for a page*/,
      saleId: ''/*not requesting info about a sale*/,
      bookId: ''/*not requesting bookCopies for a book*/,
      editionNameStartsWith: ''/*not requesting bookCopies whose editionNameStartsWith*/,
      bookCopyId: ''/*not requesting information about a bookCopy*/
    });
    if (!data || !data.requestedSales) {
      return [];
    } /* else -- Sales found  */
    return data.requestedSales;
  }

  const seeSaleDetails = (sale: Sale) => Router.push(`/${VENTA}/${VER_VENTA}/${sale.id}`);

  const setSalesPage = async (currentPage: number) => {
    const data = await performSaleGetRequest({
      saleIdStartsWith: ''/*not looking for sales whose saleIdStartsWith*/,
      requestedSalesPage: currentPage.toString(),
      saleId: ''/*not requesting info about a sale*/,
      bookId: ''/*not requesting bookCopies for a book*/,
      editionNameStartsWith: ''/*not requesting bookCopies whose editionNameStartsWith*/,
      bookCopyId: ''/*not requesting information about a bookCopy*/
    });
    if (!data || !data.requestedSales) {
      return [];
    } /* else -- Sales found  */
    return data.requestedSales;
  }

  // -- UI ------------------------------------------------------------------------
  return (
    <AppLayout
      userId={user.id}
      userIMG={user.image}
      employeeLevel={user.employeeLevel}
    >
      <CenterLayout>
        <Box marginRight='auto'>
          <Text as='strong'>Ver Ventas</Text>
        </Box>
        <GeneralSeeAll<Sale>
          totalPageObjects={totalSales}
          initialPageObjects={firstSales}
          tableColumnNames={['ID de Venta']}
          displayedPageObjectProperties={['id']}
          showLeftButtons={userIsAdminOrSecretary(user)}
          leftButtonsString='Detalles'

          // .. Input Callback ......................................................
          inputValueChangeCallback={lookForSale}

          // .. Route Callback ......................................................
          editRouteCallback={seeSaleDetails}

          // .. Pages Callback ......................................................
          setPageObjectsCallback={setSalesPage}
        />
      </CenterLayout>
    </AppLayout>
  );
}

export default VerVentas;