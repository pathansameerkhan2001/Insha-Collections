import { NextRequest, NextResponse } from "next/server";
import { isCognitoConfigured, authenticateWithCognito } from "@/lib/auth/cognitoAuth";
import { AdminUser } from "@/lib/auth/authTypes";

const SESSION_COOKIE_NAME = "insha_admin_session";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password, rememberMe } = body || {};

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "Username and password are required." },
        { status: 400 }
      );
    }

    const cleanUsername = String(username).trim();
    const cleanPassword = String(password);

    let user: AdminUser;
    let token: string;
    const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24; // 30 days or 24 hours

    if (isCognitoConfigured()) {
      // 1. AWS Cognito Authentication Mode
      try {
        const cognitoResult = await authenticateWithCognito(cleanUsername, cleanPassword);
        token = cognitoResult.idToken || cognitoResult.accessToken || "cognito_jwt";
        
        let userEmail = cleanUsername.includes("@") ? cleanUsername : undefined;
        let displayName = cleanUsername.includes("@") ? cleanUsername.split("@")[0] : cleanUsername;

        if (cognitoResult.idToken) {
          try {
            const parts = cognitoResult.idToken.split(".");
            if (parts.length > 1) {
              const decoded = JSON.parse(Buffer.from(parts[1], "base64").toString("utf-8"));
              if (decoded.email) userEmail = decoded.email;
              if (decoded.name) displayName = decoded.name;
            }
          } catch {
            // Ignore parse errors, use fallback display name
          }
        }

        user = {
          id: `cognito-${cleanUsername}`,
          username: cleanUsername,
          email: userEmail,
          name: displayName,
          role: "admin",
          createdAt: new Date().toISOString(),
        };
      } catch (cognitoErr: unknown) {
        const errorMsg = cognitoErr instanceof Error ? cognitoErr.message : "Invalid Cognito credentials";
        return NextResponse.json(
          { success: false, error: errorMsg },
          { status: 401 }
        );
      }
    } else {
      // 2. Development Auth Mode (Cognito Pending)
      // Allows testing the admin system before Cognito User Pool is provisioned.
      // Accepts admin / admin123 or insha_admin / insha@2026 or any non-empty credential for local dev verification.
      const validDevUsers = ["admin", "insha_admin", "inshacollections", "sameer"];
      const isDevValid = (validDevUsers.includes(cleanUsername.toLowerCase()) && cleanPassword.length >= 6) ||
        (cleanUsername.length >= 3 && cleanPassword === "admin123") ||
        (cleanUsername.length >= 3 && cleanPassword === "insha@2026") ||
        (cleanUsername.length >= 3 && cleanPassword.length >= 6); // standard dev flexibility

      if (!isDevValid) {
        return NextResponse.json(
          { success: false, error: "Invalid username or password. (For development, enter username with minimum 3 chars and password with minimum 6 chars)" },
          { status: 401 }
        );
      }

      user = {
        id: `dev-${cleanUsername}`,
        username: cleanUsername,
        name: cleanUsername === "admin" ? "Insha Store Manager" : cleanUsername,
        role: "admin",
        createdAt: new Date().toISOString(),
      };
      token = `dev_token_${Buffer.from(cleanUsername + ":" + Date.now()).toString("base64")}`;
    }

    const sessionData = {
      user,
      token,
      expiresAt: Date.now() + maxAge * 1000,
    };

    const response = NextResponse.json({
      success: true,
      user,
      session: sessionData,
      cognitoMode: isCognitoConfigured(),
    });

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: JSON.stringify(sessionData),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge,
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server authentication error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
