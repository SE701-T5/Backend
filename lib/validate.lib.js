/**
 * Conditional function for validating if a given ID is the correct format for a database document ID
 * @param id the ID being validated
 * @returns {boolean} true if the given ID is a valid document ID, otherwise false
 */
exports.isValidDocumentID = function(id) {
    const regExpDocumentID = new RegExp('^[a-fA-F0-9]{24}$');
    return typeof id === 'string' && id.length === 24 && regExpDocumentID.test(id);
}
