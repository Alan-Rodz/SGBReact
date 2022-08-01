import axios, { AxiosResponse } from 'axios';
import { NextApiResponse } from 'next';

import { allPropertiesDefined, API, EMPLEADO } from 'general';
import { logRequestError, setErrorResponse, setSuccessResponse } from 'request';

import { EmployeeRequest, EmployeeRequestBody, EmployeeRequestResponse } from './type';

// ********************************************************************************
// == Request =====================================================================
export const patchEmployee = async (employeeRequestBody: EmployeeRequestBody) => {
  try {
    const { data: patchedAuthor } = await axios.patch<EmployeeRequestResponse, AxiosResponse<EmployeeRequestResponse>, EmployeeRequestBody>(`/${API}/${EMPLEADO}/`, employeeRequestBody);
    return patchedAuthor;
  } catch (error) {
    logRequestError(error, 'patchEmployee');    
  }
};

// == Handler =====================================================================
export const handleEmployeePatch = async (req: EmployeeRequest, res: NextApiResponse<EmployeeRequestResponse>) => {
  if(!allPropertiesDefined<EmployeeRequestBody>(req.body)/*NOTE: only user here because of the large number of props*/) {
  setErrorResponse(res, 'Received wrong query params for Employee PATCH Request');
    return;
  }/* else -- valid values */
  
  const { employeeId: id, ...updatedEmployeeProps  } = req.body;
  const patchedEmployee = await prisma.user.update( { where: { id }, data: { ...updatedEmployeeProps } });
  setSuccessResponse(res, { requestedEmployee: patchedEmployee, requestedEmployees: undefined/*none requested*/ })
};
