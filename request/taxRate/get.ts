import axios, { AxiosResponse } from 'axios';
import { NextApiResponse } from 'next';

import { computeBiggerThanPageIndex, dateToISOString, API, CREATED_AT_ORDER, IVA, PAGINATION_SIZE } from 'general';
import { logRequestError, setErrorResponse, setSuccessResponse } from 'request';

import { TaxRateRequest, TaxRateRequestResponse } from './type';

// ********************************************************************************
// == Interface ===================================================================
export interface TaxRateGetRequestParams {
  [key: string]: string;
  requestedTaxRateStartDateStartsWith: string;
  requestedTaxRatePage: string;
}

// == Request =====================================================================
export const getTaxRates = async (params: TaxRateGetRequestParams) => {
  try {
    const { data } = await axios.get<TaxRateRequestResponse, AxiosResponse<TaxRateRequestResponse>, TaxRateGetRequestParams>(`/${API}/${IVA}/`, { params });
    return data;
  } catch (error) {
    logRequestError(error, 'getTaxRates');    
  }
};

// == Handler =====================================================================
export const handleTaxRateGet = async (req: TaxRateRequest, res: NextApiResponse<TaxRateRequestResponse>) => {
  const { requestedTaxRateStartDateStartsWith, requestedTaxRatePage } = req.query;
  if(requestedTaxRateStartDateStartsWith/*get taxRates whose date starts with*/) {
    const taxRates = await prisma.taxRate.findMany(),
          filteredTaxRates = taxRates.filter(taxRate => dateToISOString(taxRate.createdAt).includes(requestedTaxRateStartDateStartsWith));
    setSuccessResponse(res, { requestedTaxRate: undefined/*none requested*/, requestedTaxRates: filteredTaxRates });
    return;

  } else if(requestedTaxRatePage/*get taxRates for a page*/) {
    const biggerThanIndex = computeBiggerThanPageIndex(Number(requestedTaxRatePage));
    const taxRates = await prisma.taxRate.findMany({ orderBy: { createdAt: CREATED_AT_ORDER } }),
          filteredTaxRates = taxRates.filter((author, index) => index > Number(biggerThanIndex)).slice(0, PAGINATION_SIZE/*get first N amount*/);
    setSuccessResponse(res, { requestedTaxRate: undefined/*none requested*/, requestedTaxRates: filteredTaxRates });
    return;
  } /* else -- error */

  setErrorResponse(res, 'Received wrong query params for TaxRate GET Request');
};
