import { SignJWT, jwtVerify } from 'jose';

export interface JWTPayload {
  sub: string; // subject (user id)
  name: string;
  email: string;
  role: string;
  iat?: number; // issued at
  exp?: number; // expires at
}

const ACCESS_SECRET = new TextEncoder().encode(
  process.env.AUTH_ACCESS_SECRET || process.env.AUTH_SECRET || process.env.JWT_SECRET || 'fallback-secret-do-not-use-in-production'
);
const REFRESH_SECRET = new TextEncoder().encode(
  process.env.AUTH_REFRESH_SECRET || process.env.AUTH_SECRET || process.env.JWT_SECRET || 'fallback-secret-do-not-use-in-production'
);

const DEFAULT_ACCESS_EXPIRY = process.env.AUTH_ACCESS_EXPIRY || '15m';
const DEFAULT_REFRESH_EXPIRY = process.env.AUTH_REFRESH_EXPIRY || '7d';

export async function signJWT(payload: Omit<JWTPayload, 'iat' | 'exp'>, opts?: { expiry?: string; type?: 'access' | 'refresh' }): Promise<string> {
  try {
    const type = opts?.type || 'access'
    const expiry = opts?.expiry || (type === 'access' ? DEFAULT_ACCESS_EXPIRY : DEFAULT_REFRESH_EXPIRY)
    const secret = type === 'access' ? ACCESS_SECRET : REFRESH_SECRET

    const token = await new SignJWT({ ...payload })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(expiry)
      .sign(secret);

    return token;
  } catch (error) {
    console.error('Error signing JWT:', error);
    throw new Error('Failed to sign JWT');
  }
}

export async function verifyJWT(token: string): Promise<JWTPayload> {
  try {
    const { payload } = await jwtVerify(token, ACCESS_SECRET);
    return payload as unknown as JWTPayload;
  } catch (error) {
    // Don't log in production to avoid console spam
    if (process.env.NODE_ENV === 'development') {
      console.error('Error verifying JWT:', error);
    }
    throw new Error('Invalid token');
  }
}

export async function verifyRefreshJWT(token: string): Promise<JWTPayload> {
  try {
    const { payload } = await jwtVerify(token, REFRESH_SECRET);
    return payload as unknown as JWTPayload;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error verifying refresh JWT:', error);
    }
    throw new Error('Invalid token');
  }
}

export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.split(' ')[1];
}