import { NextApiResponse } from 'next';
import axios, { AxiosResponse } from 'axios';

import { API, CREATED_AT_ORDER, IVA } from 'general';
import { logRequestError, setErrorResponse, setSuccessResponse, TaxRateRequest, TaxRateRequestBody, TaxRateRequestResponse } from 'request';

// == Request =====================================================================
export const postTaxRate = async (taxRateRequestBody: TaxRateRequestBody) => {
  try {
    const { data: requestedTaxRate } = await axios.post<TaxRateRequestResponse, AxiosResponse<TaxRateRequestResponse>, TaxRateRequestBody>(`/${API}/${IVA}/`, taxRateRequestBody);
    return requestedTaxRate;
  } catch (error) {
    logRequestError(error, 'postTaxRate');    
  }
};

// == Handler =====================================================================
export const handleTaxRatePost = async (req: TaxRateRequest, res: NextApiResponse<TaxRateRequestResponse>) => {
  const { percentage, startDate, endDate } = req.body;
  if(!percentage || !startDate || !endDate) {
    setErrorResponse(res, 'Received wrong query params for TaxRate POST Request');
    return;
  }/* else -- valid values */

  // Disable previous taxRate
  const allTaxRates = await prisma.taxRate.findMany({ orderBy: { createdAt: CREATED_AT_ORDER } });
  if(allTaxRates.length > 0) {
    const previousTaxRateId = allTaxRates[0/*most recently registered taxRate*/].id;
    await prisma.taxRate.update({ where: { id: previousTaxRateId }, data: { endDate: new Date() }});
  }/* else -- first time a taxRate is registered, just create a new one */

  // Enable new taxRate
  const newTaxRate = await prisma.taxRate.create({ data: { percentage, startDate, endDate }, });
  setSuccessResponse(res, { requestedTaxRate: newTaxRate, requestedTaxRates: undefined/*none requested*/ });
};
