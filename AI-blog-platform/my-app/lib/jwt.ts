import { SignJWT, jwtVerify } from 'jose';
import { logger } from './logger';

export interface JWTPayload {
  sub: string; // subject (user id)
  name: string;
  email: string;
  role: string;
  iat?: number; // issued at
  exp?: number; // expires at
}

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXT_PUBLIC_AUTH_SECRET || 'fallback-secret-do-not-use-in-production'
);

const DEFAULT_EXPIRY = '7d'; // 7 days

export async function signJWT(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  try {
    const expiry = process.env.NEXT_PUBLIC_AUTH_EXPIRY || DEFAULT_EXPIRY;
    
    const token = await new SignJWT({ ...payload })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(expiry)
      .sign(JWT_SECRET);
    
    return token;
  } catch (error) {
    logger.error('Error signing JWT', { error });
    throw new Error('Failed to sign JWT');
  }
}

export async function verifyJWT(token: string): Promise<JWTPayload> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch (error) {
    logger.error('Error verifying JWT', { error });
    throw new Error('Invalid token');
  }
}

export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.split(' ')[1];
}