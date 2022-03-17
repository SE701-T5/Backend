const
    { isValidDocumentID } = require("../lib/validate.lib"),
    assert = require("assert");

/**
 * Test the validation of a given ID is the correct format for a database document ID
 */
describe("Validation test for valid DB ID format", function() {
    it("should validate a correctly formatted ID", async function() {
        const validDocumentID = "62328e357ec3446e40e1b29b";
        assert.equal(isValidDocumentID(validDocumentID), true);
    });
});

/**
 * Test the validation of a given ID is the incorrect format for a database document ID
 * The given ID is the correct format aside for it being one char too short
 */
describe("Validation test for invalid DB ID format - too short", function() {
    it("should invalidate an incorrectly formatted ID", async function() {
        const invalidDocumentID = "62328e357ec3446e40e1b29";
        assert.equal(isValidDocumentID(invalidDocumentID), false);
    });
});

/**
 * Test the validation of a given ID is the incorrect format for a database document ID
 * The given ID is the correct format aside for it being one char too long
 */
describe("Validation test for invalid DB ID format - too long", function() {
    it("should invalidate an incorrectly formatted ID", async function() {
        const invalidDocumentID = "62328e357ec3446e40e1b29be";
        assert.equal(isValidDocumentID(invalidDocumentID), false);
    });
});

/**
 * Test the validation of a given ID is the incorrect format for a database document ID
 * The given ID is not a string, so it is in the incorrect format
 */
describe("Validation test for invalid DB ID format - not a string", function() {
    it("should invalidate an incorrectly formatted ID", async function() {
        const invalidDocumentID = 123456789012345678901234;
        assert.equal(isValidDocumentID(invalidDocumentID), false);
    });
});

/**
 * Test the validation of a given ID is the incorrect format for a database document ID
 * The given ID is not alphanumeric, so it is in the incorrect format
 */
describe("Validation test for invalid DB ID format - invalid chars", function() {
    it("should invalidate an incorrectly formatted ID", async function() {
        const invalidDocumentID = ";,.|<>/=+-_)(*&^%!@#$?:]";
        assert.equal(isValidDocumentID(invalidDocumentID), false);
    });
});
