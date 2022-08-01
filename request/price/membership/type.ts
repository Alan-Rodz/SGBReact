import { MembershipPrice } from '@prisma/client';

import { Modify } from 'type';

// ********************************************************************************
// == Type ========================================================================
export type TransformedMembershipPrice = Modify<MembershipPrice, { startDate: string; endDate: string; }> 

// == Interface ===================================================================
export interface MembershipPriceRequestBody { 
  priceType: 'membership'/*other types might be added later*/;
  price: number;
  startDate: Date;
  endDate: Date;
}

export interface MembershipPriceRequestResponse { 
  requestedMembershipPrice: MembershipPrice | undefined/*not requesting a MembershipPrice or not a valid response for the used method*/;
  requestedMembershipPrices: MembershipPrice[] | undefined/*not requesting MembershipPrices or not a valid response for the used method*/;
}
