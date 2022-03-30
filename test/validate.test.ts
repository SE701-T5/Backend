import assert from 'assert';
import { expect } from 'chai';
import { isValidDocumentID } from '../lib/validate.lib';

// XXX: Ideally these tests will not be needed when we are using proper types in the codebase! Going to leave for now until we get some more mature backend work merged!
describe('Validation', () => {
  it('Validate a correctly formatted ID', async () => {
    const validDocumentID = '62328e357ec3446e40e1b29b';
    expect(isValidDocumentID(validDocumentID)).is.true;
  });

  it('Invalidate string too short', async function () {
    const invalidDocumentID = '62328e357ec3446e40e1b29';
    expect(isValidDocumentID(invalidDocumentID)).is.false;
  });

  it('Invalidate string too long', async () => {
    const invalidDocumentID = '62328e357ec3446e40e1b29be';
    expect(isValidDocumentID(invalidDocumentID)).is.false;
  });

  it('Invalidate non-string', async () => {
    const invalidDocumentID = 123456789012345678901234;
    expect(isValidDocumentID(invalidDocumentID)).is.false;
  });

  it('Invalidate invalid chars', async () => {
    const invalidDocumentID = ';,.|<>/=+-_)(*&^%!@#$?:]';
    expect(isValidDocumentID(invalidDocumentID)).is.false;
  });
});
