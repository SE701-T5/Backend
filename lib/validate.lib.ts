/**
 * Conditional function for validating if a given ID is the correct format for a database document ID
 * @param id the ID being validated
 * @returns {boolean} true if the given ID is a valid document ID, otherwise false
 */
export function isValidDocumentID(id: string) {
  const regExpDocumentID = new RegExp('^[a-fA-F0-9]{24}$');
  return (
    id &&
    typeof id === 'string' &&
    id.length === 24 &&
    regExpDocumentID.test(id)
  );
}

/**
 * Parses a string into an integer if it is a valid number, otherwise returns a given value
 * @param str the string being parsed into an integer
 * @param val the value being returned if the string fails to pass as an integer
 * @returns {*|number} the string integer value as a number if valid, otherwise the given minimum value
 */
export function parseInteger(str: string, val: number) {
  const number = parseInt(str, 10);
  return isNaN(number) ? val : number;
}

export type IValidation<T = Record<string, unknown>> = {
  [field in keyof T]: IValidationRecord<T[field]>;
};

interface IValidationRecord<T> {
  valid: boolean | ((value: T) => boolean);
  value: T;
  required?: boolean;
}

function isRecordValid<T>(record: IValidationRecord<T>): boolean {
  let valid: boolean;
  const required = record.required ?? true;

  if (typeof record.valid === 'boolean') {
    valid = record.valid;
  } else if (typeof record.valid === 'function') {
    valid = record.valid(record.value);
  }

  return valid || !required;
}

/**
 * Conditional function to validate that all fields in an object have valid and true values
 * @param obj the object being validated
 * @returns {boolean} true if all fields in an object have valid and true values, otherwise false
 */
export function isFieldsValid<T>(obj: IValidation<T>) {
  for (const field in obj) {
    if (!isRecordValid(obj[field])) return false;
  }
  return true;
}

export function getValidValues<T>(obj: IValidation<T>): T {
  const result: unknown = {};

  for (const field in obj) {
    const record = obj[field];

    if (isRecordValid(record)) {
      result[field] = record.value;
    }
  }

  return result as T;
}
