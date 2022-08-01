// ********************************************************************************
// NOTE: In CRUD Order
export enum RequestMethod { 
  POST = 'POST',
  GET = 'GET',
  PATCH = 'PATCH',
  DELETE = 'DELETE'
};

// NOTE: Used by pages where pagination is used
type CachedPage = number/*alias*/;
export type CachedPagesMap<T> = Map<CachedPage, T[]>;
