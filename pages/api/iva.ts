import { NextApiResponse } from 'next';

import { userIsAdmin } from 'general';
import { handleTaxRateGet, handleTaxRatePost, verifyUserAuthAndAuthority, setErrorResponse, setNonAllowedMethodResponse, TaxRateRequest, TaxRateRequestResponse } from 'request';
import { RequestMethod } from 'type';

// ********************************************************************************
const handleTaxRateRequest = async (req: TaxRateRequest, res: NextApiResponse<TaxRateRequestResponse>) => {
  verifyUserAuthAndAuthority(req, res, userIsAdmin);
  /* -- User is authed and has right authority, proceed -- */

  try {
    switch (req.method) {
      // -- POST (Create TaxRate) --------------------------------------------------
      case (RequestMethod.POST): {
        handleTaxRatePost(req, res);
        break;
      }

      // -- GET (Get TaxRate or TaxRates) -----------------------------------------
      case (RequestMethod.GET): {
        handleTaxRateGet(req, res);
        break;
      }

      // -- DEFAULT ---------------------------------------------------------------
      default:
        setNonAllowedMethodResponse(res, [RequestMethod.GET, RequestMethod.POST], req.method);
    }
  } catch (error) {
    setErrorResponse(res, `Something went wrong on API taxRate call: (${req.method}) (${error}) `);
  }
}

export default handleTaxRateRequest;
