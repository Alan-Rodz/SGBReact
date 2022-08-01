import { CivilState, DayOfWeek, EmployeeLevel, Sex, Shift, User } from '@prisma/client';
import { useToast, FormControl, FormErrorMessage, FormLabel, Text } from '@chakra-ui/react';
import { Field, FormikHelpers } from 'formik';
import type { GetServerSideProps, NextPage } from 'next';
import { getSession } from 'next-auth/react';
import { useState } from 'react';

import { createCommonInputTextFieldProps, createCommonSelectFieldProps, createCommonInputDateFieldProps, dateToISOString, objectsHaveSameValues, redirectToLoginObject, stringTranslator, GeneralForm, NOT_AVAILABLE, TOAST_DURATION, TOAST_POSITION } from 'general';
import { isValidSession, logRequestError, parseObjectFromServer, patchEmployee, UpdateUserType } from 'request';
import { employeeSchema } from 'schema';
import { AppLayout, CenterLayout } from 'ui';

// ********************************************************************************
// == Type ========================================================================
type UpdateEmployeeFormValues = UpdateUserType/*alias*/;

// == Interface ===================================================================
interface UpdateEmployeeProps {
  user: User;
  employee: User;
}

// == Server Side =================================================================
export const getServerSideProps: GetServerSideProps<UpdateEmployeeProps> = async (context) => {
  // -- Validation ----------------------------------------------------------------
  const session = await getSession(context);
  if(!isValidSession(session)) return redirectToLoginObject/*redirect to login if not authed*/;

  // -- Query ---------------------------------------------------------------------
  const employeeId = context.query.id;
  if(typeof employeeId !== 'string') throw new Error(`Received wrong query id: ${employeeId}`);

  const appUser = await prisma.user.findUnique({ where: { email: session.user.email } }),
    employee = await prisma.user.findUnique({ where: { id: employeeId } });

  // -- Returned Props ------------------------------------------------------------
  return {
    props: {
      user: parseObjectFromServer(appUser),
      employee: parseObjectFromServer(employee),
    }
  };
};

