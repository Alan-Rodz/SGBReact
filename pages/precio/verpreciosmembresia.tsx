import { Box, Text } from '@chakra-ui/react';
import { MembershipPrice, User } from '@prisma/client';
import type { GetServerSideProps, NextPage } from 'next';
import { getSession } from 'next-auth/react';

import { dateToISOString, redirectToLoginObject, GeneralSeeAll, CREATED_AT_ORDER, DEFAULT_FINAL_DATE, PAGINATION_SIZE } from 'general';
import { getMembershipPrices, isValidSession, parseObjectFromServer, TransformedMembershipPrice } from 'request';
import { AppLayout, CenterLayout } from 'ui';

// ********************************************************************************
// == Constant ====================================================================
const transformMembershipPrices = (membershipPrices: MembershipPrice[]) => {
  const transformedMembershipPrices: TransformedMembershipPrice[] = [];
  membershipPrices.forEach(membershipPrice =>
    transformedMembershipPrices.push({
      ...membershipPrice,
      startDate: dateToISOString(new Date(membershipPrice.startDate)),
      endDate: dateToISOString(membershipPrice.endDate) === DEFAULT_FINAL_DATE ? 'Valor Vigente Actualmente' : dateToISOString(membershipPrice.endDate)
    })
  );

  return transformedMembershipPrices;
}

// == Interface ===================================================================
interface ShowMembershipPricesProps {
  user: User;
  totalMembershipPrices: number;
  firstMembershipPrices: TransformedMembershipPrice[];
}

// == Server Side =================================================================
export const getServerSideProps: GetServerSideProps<ShowMembershipPricesProps> = async (context) => {
  // -- Validation ----------------------------------------------------------------
  const session = await getSession(context);
  if(!isValidSession(session)) return redirectToLoginObject/*redirect to login if not authed*/;

  // -- Query ---------------------------------------------------------------------
  const appUser = await prisma.user.findUnique({ where: { email: session.user.email } }),
    totalMembershipPrices = await prisma.membershipPrice.count(),
    firstMembershipPrices = await prisma.membershipPrice.findMany({ take: PAGINATION_SIZE, orderBy: [{ createdAt: CREATED_AT_ORDER }] });

  // -- Returned Props ------------------------------------------------------------
  return {
    props: {
      user: parseObjectFromServer(appUser),
      totalMembershipPrices: parseObjectFromServer(totalMembershipPrices),
      firstMembershipPrices: parseObjectFromServer(transformMembershipPrices(firstMembershipPrices)),
    }
  };
};

// == Client Side =================================================================
const VerPreciosMembresia: NextPage<ShowMembershipPricesProps> = ({ user, totalMembershipPrices, firstMembershipPrices }) => {
  // -- Handler -------------------------------------------------------------------
  const lookForMembershipPrice = async (membershipPriceDateStartsWith: string) => {
    const data = await getMembershipPrices({ requestedMembershipPriceStartDateStartsWith: membershipPriceDateStartsWith, requestedMembershipPricePage: ''/*not requesting a page*/, })
    if(!data || !data.requestedMembershipPrices) {
      return [];
    } /* else -- membershipPrices found  */
    return transformMembershipPrices(data.requestedMembershipPrices);
  };

  const setMembershipPricesPage = async (currentPage: number) => {
    const data = await getMembershipPrices({ requestedMembershipPriceStartDateStartsWith: ''/*not looking for a membershipPrice*/, requestedMembershipPricePage: currentPage.toString() })
    if(!data || !data.requestedMembershipPrices) {
      throw new Error('Wrong response from getMembershipPrices');
    }/* else -- valid response */

    return transformMembershipPrices(data.requestedMembershipPrices);
  };

  // -- UI ------------------------------------------------------------------------
  return (
    <AppLayout
      userId={user.id}
      userIMG={user.image}
      employeeLevel={user.employeeLevel}
    >
      <CenterLayout>
        <Box marginRight='auto'>
          <Text as='strong'>Ver Precios de Membresía</Text>
        </Box>
        <GeneralSeeAll<TransformedMembershipPrice>
          totalPageObjects={totalMembershipPrices}
          initialPageObjects={firstMembershipPrices}
          tableColumnNames={['Precio', 'Fecha de Inicio', 'Fecha de Término']}
          displayedPageObjectProperties={['membershipPrice', 'startDate', 'endDate']}
          showLeftButtons={false/*to disable a tax rate a new one must be created*/}
          leftButtonsString='Editar'

          // .. Input Callback ......................................................
          inputValueChangeCallback={lookForMembershipPrice}

          // .. Route Callback ......................................................
          editRouteCallback={() => {/*to disable a membership price a new one must be created*/ }}

          // .. Pages Callback ......................................................
          setPageObjectsCallback={setMembershipPricesPage}
        />
      </CenterLayout>
    </AppLayout>
  );
}

export default VerPreciosMembresia;
