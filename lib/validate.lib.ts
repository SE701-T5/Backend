/**
 * Conditional function for validating if a given ID is the correct format for a database document ID
 * @param id the ID being validated
 * @returns {boolean} true if the given ID is a valid document ID, otherwise false
 */
export function isValidDocumentID(id) {
  const regExpDocumentID = new RegExp("^[a-fA-F0-9]{24}$");
  return (
    id &&
    typeof id === "string" &&
    id.length === 24 &&
    regExpDocumentID.test(id)
  );
}

/**
 * Parses a string into an integer if it is a valid number, otherwise returns a given minimum value if not
 * @param str the string being parsed into an integer
 * @param min the value being returned if the string fails to pass as an integer
 * @returns {*|number} the string integer value as a number if valid, otherwise the given minimum value
 */
export function parseInteger(str, min) {
  return isNaN(parseInt(str, 10)) ? min : parseInt(str, 10);
}

/**
 * Conditional function to validate that all fields in an object have valid and true values
 * @param obj the object being validated
 * @returns {boolean} true if all fields in an object have valid and true values, otherwise false
 */
export function isAllFieldsValid(obj) {
  for (const field in obj) {
    if (!obj[field]) {
      return false;
    }
  }
  return true;
}

/**
 * Conditional function to validate that any one field in an object has a valid and true value, removes invalid fields
 * @param obj the object being validated
 * @returns {boolean} true if any one field in an object has a valid and true value, otherwise false
 */
export function isAnyFieldValid(obj) {
  for (const field in obj) {
    if (!obj[field]) {
      delete obj[field];
    }
  }
  return Object.keys(obj).length !== 0;
}
