// ********************************************************************************
// Modify the type of a property R of object T
export type Modify<T, R> = Omit<T, keyof R> & R;
