import { Box, Text } from '@chakra-ui/react';
import { TaxRate, User } from '@prisma/client';
import type { GetServerSideProps, NextPage } from 'next';
import { getSession } from 'next-auth/react';

import { dateToISOString, redirectToLoginObject, GeneralSeeAll, CREATED_AT_ORDER, DEFAULT_FINAL_DATE, PAGINATION_SIZE } from 'general';
import { isValidSession, parseObjectFromServer, getTaxRates, TransformedTaxRate } from 'request';
import { AppLayout, CenterLayout } from 'ui';

// ********************************************************************************
// == Constant ====================================================================
const transformTaxRates = (taxRates: TaxRate[]) => {
  const transformedTaxRates: TransformedTaxRate[] = [];
  taxRates.forEach(taxRate => {
    transformedTaxRates.push({
      ...taxRate,
      startDate: dateToISOString(taxRate.startDate),
      endDate: dateToISOString(taxRate.endDate) === DEFAULT_FINAL_DATE ? 'Valor Vigente Actualmente' : dateToISOString(taxRate.endDate)
    })
  });

  return transformedTaxRates;
}

// == Interface ===================================================================
interface ShowTaxRatesProps {
  user: User;
  totalTaxRates: number;
  firstTaxRates: TransformedTaxRate[];
}

// == Server Side =================================================================
export const getServerSideProps: GetServerSideProps<ShowTaxRatesProps> = async (context) => {
  // -- Validation ----------------------------------------------------------------
  const session = await getSession(context);
  if(!isValidSession(session)) return redirectToLoginObject/*redirect to login if not authed*/;

  // -- Query ---------------------------------------------------------------------
  const appUser = await prisma.user.findUnique({ where: { email: session.user.email } }),
    totalTaxRates = await prisma.taxRate.count(),
    firstTaxRates = await prisma.taxRate.findMany({ take: PAGINATION_SIZE, orderBy: [{ createdAt: CREATED_AT_ORDER }] });

  // -- Returned Props ------------------------------------------------------------
  return {
    props: {
      user: parseObjectFromServer(appUser),
      totalTaxRates: parseObjectFromServer(totalTaxRates),
      firstTaxRates: parseObjectFromServer(transformTaxRates(firstTaxRates)),
    }
  };
};

// == Client Side =================================================================
const VerIVAs: NextPage<ShowTaxRatesProps> = ({ user, totalTaxRates, firstTaxRates }) => {
  // -- Handler -------------------------------------------------------------------
  const lookForTaxRate = async (taxRateDateStartsWith: string) => {
    const data = await getTaxRates({ requestedTaxRateStartDateStartsWith: taxRateDateStartsWith/*not looking for a taxRate*/, requestedTaxRatePage: ''/*not requesting a page*/, })
    if(!data || !data.requestedTaxRates) {
      return [];
    } /* else -- taxRates found  */
    return transformTaxRates(data.requestedTaxRates);
  };

  const setTaxRatesPage = async (currentPage: number) => {
    const data = await getTaxRates({ requestedTaxRateStartDateStartsWith: ''/*not looking for a taxRate*/, requestedTaxRatePage: currentPage.toString() })
    if(!data || !data.requestedTaxRates) {
      throw new Error('Wrong response from getTaxRates');
    }/* else -- valid response */

    return transformTaxRates(data.requestedTaxRates);
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
          <Text as='strong'>Ver Tasas de IVA</Text>
        </Box>
        <GeneralSeeAll<TransformedTaxRate>
          totalPageObjects={totalTaxRates}
          initialPageObjects={firstTaxRates}
          tableColumnNames={['Porcentaje', 'Fecha de Inicio', 'Fecha de Término']}
          displayedPageObjectProperties={['percentage', 'startDate', 'endDate']}
          showLeftButtons={false/*to modify a tax rate a new one must be created*/}
          leftButtonsString=''/*to modify a tax rate a new one must be created*/

          // .. Input Callback ......................................................
          inputValueChangeCallback={lookForTaxRate}

          // .. Route Callback ......................................................
          editRouteCallback={() => {/*to disable a tax rate a new one must be created*/ }}

          // .. Pages Callback ......................................................
          setPageObjectsCallback={setTaxRatesPage}
        />
      </CenterLayout>
    </AppLayout>
  );
}

export default VerIVAs;