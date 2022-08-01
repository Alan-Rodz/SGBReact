import { NextApiResponse } from 'next';

import { userIsAdminOrSecretary } from 'general';
import { handleEmployeeGet, handleEmployeePatch, setErrorResponse, setNonAllowedMethodResponse, verifyUserAuthAndAuthority, EmployeeRequest, EmployeeRequestResponse } from 'request';
import { RequestMethod } from 'type';

// ********************************************************************************
const handleEmployeeRequest = async (req: EmployeeRequest, res: NextApiResponse<EmployeeRequestResponse>) => {
  verifyUserAuthAndAuthority(req, res, userIsAdminOrSecretary);
  /* -- User is authed and has right authority, proceed -- */

  try {
    switch (req.method) {
      // -- GET (Get Employee or Employees) ---------------------------------------
      case (RequestMethod.GET): {
        handleEmployeeGet(req, res);
        break;
      }

      // -- PATCH (Update Employee )-------------------------------------------------
      case (RequestMethod.PATCH): {
        handleEmployeePatch(req, res);
        break;
      }

      // -- DEFAULT ---------------------------------------------------------------
      default:
        setNonAllowedMethodResponse(res, [RequestMethod.GET, RequestMethod.PATCH], req.method);
    }
  } catch (error) {
    setErrorResponse(res, `Something went wrong on API employee call: (${req.method}) (${error}) `);
  }
}

export default handleEmployeeRequest;