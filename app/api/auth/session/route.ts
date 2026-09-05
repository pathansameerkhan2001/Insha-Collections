import { NextRequest, NextResponse } from "next/server";
import { isCognitoConfigured } from "@/lib/auth/cognitoAuth";

const SESSION_COOKIE_NAME = "insha_admin_session";

export async function GET(req: NextRequest) {
  try {
    const cookie = req.cookies.get(SESSION_COOKIE_NAME);

    if (!cookie || !cookie.value) {
      return NextResponse.json(
        { authenticated: false, session: null, cognitoMode: isCognitoConfigured() },
        { status: 401 }
      );
    }

    const session = JSON.parse(cookie.value);

    // Validate expiration
    if (session.expiresAt && Date.now() > session.expiresAt) {
      return NextResponse.json(
        { authenticated: false, session: null, error: "Session expired", cognitoMode: isCognitoConfigured() },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      session,
      cognitoMode: isCognitoConfigured(),
    });
  } catch {
    return NextResponse.json(
      { authenticated: false, session: null, error: "Invalid session" },
      { status: 401 }
    );
  }
}
