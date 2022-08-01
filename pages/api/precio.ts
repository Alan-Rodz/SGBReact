import { NextApiResponse } from 'next';

import { userIsAdmin } from 'general';
import  { handleGetMembershipPrice, handlePostMembershipPrice,  verifyUserAuthAndAuthority, setErrorResponse, setNonAllowedMethodResponse, PriceRequest, MembershipPriceRequestResponse } from 'request';
import { RequestMethod } from 'type';

// ********************************************************************************
const handlePriceRequest = async (req: PriceRequest, res: NextApiResponse<MembershipPriceRequestResponse/*NOTE: Other types might be added in the future*/>) => {
  verifyUserAuthAndAuthority(req, res, userIsAdmin);
  /* -- User is authed and has right authority, proceed -- */

  try {
    switch (req.method) {
      // -- POST (Create Price) ---------------------------------------------------
      case (RequestMethod.POST): {
        handlePostMembershipPrice(req, res);
        break;
      }

      // -- GET (Get Prices) ------------------------------------------------------
      case (RequestMethod.GET): {
        handleGetMembershipPrice(req, res);
        break;
      }

      // -- DEFAULT ---------------------------------------------------------------
      default:
        setNonAllowedMethodResponse(res, [RequestMethod.GET, RequestMethod.POST], req.method);
    }
  } catch (error) {
    setErrorResponse(res, `Something went wrong on API price call: (${req.method}) (${error}) `);
  }
}

export default handlePriceRequest;
