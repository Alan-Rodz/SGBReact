import axios, { AxiosResponse } from 'axios';
import { NextApiResponse } from 'next';

import { computeBiggerThanPageIndex, API, CREATED_AT_ORDER, EMPLEADO, LOOKUP_SIZE, PAGINATION_SIZE } from 'general';
import { logRequestError, setErrorResponse, setSuccessResponse } from 'request';

import { EmployeeRequest, EmployeeRequestResponse } from './type';

// ********************************************************************************
// == Interface ===================================================================
export interface EmployeeGetRequestParams {
  [key: string]: string;
  requestedEmployeeNameStartsWith: string;
  requestedEmployeesPage: string;
}

// == Request =====================================================================
export const getEmployees = async (params: EmployeeGetRequestParams) => {
  try {
    const { data } = await axios.get<EmployeeRequestResponse, AxiosResponse<EmployeeRequestResponse>, EmployeeGetRequestParams>(`/${API}/${EMPLEADO}/`, { params });
    return data;
  } catch (error) {
    logRequestError(error, 'getEmployees');    
  }
};

// == Handler =====================================================================
export const handleEmployeeGet = async (req: EmployeeRequest, res: NextApiResponse<EmployeeRequestResponse>) => {
  const { requestedEmployeeNameStartsWith, requestedEmployeesPage } = req.query;
  if(requestedEmployeeNameStartsWith/*get employees whose name starts with*/) {
    const employees = await prisma.user.findMany( { where: { name: { startsWith: requestedEmployeeNameStartsWith } }, take: LOOKUP_SIZE });
    setSuccessResponse(res, { requestedEmployee: undefined/*none requested*/, requestedEmployees: employees });
    return;
  } else if(requestedEmployeesPage/*get employees for a page*/) {
    const biggerThanIndex = computeBiggerThanPageIndex(Number(requestedEmployeesPage))
    const employees = await prisma.user.findMany({ orderBy: { createdAt: CREATED_AT_ORDER } }),
          filteredEmployees = employees.filter((employee, index) => index > Number(biggerThanIndex)).slice(0, PAGINATION_SIZE/*get first N amount*/);
    setSuccessResponse(res, { requestedEmployee: undefined/*none requested*/, requestedEmployees: filteredEmployees });
    return;
  } /* else -- error */
  
  setErrorResponse(res, 'Received wrong query params for Employee GET Request');
};
