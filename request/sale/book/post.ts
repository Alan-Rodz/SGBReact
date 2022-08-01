import axios, { AxiosResponse } from 'axios';

import { API, VENTA } from 'general';
import { logRequestError } from 'request';

import { SaleRequestBody, SaleRequestAnswer } from '../type';

// ********************************************************************************
// == Request =====================================================================
export const postBookSale = async (saleRequestBody: SaleRequestBody) => {
  try {
    const { data: newSale } = await axios.post<SaleRequestAnswer, AxiosResponse<SaleRequestAnswer>, SaleRequestBody>(`/${API}/${VENTA}/`, saleRequestBody);
    return newSale;
  } catch (error) {
    logRequestError(error, 'getCurrentSaleInfo');    
  }
};
