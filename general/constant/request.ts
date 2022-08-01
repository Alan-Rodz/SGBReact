// ********************************************************************************
// the amount of items per paginated page (SEE: GeneralPaginationButtons.tsx)
export const PAGINATION_SIZE = 10/*NOTE: must be greater than 1*/;

// the max amount of items that are taken when requesting from the backend
export const LOOKUP_SIZE = 25;

// the object that gets returned in order for the User to be redirected to /login
export const redirectToLoginObject = {
  redirect: {
    // NOTE: Must be a string instead of using constant, otherwise gets undefined
    destination: `/login`,
    permanent: false,
  },
};
