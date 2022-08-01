import axios, { AxiosResponse } from 'axios';
import { NextApiResponse } from 'next';

import { computeBiggerThanPageIndex, dateToISOString, API, CREATED_AT_ORDER, PAGINATION_SIZE, PRECIO } from 'general';
import { logRequestError, setErrorResponse, setSuccessResponse, PriceRequest } from 'request';

import { MembershipPriceRequestResponse } from './type';

// ********************************************************************************
// == Interface ===================================================================
export interface MembershipPriceGetRequestParams {
  [key: string]: string;
  requestedMembershipPriceStartDateStartsWith: string;
  requestedMembershipPricePage: string;
}

// == Request =====================================================================
export const getMembershipPrices = async (params: MembershipPriceGetRequestParams) => {
  try {
    const { data } = await axios.get<MembershipPriceRequestResponse, AxiosResponse<MembershipPriceRequestResponse>, MembershipPriceGetRequestParams>(`/${API}/${PRECIO}/`, { params });
    return data;
  } catch (error) {
    logRequestError(error, 'getMembershipPrices');    
  }
};

// == Handler =====================================================================
export const handleGetMembershipPrice = async (req: PriceRequest, res: NextApiResponse<MembershipPriceRequestResponse>) => {
  const { requestedMembershipPriceStartDateStartsWith, requestedMembershipPricePage } = req.query;
  if(requestedMembershipPriceStartDateStartsWith/*get membershipPrices whose date starts with*/) {
    const membershipPrices = await prisma.membershipPrice.findMany(),
          filteredMembershipPrices = membershipPrices.filter(membershipPrice => dateToISOString(membershipPrice.createdAt).includes(requestedMembershipPriceStartDateStartsWith));
    setSuccessResponse(res, { requestedMembershipPrice: undefined/*none requested*/, requestedMembershipPrices: filteredMembershipPrices });
    return;

  } else if(requestedMembershipPricePage/*get membershipPrices for a page*/) {
    const biggerThanIndex = computeBiggerThanPageIndex(Number(requestedMembershipPricePage));
    const membershipPrices = await prisma.membershipPrice.findMany({ orderBy: { createdAt: CREATED_AT_ORDER } }),
          filteredMembershipPrices = membershipPrices.filter((membershipPrice, index) => index > Number(biggerThanIndex)).slice(0, PAGINATION_SIZE/*get first N amount*/);
    setSuccessResponse(res, { requestedMembershipPrice: undefined/*none requested*/, requestedMembershipPrices: filteredMembershipPrices });
    return;
  } /* else -- error */

  setErrorResponse(res, 'Received wrong query params for Price GET Request');
};
