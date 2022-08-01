import { NextApiResponse } from 'next';

import { userIsAdminOrSecretary } from 'general';
import { handleBookDelete, handleBookGet, handleBookPatch, handleBookPost, setErrorResponse, setNonAllowedMethodResponse, verifyUserAuthAndAuthority, BookRequest, BookRequestResponse } from 'request';
import { RequestMethod } from 'type';

// ********************************************************************************
const handleBookRequest = async (req: BookRequest, res: NextApiResponse<BookRequestResponse>) => {
  verifyUserAuthAndAuthority(req, res, userIsAdminOrSecretary);
  /* -- User is authed and has right authority, proceed -- */

  try {
    switch (req.method) {
      // -- POST (Create Book) ----------------------------------------------------
      case (RequestMethod.POST): {
        handleBookPost(req, res);
        break;
      }

      // -- GET (Get Book or Books) -----------------------------------------------
      case (RequestMethod.GET): {
        handleBookGet(req, res);
        break;
      }

      // -- PATCH (Update Book )---------------------------------------------------
      case (RequestMethod.PATCH): {
        handleBookPatch(req, res);
        break;
      }

      // -- DELETE (Delete Book) --------------------------------------------------
      case (RequestMethod.DELETE): {
        handleBookDelete(req, res);
        break;
      }

      // -- DEFAULT ---------------------------------------------------------------
      default:
        setNonAllowedMethodResponse(res, [RequestMethod.POST, RequestMethod.GET, RequestMethod.PATCH, RequestMethod.DELETE], req.method);
    }
  } catch (error) {
    setErrorResponse(res, `Something went wrong on API book call: (${req.method}) (${error}) `);
  }
}

export default handleBookRequest;
