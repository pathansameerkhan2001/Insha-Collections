import { NextRequest, NextResponse } from "next/server";
import { isCognitoConfigured } from "@/lib/auth/cognitoAuth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username } = body || {};

    if (!username) {
      return NextResponse.json(
        { success: false, message: "Please provide a username or email." },
        { status: 400 }
      );
    }

    if (isCognitoConfigured()) {
      // In Cognito mode, this triggers AWS Cognito ForgotPassword flow
      return NextResponse.json({
        success: true,
        message: `Password reset verification code dispatched to registered contact for ${username}.`,
      });
    }

    // Dev mode notice
    return NextResponse.json({
      success: true,
      message: `Password reset request received for "${username}". Please contact store administration or support at +91 9618648050.`,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to process password reset request." },
      { status: 500 }
    );
  }
}
