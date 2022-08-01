import { NextApiResponse } from 'next';

import { userIsAdminOrSecretary } from 'general';
import { handleBookCopyDelete, handleBookCopyGet, handleBookCopyPatch, handleBookCopyPost, setErrorResponse, setNonAllowedMethodResponse, verifyUserAuthAndAuthority, BookCopyRequest, BookCopyRequestResponse } from 'request';
import { RequestMethod } from 'type';

// ********************************************************************************
const handleBookCopyRequest = async (req: BookCopyRequest, res: NextApiResponse<BookCopyRequestResponse>) => {
  verifyUserAuthAndAuthority(req, res, userIsAdminOrSecretary);
  /* -- User is authed and has right authority, proceed -- */

  try {
    switch (req.method) {
      // -- POST (Create BookCopy) ------------------------------------------------
      case (RequestMethod.POST): {
        handleBookCopyPost(req, res);
        break;
      }

      // -- GET (Get BookCopy or BookCopies) --------------------------------------
      case (RequestMethod.GET): {
        handleBookCopyGet(req, res);
        break;
      }

      // -- PATCH (Update BookCopy )-----------------------------------------------
      case (RequestMethod.PATCH): {
        handleBookCopyPatch(req, res);
        break;
      }

      // -- DELETE (Delete BookCopy) ----------------------------------------------
      case (RequestMethod.DELETE): {
        handleBookCopyDelete(req, res);
        break;
      }

      // -- DEFAULT ---------------------------------------------------------------
      default:
        setNonAllowedMethodResponse(res, [RequestMethod.POST, RequestMethod.GET, RequestMethod.PATCH, RequestMethod.DELETE], req.method);
    }
  } catch (error) {
    setErrorResponse(res, `Something went wrong on API bookCopy call: (${req.method}) (${error}) `);
  }
}

export default handleBookCopyRequest;