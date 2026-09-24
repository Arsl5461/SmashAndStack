export type NumericField = number | '';

export function clearZeroOnFocus(value: NumericField): NumericField {
  return value === 0 || value === '' ? '' : value;
}

export function parseNumericInput(value: string): NumericField {
  return value === '' ? '' : Number(value);
}
