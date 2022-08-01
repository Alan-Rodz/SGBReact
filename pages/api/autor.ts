import { NextApiResponse } from 'next';

import { userIsAdminOrSecretary } from 'general';
import { handleAuthorDelete, handleAuthorGet, handleAuthorPatch, handleAuthorPost, setErrorResponse, setNonAllowedMethodResponse, verifyUserAuthAndAuthority, AuthorRequest, AuthorRequestResponse } from 'request';
import { RequestMethod } from 'type';

// ********************************************************************************
const handleAuthorRequest = async (req: AuthorRequest, res: NextApiResponse<AuthorRequestResponse>) => {
  verifyUserAuthAndAuthority(req, res, userIsAdminOrSecretary);
  /* -- User is authed and has right authority, proceed -- */

  try {
    switch (req.method) {
      // -- POST (Create Author) --------------------------------------------------
      case (RequestMethod.POST): {
        handleAuthorPost(req, res);
        break;
      }

      // -- GET (Get Author or Authors) -------------------------------------------
      case (RequestMethod.GET): {
        handleAuthorGet(req, res);
        break;
      }

      // -- PATCH (Update Author )-------------------------------------------------
      case (RequestMethod.PATCH): {
        handleAuthorPatch(req, res);
        break;
      }

      // -- DELETE (Delete Author) ------------------------------------------------
      case (RequestMethod.DELETE): {
        handleAuthorDelete(req, res);
        break;
      }

      // -- DEFAULT ---------------------------------------------------------------
      default:
        setNonAllowedMethodResponse(res, [RequestMethod.POST, RequestMethod.GET, RequestMethod.PATCH, RequestMethod.DELETE], req.method);
    }
  } catch (error) {
    setErrorResponse(res, `Something went wrong on API author call: (${req.method}) (${error}) `);
  }
}

export default handleAuthorRequest;
