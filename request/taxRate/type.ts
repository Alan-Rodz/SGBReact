import { TaxRate } from '@prisma/client';
import { NextApiRequest } from 'next';

import { TaxRateGetRequestParams } from './get';
import { Modify } from 'type';

// ********************************************************************************
// == Type ========================================================================
export type TransformedTaxRate = Modify<TaxRate, { startDate: string; endDate: string; }> 

// == Interface ===================================================================
export interface TaxRateRequest extends NextApiRequest {
  query: TaxRateGetRequestParams;
  body: TaxRateRequestBody;
}

export interface TaxRateRequestBody { 
  percentage: number;
  startDate: Date;
  endDate: Date;
}

export interface TaxRateRequestResponse { 
  requestedTaxRate: TaxRate | undefined/*not requesting a taxRate or not a valid response for the used method*/;
  requestedTaxRates: TaxRate[] | undefined/*not requesting taxRates or not a valid response for the used method*/;
}
