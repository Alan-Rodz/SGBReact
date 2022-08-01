import axios, { AxiosResponse } from 'axios';
import { NextApiResponse } from 'next';

import { API, CREATED_AT_ORDER, PRECIO } from 'general';
import { logRequestError, PriceRequest, setErrorResponse, setSuccessResponse } from 'request';

import { MembershipPriceRequestBody, MembershipPriceRequestResponse } from './type';

// ********************************************************************************
// == Request =====================================================================
export const postMembershipPrice = async (MembershipPriceRequestBody: MembershipPriceRequestBody) => {
  try {
    const { data: requestedMembershipPrice } = await axios.post<MembershipPriceRequestResponse, AxiosResponse<MembershipPriceRequestResponse>, MembershipPriceRequestBody>(`/${API}/${PRECIO}/`, MembershipPriceRequestBody);
    return requestedMembershipPrice;
  } catch (error) {
    console.log(error);
    logRequestError(error, 'postMembershipPrice');    
  }
};

// == Handler =====================================================================
export const handlePostMembershipPrice = async (req: PriceRequest, res: NextApiResponse<MembershipPriceRequestResponse>) => {
  const { priceType, price, startDate, endDate } = req.body;
  if(!priceType || !price || !startDate || !endDate) {
    setErrorResponse(res, 'Received wrong query params for Price POST Request');
    return;
  }/* else -- valid values */

  if(priceType === 'membership') {
    const allMembershipPrices = await prisma.membershipPrice.findMany({ orderBy: { createdAt: CREATED_AT_ORDER } });

    // Disable previous membershipPrice
    if(allMembershipPrices.length > 0) {
      const previousMembershipPriceId = allMembershipPrices[0/*most recently registered membershipPrice*/].id;
            await prisma.membershipPrice.update({ where: { id: previousMembershipPriceId }, data: { endDate: new Date() }});
    }/* else -- first time a membershipPrice is registered, just create a new one */
    
    // Enable new membershipPrice
    const newMembershipPrice = await prisma.membershipPrice.create({ data: { membershipPrice: price, startDate, endDate }, });
    setSuccessResponse(res, { requestedMembershipPrice: newMembershipPrice, requestedMembershipPrices: undefined/*none requested*/ });
  } else {
    setErrorResponse(res, 'Wrong type of priceType for Price POST Request');
  }
};
