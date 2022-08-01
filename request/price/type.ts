import { NextApiRequest } from 'next';

import { MembershipPriceGetRequestParams, MembershipPriceRequestBody } from './membership';

// ********************************************************************************
// == Interface ===================================================================
export interface PriceRequest extends NextApiRequest {
  query: MembershipPriceGetRequestParams/*NOTE: Other types might be added in the future*/;
  body: MembershipPriceRequestBody/*NOTE: Other types might be added in the future*/;
}
