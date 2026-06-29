import { isValidEmail, isValidPassword, isStrongPassword } from '../src/utils/helpers';

describe('validation helpers', () => {
  describe('isValidEmail', () => {
    it('accepts valid emails', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
    });

    it('rejects invalid emails', () => {
      expect(isValidEmail('not-an-email')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('isValidPassword', () => {
    it('requires at least 6 characters', () => {
      expect(isValidPassword('12345')).toBe(false);
      expect(isValidPassword('123456')).toBe(true);
    });
  });

  describe('isStrongPassword', () => {
    it('requires mixed case, number, and special character', () => {
      expect(isStrongPassword('password')).toBe(false);
      expect(isStrongPassword('Password1!')).toBe(true);
    });
  });
});
