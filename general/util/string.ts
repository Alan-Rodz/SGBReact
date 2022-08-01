import { CivilState, DayOfWeek, EmployeeLevel, Genre, Sex, Shift } from '@prisma/client';

// ********************************************************************************
// == Language ====================================================================
interface StringTranslator {
  employee: {
    employeeLevel: { [key: string]: string; };
    sex: { [key: string]: string; };
    civilState: { [key: string]: string; };
    shift: { [key: string]: string; };
    restDay: { [key: string]: string; };
  },

  book: {
    genre: { [key: string]: string; };
  }
}
export const stringTranslator: StringTranslator = {
  employee: {
    employeeLevel: {
      [EmployeeLevel.ADMIN]: 'Administrador',
      [EmployeeLevel.SECRETARY]: 'Secretaria',
      [EmployeeLevel.EMPLOYEE]: 'Empleado'
    },
    sex: {
      [Sex.MALE]: 'Masculino',
      [Sex.FEMALE]: 'Femenino'
    },
    civilState: {
      [CivilState.MARRIED]: 'Casado',
      [CivilState.SINGLE]: 'Soltero'
    },
    shift: {
      [Shift.MORNING]: 'Matutino',
      [Shift.AFTERNOON]: 'Vespertino',
      [Shift.NIGHT]: 'Nocturno'
    },
    restDay: {
      [DayOfWeek.MONDAY]: 'Lunes',
      [DayOfWeek.TUESDAY]: 'Martes',
      [DayOfWeek.WEDNESDAY]: 'Miércoles',
      [DayOfWeek.THURSDAY]: 'Jueves',
      [DayOfWeek.FRIDAY]: 'Viernes',
      [DayOfWeek.SATURDAY]: 'Sábado',
      [DayOfWeek.SUNDAY]: 'Domingo'
    }
  },
  
  book: {
    genre: {
      [Genre.LITERARY]: 'Literario',
      [Genre.THRILLER]: 'Thriller',
      [Genre.HORROR]: 'Terror',
      [Genre.HISTORICAL]: 'Histórico',
      [Genre.SCIENCE_FICTION]: 'Ciencia Ficción',
      [Genre.FANTASY]: 'Fantasía',
      [Genre.PHILOSOPHICAL]: 'Filosófico'
    }
  }
};

// == Email =======================================================================
export const isValidEmail = (email: string) => /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
export const isSameDate = (dateToCheck: Date, newDateString: string) => {
  const currentDate = new Date(dateToCheck),
        newDate = new Date(newDateString);
  if(currentDate.getTime() === newDate.getTime()) 
    return true;
  /* else -- different dates */
  return false;
};

// == Date ========================================================================
export const dateToISOString = (date: Date) => date.toISOString().slice(0, 10/*YYYY-MM-DD*/);
