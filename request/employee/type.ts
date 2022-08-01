import { User } from '@prisma/client';
import { NextApiRequest } from 'next';

import { Modify } from 'type';

import { EmployeeGetRequestParams } from './get';

// ********************************************************************************
// == Type ========================================================================
export type UpdateUserType = Modify<Omit<User, 'id' | 'email' | 'emailVerified' | 'image' | 'createdAt' | 'updatedAt' | 'birthDate' | 'hireDate' | 'fireDate'>, {
  birthDate: string;
  hireDate: string;
  fireDate: string;
}>;

export type EmployeeRequestBody = Modify<UpdateUserType, { birthDate: Date;  hireDate: Date; fireDate: Date; } & { employeeId: User['id']; }> 

// == Interface ===================================================================
export interface EmployeeRequest extends NextApiRequest {
  query: EmployeeGetRequestParams;
  body: EmployeeRequestBody;
}

export interface EmployeeRequestResponse { 
  requestedEmployee: User | undefined/*not requesting an employee or not a valid response for the used method*/;
  requestedEmployees: User[] | undefined/*not requesting employees or not a valid response for the used method*/;
}
