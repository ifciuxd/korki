/**
 * Formatuje kwotę w groszach na czytelną wartość PLN.
 * @example formatCents(14990) => "149,90 zł"
 */
export function formatCents(cents: number): string {
  const zloty = Math.floor(cents / 100);
  const grosze = Math.abs(cents % 100);
  return `${zloty},${grosze.toString().padStart(2, '0')} zł`;
}

/**
 * Konwertuje kwotę w złotych (string z formularza) na grosze.
 * @example parseZlotyToCents("149,90") => 14990
 */
export function parseZlotyToCents(value: string): number {
  const normalized = value.replace(',', '.');
  const parsed = parseFloat(normalized);
  if (isNaN(parsed)) {
    throw new Error(`Invalid currency value: ${value}`);
  }
  return Math.round(parsed * 100);
}
