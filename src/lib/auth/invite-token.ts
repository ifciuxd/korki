import { SignJWT, jwtVerify } from 'jose';
import type { UserRole } from '@/lib/constants';

const TOKEN_EXPIRY = '7d';
const ALG = 'HS256';

function getSecret(): Uint8Array {
  const secret = process.env.INVITE_TOKEN_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      'INVITE_TOKEN_SECRET environment variable must be set and at least 32 characters long',
    );
  }
  return new TextEncoder().encode(secret);
}

export interface InviteTokenPayload {
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  // Student-specific (only present when role === 'student')
  gradeLevel?: string;
  examTarget?: 'none' | 'egzamin8' | 'matura_podstawowa' | 'matura_rozszerzona';
  parentId?: string;
  // Parent-specific
  phone?: string;
}

export async function createInviteToken(
  payload: InviteTokenPayload,
): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(getSecret());
}

export async function verifyInviteToken(
  token: string,
): Promise<InviteTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      algorithms: [ALG],
    });
    return payload as unknown as InviteTokenPayload;
  } catch {
    return null;
  }
}
