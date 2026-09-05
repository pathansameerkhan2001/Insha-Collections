import crypto from "crypto";

export interface CognitoConfig {
  region: string;
  userPoolId: string;
  clientId: string;
  clientSecret?: string;
}

export function isCognitoConfigured(): boolean {
  return !!(
    process.env.AWS_COGNITO_REGION &&
    process.env.AWS_COGNITO_USER_POOL_ID &&
    process.env.AWS_COGNITO_CLIENT_ID
  );
}

export function getCognitoConfig(): CognitoConfig | null {
  if (!isCognitoConfigured()) return null;
  return {
    region: process.env.AWS_COGNITO_REGION || "ap-southeast-2",
    userPoolId: process.env.AWS_COGNITO_USER_POOL_ID || "ap-southeast-2_BAyDRrryV",
    clientId: process.env.AWS_COGNITO_CLIENT_ID || "1o4lmii74fafsmui9rnpu6em2v",
    clientSecret: process.env.AWS_COGNITO_CLIENT_SECRET,
  };
}

export function calculateSecretHash(
  username: string,
  clientId: string,
  clientSecret: string
): string {
  return crypto
    .createHmac("SHA256", clientSecret)
    .update(username + clientId)
    .digest("base64");
}

export interface CognitoAuthResult {
  accessToken?: string;
  idToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  challengeName?: string;
  session?: string;
}

/**
 * Perform AWS Cognito InitiateAuth API call (USER_PASSWORD_AUTH flow)
 */
export async function authenticateWithCognito(
  username: string,
  password: string
): Promise<CognitoAuthResult> {
  const config = getCognitoConfig();
  if (!config) {
    throw new Error(
      "AWS Cognito is not configured. Please set AWS_COGNITO_REGION, AWS_COGNITO_USER_POOL_ID, and AWS_COGNITO_CLIENT_ID in .env.local."
    );
  }

  // AWS Cognito REST InitiateAuth endpoint
  const endpoint = `https://cognito-idp.${config.region}.amazonaws.com/`;

  const trimmedUsername = username.trim();
  const authParams: Record<string, string> = {
    USERNAME: trimmedUsername,
    PASSWORD: password,
  };

  // If App Client has a Client Secret, calculate and append SECRET_HASH
  if (config.clientSecret) {
    authParams.SECRET_HASH = calculateSecretHash(
      trimmedUsername,
      config.clientId,
      config.clientSecret
    );
  }

  const payload = {
    AuthFlow: "USER_PASSWORD_AUTH",
    ClientId: config.clientId,
    AuthParameters: authParams,
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": "AWSCognitoIdentityProviderService.InitiateAuth",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorType = (data.__type || data.name || "CognitoAuthError").split("#").pop();
    const rawMessage = data.message || "Cognito authentication failed.";

    if (process.env.NODE_ENV === "development") {
      console.error(`[AWS Cognito Auth Diagnostics] Type: ${errorType} | Message: ${rawMessage}`);
    }

    switch (errorType) {
      case "NotAuthorizedException":
        throw new Error("Incorrect username or password in AWS Cognito.");
      case "UserNotFoundException":
        throw new Error("User does not exist in Cognito User Pool.");
      case "UserNotConfirmedException":
        throw new Error("User account is not yet confirmed in AWS Cognito.");
      case "PasswordResetRequiredException":
        throw new Error("Password reset is required for this Cognito account.");
      case "InvalidParameterException":
        if (rawMessage.includes("USER_PASSWORD_AUTH")) {
          throw new Error(
            "USER_PASSWORD_AUTH flow is not enabled for this App Client in AWS Cognito. Please enable 'ALLOW_USER_PASSWORD_AUTH' under App Client Authentication Flows in AWS Console."
          );
        }
        throw new Error(`[${errorType}]: ${rawMessage}`);
      default:
        throw new Error(`[${errorType}]: ${rawMessage}`);
    }
  }

  // Handle Challenges (e.g. NEW_PASSWORD_REQUIRED)
  if (data.ChallengeName) {
    if (data.ChallengeName === "NEW_PASSWORD_REQUIRED") {
      throw new Error(
        "First-time login detected: A permanent password must be set for this user in AWS Cognito."
      );
    }
    throw new Error(`Cognito Challenge Required: ${data.ChallengeName}`);
  }

  return {
    accessToken: data.AuthenticationResult?.AccessToken,
    idToken: data.AuthenticationResult?.IdToken,
    refreshToken: data.AuthenticationResult?.RefreshToken,
    expiresIn: data.AuthenticationResult?.ExpiresIn,
  };
}
