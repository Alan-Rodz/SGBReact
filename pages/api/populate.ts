import { NextApiRequest, NextApiResponse } from 'next';

import { userIsAdmin } from 'general';
import { verifyUserAuthAndAuthority, setSuccessResponse, setNonAllowedMethodResponse, setErrorResponse } from 'request';
import { RequestMethod } from 'type';

// ********************************************************************************
// NOTE: this route is meant to be used while developing the application to 
//       populate the database with mock data as required. It thus calls no
//       other specific methods

const handlePopulateRequest = async (req: NextApiRequest, res: NextApiResponse) => {
  verifyUserAuthAndAuthority(req, res, userIsAdmin/*only an admin can populate the db*/);
  /* -- User is authed and has right authority, proceed -- */

  try {
    switch (req.method) {
      // -- POST ------------------------------------------------------------------
      case (RequestMethod.POST):
        // Implement populate logic here
        setSuccessResponse(res, {});
        break;

      // -- DEFAULT ---------------------------------------------------------------
      default:
        setNonAllowedMethodResponse(res, [RequestMethod.POST], req.method);
    }
  } catch (error) {
    setErrorResponse(res, `Something went wrong on API populate call: (${req.method}) (${error}) `);
  }
}

export default handlePopulateRequest;