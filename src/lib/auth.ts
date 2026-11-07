/**
 * LivelihoodSaathi AI - Enterprise Authentication & Role-Based Access Control (RBAC)
 * Supports SUPER_ADMIN, ORG_ADMIN, COORDINATOR, BENEFICIARY tiers with strict multi-tenant scoping.
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'livelihoodsaathi-super-secret-jwt-key-2026-production';
const JWT_EXPIRES_IN = '7d';

export type UserRole = 'SUPER_ADMIN' | 'ORG_ADMIN' | 'COORDINATOR' | 'BENEFICIARY';

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  organizationId: string | null;
  name: string;
}

/**
 * Hash password with bcrypt
 */
export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

/**
 * Verify password against bcrypt hash
 */
export function verifyPassword(password: string, hash: string): boolean {
  try {
    return bcrypt.compareSync(password, hash);
  } catch {
    return false;
  }
}

/**
 * Sign JWT token for user session
 */
export function createToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * Extract authenticated user payload from NextRequest (Authorization header or Cookie)
 */
export function getUserFromRequest(req: Request | NextRequest): TokenPayload | null {
  try {
    // 1. Check Authorization: Bearer <token>
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      const payload = verifyToken(token);
      if (payload) return payload;
    }

    // 2. Check Cookie
    const cookieHeader = req.headers.get('cookie') || '';
    const match = cookieHeader.match(/(?:saathi_token|token)=([^;]+)/);
    if (match && match[1]) {
      const payload = verifyToken(decodeURIComponent(match[1].trim()));
      if (payload) return payload;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * RBAC Guard: Checks if request comes from an authenticated user with an allowed role
 */
export function requireAuth(
  req: Request | NextRequest,
  allowedRoles?: UserRole[]
): { user: TokenPayload } | { errorResponse: NextResponse } {
  const user = getUserFromRequest(req);

  if (!user) {
    return {
      errorResponse: NextResponse.json(
        { error: 'Unauthorized: Authentication required. Please provide a valid Bearer token.' },
        { status: 401 }
      ),
    };
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return {
      errorResponse: NextResponse.json(
        {
          error: `Forbidden: Role '${user.role}' lacks permission for this resource. Required: ${allowedRoles.join(', ')}`,
        },
        { status: 403 }
      ),
    };
  }

  return { user };
}

/**
 * Strict Multi-Tenant Isolation Enforcement:
 * Ensures users can never access records from another organization.
 */
export function enforceOrgScope(user: TokenPayload, targetOrgId: string | null): boolean {
  if (user.role === 'SUPER_ADMIN') {
    return true; // Super admin can oversee all organizations
  }

  if (!user.organizationId || !targetOrgId) {
    return false;
  }

  return user.organizationId === targetOrgId;
}

/**
 * Resolve effective organization filter for database queries.
 * Prevents ORG_ADMIN or COORDINATOR from spoofing other organizations via query params.
 */
export function resolveScopedOrgId(user: TokenPayload, requestedOrgId?: string | null): string | null {
  if (user.role === 'SUPER_ADMIN') {
    return requestedOrgId || null;
  }
  return user.organizationId;
}

