// ********************************************************************************
/**
 * Checks if two objects of the same type have the 
 * same values on the checked keys, which are passed on the keysToCheck array
 */
export const objectsHaveSameValues = <T>(obj1: Partial<T>, obj2: T, keysToCheck: (keyof T)[]) => {
  let objectsHaveSameValues = true/*default*/;

  keysToCheck.forEach(key => {
    if(obj1[key] === obj2[key]) {
      return/*check next*/;
    }/* else -- different properties */
    objectsHaveSameValues = false;
  });

  return objectsHaveSameValues;
};

/** Check that all the properties in an object are defined */
export const allPropertiesDefined = <T extends { [key: string]: string | Date | null }>(obj: T) => {
  const keys = Object.keys(obj);

  let allPropsDefined = true/*default*/;
  keys.forEach(key => {
    if(typeof obj[key] === 'undefined') {
      allPropsDefined = false;
      return/*check next*/;
    }/* else -- prop is defined, do nothing */
  });

  return allPropsDefined;
}