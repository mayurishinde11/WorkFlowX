import { hashPassword, comparePassword } from '../src/utils/password';

describe('Password Utilities', () => {
  it('should hash a password to a different string', async () => {
    const plainPassword = 'MySecurePassword123';
    const hashed = await hashPassword(plainPassword);

    expect(hashed).not.toBe(plainPassword);
    expect(hashed.length).toBeGreaterThan(20);
  });

  it('should verify a correct password against its hash', async () => {
    const plainPassword = 'MySecurePassword123';
    const hashed = await hashPassword(plainPassword);

    const isValid = await comparePassword(plainPassword, hashed);
    expect(isValid).toBe(true);
  });

  it('should reject an incorrect password against a hash', async () => {
    const plainPassword = 'MySecurePassword123';
    const wrongPassword = 'WrongPassword456';
    const hashed = await hashPassword(plainPassword);

    const isValid = await comparePassword(wrongPassword, hashed);
    expect(isValid).toBe(false);
  });

  it('should produce different hashes for the same password (due to salting)', async () => {
    const plainPassword = 'MySecurePassword123';
    const hash1 = await hashPassword(plainPassword);
    const hash2 = await hashPassword(plainPassword);

    expect(hash1).not.toBe(hash2);
  });
});