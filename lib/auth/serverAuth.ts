import { NextRequest, NextResponse } from "next/server";
import { AuthSession } from "./authTypes";

const SESSION_COOKIE_NAME = "insha_admin_session";

/**
 * Validates the admin session cookie from the incoming request.
 * Returns the active session if valid, or null if missing/expired.
 */
export function getAdminSession(req: NextRequest): AuthSession | null {
  try {
    const cookie = req.cookies.get(SESSION_COOKIE_NAME);
    if (!cookie || !cookie.value) {
      return null;
    }

    const session = JSON.parse(cookie.value) as AuthSession;

    // Check expiration
    if (session.expiresAt && Date.now() > session.expiresAt) {
      return null;
    }

    if (!session.user || !session.user.id) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

/**
 * Guard middleware for admin API routes.
 * If unauthenticated or expired, returns 401 Unauthorized NextResponse.
 * Otherwise returns null (allowing the route handler to proceed).
 */
export function verifyAdminSessionOrReject(req: NextRequest): NextResponse | null {
  const session = getAdminSession(req);
  if (!session) {
    return NextResponse.json(
      {
        success: false,
        error: "Unauthorized: Admin session required. Please log in to the Admin Workspace.",
      },
      { status: 401 }
    );
  }
  return null;
}
