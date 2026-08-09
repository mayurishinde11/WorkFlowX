import jwt from 'jsonwebtoken';

export interface JwtPayload {
  userId: string;
  companyId: string;
  role: string;
}

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET as string;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;
const ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m';
const REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

export function generateAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRY } as jwt.SignOptions);
}

export function generateRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRY } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, ACCESS_SECRET) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, REFRESH_SECRET) as JwtPayload;
}