// == Client Side =================================================================
const ActualizarEmpleado: NextPage<UpdateEmployeeProps> = ({ user, employee }) => {
  const toast = useToast();

  // -- State ---------------------------------------------------------------------
  const [currentEmployee, setCurrentEmployee] = useState(employee);
  const [isUpdatingEmployee, setIsUpdatingEmployee] = useState(false);

  // -- Handler -------------------------------------------------------------------
  const handleSubmit = async (values: UpdateEmployeeFormValues, formikHelpers: FormikHelpers<UpdateEmployeeFormValues>) => {
    if(objectsHaveSameValues<UpdateEmployeeFormValues>(
      values,
      {
        ...currentEmployee,
        birthDate: dateToISOString(new Date(currentEmployee.birthDate)),
        fireDate: dateToISOString(new Date(currentEmployee.fireDate)),
        hireDate: dateToISOString(new Date(currentEmployee.hireDate)),
      },
      ['name', 'employeeLevel', 'birthDate', 'address', 'sex', 'hireDate', 'fireDate', 'civilState', 'shift', 'restDay'])) {
      toast({ title: 'Mismos valores encontrados, actualización cancelada.', status: 'info', duration: TOAST_DURATION, position: TOAST_POSITION });
      return;
    }/* else -- different values */
    try {
      setIsUpdatingEmployee(true);
      toast({ title: 'Actualizando Empleado...', status: 'info', duration: TOAST_DURATION, position: TOAST_POSITION });

      const data = await patchEmployee({
        employeeId: currentEmployee.id,
        name: values.name,
        employeeLevel: values.employeeLevel,
        address: values.address,
        sex: values.sex,
        civilState: values.civilState,
        shift: values.shift,
        restDay: values.restDay,
        birthDate: new Date(values.birthDate),
        hireDate: new Date(values.hireDate),
        fireDate: new Date(values.fireDate)
      });

      if(!data || !data.requestedEmployee)
        throw new Error('There was an error while updating the employee');
      /* else -- successful update */

      toast({ title: 'Empleado actualizado exitosamente', status: 'success', duration: TOAST_DURATION, position: TOAST_POSITION });
      setCurrentEmployee(data.requestedEmployee);
      return;
    } catch (error) {
      logRequestError(error, 'Updating Employee');
      toast({ title: 'Ocurrió un error mientras se registraba al autor...', status: 'error', duration: TOAST_DURATION, position: TOAST_POSITION });
    } finally {
      setIsUpdatingEmployee(false);
    }
  }

  // -- UI ------------------------------------------------------------------------
  return (
    <AppLayout
      userId={user.id}
      userIMG={user.image}
      employeeLevel={user.employeeLevel}
    >
      <CenterLayout>
        <GeneralForm<UpdateEmployeeFormValues>
          initialValues={{
            name: currentEmployee.name ?? NOT_AVAILABLE,
            employeeLevel: currentEmployee.employeeLevel,
            birthDate: dateToISOString(new Date(currentEmployee.birthDate)),
            address: currentEmployee.address,
            sex: currentEmployee.sex,
            hireDate: dateToISOString(new Date(currentEmployee.hireDate)),
            fireDate: dateToISOString(new Date(currentEmployee.fireDate)),
            civilState: currentEmployee.civilState,
            shift: currentEmployee.shift,
            restDay: currentEmployee.restDay
          }}
          validationSchema={employeeSchema}

          // .. Submit Handler ....................................................
          onSubmitHandler={handleSubmit}

          // .. Render Function ...................................................
          renderFormFunction={(errors, touched, setFieldValue) =>
            <>
              <Text as='strong'>Actualizar Empleado</Text>

              {/* .. Name ................................................... */}
              <FormControl isInvalid={!!errors.name && touched.name}>
                <FormLabel htmlFor='employee-name'>
                  Nombre del Empleado
                </FormLabel>
                <Field
                  id='employee-name'
                  name='name'
                  placeholder='Nombre del Empleado'
                  {...createCommonInputTextFieldProps(isUpdatingEmployee)}
                />
                <FormErrorMessage>{errors.name}</FormErrorMessage>
              </FormControl>

              {/* .. Employee Level ......................................... */}
              <FormControl isInvalid={!!errors.employeeLevel && touched.employeeLevel}>
                <FormLabel htmlFor='employee-employeeLevel'>
                  Nivel del Empleado
                </FormLabel>
                <Field
                  id='employee-employeeLevel'
                  name='employeeLevel'
                  {...createCommonSelectFieldProps(isUpdatingEmployee)}
                >
                  {Object.keys(EmployeeLevel).map((employeeLevel, employeeLevelIndex) => <option key={employeeLevelIndex} value={employeeLevel}>{stringTranslator.employee.employeeLevel[employeeLevel]}</option>)}
                </Field>
                <FormErrorMessage>{errors.employeeLevel}</FormErrorMessage>
              </FormControl>

              {/* .. Birth Date ............................................. */}
              <FormControl isInvalid={!!errors.birthDate && touched.birthDate}>
                <FormLabel htmlFor='employee-birthDate'>
                  Fecha de Nacimiento
                </FormLabel>
                <Field
                  id='employee-birthDate'
                  name='birthDate'
                  {...createCommonInputDateFieldProps(isUpdatingEmployee)}
                />
                <FormErrorMessage>{errors.birthDate}</FormErrorMessage>
              </FormControl>

              {/* .. Address ................................................ */}
              <FormControl isInvalid={!!errors.address && touched.address}>
                <FormLabel htmlFor='employee-address'>
                  Dirección del Empleado
                </FormLabel>
                <Field
                  id='employee-address'
                  name='address'
                  placeholder='Dirección del Empleado'
                  {...createCommonInputTextFieldProps(isUpdatingEmployee)}
                />
                <FormErrorMessage>{errors.address}</FormErrorMessage>
              </FormControl>

              {/* .. Sex .................................................... */}
              <FormControl isInvalid={!!errors.sex && touched.sex}>
                <FormLabel htmlFor='employee-sex'>
                  Sexo del Empleado
                </FormLabel>
                <Field
                  id='employee-sex'
                  name='sex'
                  {...createCommonSelectFieldProps(isUpdatingEmployee)}
                >
                  {Object.keys(Sex).map((sex, sexIndex) => <option key={sexIndex} value={sex}>{stringTranslator.employee.sex[sex]}</option>)}
                </Field>
                <FormErrorMessage>{errors.sex}</FormErrorMessage>
              </FormControl>

              {/* .. Hire Date .............................................. */}
              <FormControl isInvalid={!!errors.hireDate && touched.hireDate}>
                <FormLabel htmlFor='employee-hireDate'>
                  Fecha de Contrato
                </FormLabel>
                <Field
                  id='employee-hireDate'
                  name='hireDate'
                  {...createCommonInputDateFieldProps(isUpdatingEmployee)}
                />
                <FormErrorMessage>{errors.hireDate}</FormErrorMessage>
              </FormControl>

              {/* .. Fire Date .............................................. */}
              <FormControl isInvalid={!!errors.fireDate && touched.fireDate}>
                <FormLabel htmlFor='employee-fireDate'>
                  Fecha de Despido
                </FormLabel>
                <Field
                  id='employee-fireDate'
                  name='fireDate'
                  {...createCommonInputDateFieldProps(isUpdatingEmployee)}
                />
                <FormErrorMessage>{errors.fireDate}</FormErrorMessage>
              </FormControl>

              {/* .. Civil State ............................................ */}
              <FormControl isInvalid={!!errors.civilState && touched.civilState}>
                <FormLabel htmlFor='employee-civilState'>
                  Estado Civil
                </FormLabel>
                <Field
                  id='employee-civilState'
                  name='civilState'
                  {...createCommonSelectFieldProps(isUpdatingEmployee)}
                >
                  {Object.keys(CivilState).map((civilState, civilStateIndex) => <option key={civilStateIndex} value={civilState}>{stringTranslator.employee.civilState[civilState]}</option>)}
                </Field>
                <FormErrorMessage>{errors.civilState}</FormErrorMessage>
              </FormControl>

              {/* .. Shift .................................................. */}
              <FormControl isInvalid={!!errors.shift && touched.shift}>
                <FormLabel htmlFor='employee-shift'>
                  Turno
                </FormLabel>
                <Field
                  id='employee-shift'
                  name='shift'
                  {...createCommonSelectFieldProps(isUpdatingEmployee)}
                >
                  {Object.keys(Shift).map((shift, shiftIndex) => <option key={shiftIndex} value={shift}>{stringTranslator.employee.shift[shift]}</option>)}
                </Field>
                <FormErrorMessage>{errors.shift}</FormErrorMessage>
              </FormControl>

              {/* .. Rest Day ............................................... */}
              <FormControl isInvalid={!!errors.restDay && touched.restDay}>
                <FormLabel htmlFor='employee-restDay'>
                  Día de Descanso
                </FormLabel>
                <Field
                  id='employee-restDay'
                  name='restDay'
                  {...createCommonSelectFieldProps(isUpdatingEmployee)}
                >
                  {Object.keys(DayOfWeek).map((restDay, shiftIndex) => <option key={shiftIndex} value={restDay}>{stringTranslator.employee.restDay[restDay]}</option>)}
                </Field>
                <FormErrorMessage>{errors.restDay}</FormErrorMessage>
              </FormControl>
            </>
          }

          // .. Remaining Props ...................................................
          performOperationString='Actualizar'
          performAnotherOperationString=''/*no other operation besides updating*/
          isPerformingOperation={isUpdatingEmployee}
          hasPerformedOperation={false/*ensures update button is always available*/}
          isObjectDeleted={false/*cannot delete employees, only fire them*/}
        />
      </CenterLayout>
    </AppLayout>
  );
};

export default ActualizarEmpleado;
