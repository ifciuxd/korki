import { TZDate } from '@date-fns/tz';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

const DEFAULT_TIMEZONE = 'Europe/Warsaw';

/**
 * Formatuje datę UTC do strefy czasowej użytkownika.
 */
export function formatInTimezone(
  date: Date | string,
  formatStr: string,
  timezone: string = DEFAULT_TIMEZONE,
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const zonedDate = new TZDate(d, timezone);
  return format(zonedDate, formatStr, { locale: pl });
}

/**
 * Formatuje datę na krótki format polski: "12 sty 2024, 14:30"
 */
export function formatDateTimePL(
  date: Date | string,
  timezone: string = DEFAULT_TIMEZONE,
): string {
  return formatInTimezone(date, 'd MMM yyyy, HH:mm', timezone);
}

/**
 * Formatuje samą datę: "12 stycznia 2024"
 */
export function formatDatePL(
  date: Date | string,
  timezone: string = DEFAULT_TIMEZONE,
): string {
  return formatInTimezone(date, 'd MMMM yyyy', timezone);
}

/**
 * Formatuje samą godzinę: "14:30"
 */
export function formatTimePL(
  date: Date | string,
  timezone: string = DEFAULT_TIMEZONE,
): string {
  return formatInTimezone(date, 'HH:mm', timezone);
}
