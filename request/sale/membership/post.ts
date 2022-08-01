// ********************************************************************************
// == Request =====================================================================
// NOTE: The request is made to the libraryUser endpoint in the API since a 
//       membershipSale is the only way in which an user can be registered. Thus, 
//       in order to keep Create and Read operations in the same API handler, the
//       request is sent to said endpoint
export const postMembershipSale = async (membershipSaleRequestBody: MembershipSaleRequestBody) => {
  try {
    const { data: membershipSaleAnswer } = await axios.post<LibraryUserRequestResponse, AxiosResponse<LibraryUserRequestResponse>, MembershipSaleRequestBody>(`/${API}/${USUARIO}/`, membershipSaleRequestBody);
    return membershipSaleAnswer;
  } catch (error) {
    logRequestError(error, 'postMembershipSale');    
  }
};