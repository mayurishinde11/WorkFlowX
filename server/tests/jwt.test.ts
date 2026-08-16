import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  JwtPayload,
} from '../src/utils/jwt';

describe('JWT Utilities', () => {
  const testPayload: JwtPayload = {
    userId: 'test-user-id',
    companyId: 'test-company-id',
    role: 'ADMIN',
  };

  it('should generate a valid access token', () => {
    const token = generateAccessToken(testPayload);
    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(3);
  });

  it('should verify a valid access token and return the correct payload', () => {
    const token = generateAccessToken(testPayload);
    const decoded = verifyAccessToken(token);

    expect(decoded.userId).toBe(testPayload.userId);
    expect(decoded.companyId).toBe(testPayload.companyId);
    expect(decoded.role).toBe(testPayload.role);
  });

  it('should throw an error when verifying an invalid token', () => {
    expect(() => {
      verifyAccessToken('this.is.not.a.valid.token');
    }).toThrow();
  });

  it('should generate and verify a refresh token independently', () => {
    const refreshToken = generateRefreshToken(testPayload);
    const decoded = verifyRefreshToken(refreshToken);

    expect(decoded.userId).toBe(testPayload.userId);
  });

  it('should reject an access token when verified as a refresh token', () => {
    const accessToken = generateAccessToken(testPayload);

    expect(() => {
      verifyRefreshToken(accessToken);
    }).toThrow();
  });
});