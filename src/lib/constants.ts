export const APP_NAME = 'Korepetycje Matematyka';

export const ROLES = {
  ADMIN: 'admin',
  PARENT: 'parent',
  STUDENT: 'student',
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

export const CANCELLATION_DEADLINE_HOURS = 24;

export const GRADE_LEVELS = [
  'Klasa 4',
  'Klasa 5',
  'Klasa 6',
  'Klasa 7',
  'Klasa 8',
  'Liceum 1',
  'Liceum 2',
  'Liceum 3',
  'Liceum 4',
  'Studia',
] as const;

export const EXAM_TARGETS = {
  none: 'Brak',
  egzamin8: 'Egzamin ósmoklasisty',
  matura_podstawowa: 'Matura podstawowa',
  matura_rozszerzona: 'Matura rozszerzona',
} as const;
