import { expect } from 'chai';
import { isValidDocumentID } from '../lib/validate.lib';

// XXX: Ideally these tests will not be needed when we are using proper types in the codebase!
describe('Validation', () => {
  it('Validate a correctly formatted ID', () => {
    const validDocumentID = '62328e357ec3446e40e1b29b';
    expect(isValidDocumentID(validDocumentID)).is.true;
  });

  it('Invalidate string too short', () => {
    const invalidDocumentID = '62328e357ec3446e40e1b29';
    expect(isValidDocumentID(invalidDocumentID)).is.false;
  });

  it('Invalidate string too long', () => {
    const invalidDocumentID = '62328e357ec3446e40e1b29be';
    expect(isValidDocumentID(invalidDocumentID)).is.false;
  });

  it('Invalidate non-string', () => {
    const invalidDocumentID = 123456789012345678901234;
    expect(isValidDocumentID(invalidDocumentID)).is.false;
  });

  it('Invalidate invalid chars', () => {
    const invalidDocumentID = ';,.|<>/=+-_)(*&^%!@#$?:]';
    expect(isValidDocumentID(invalidDocumentID)).is.false;
  });
});
