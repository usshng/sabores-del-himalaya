export type Role = "CUSTOMER" | "OWNER" | "CHEF" | "STAFF";

export interface AuthenticatedUser {
  login: string;
  role: Role;
}

export type LoginError = "INVALID_CREDENTIALS" | "NOT_ACTIVATED" | "UNKNOWN";

const AUTH_URL = "/api/auth";
const HTTP_UNAUTHORIZED = 401;
const HTTP_FORBIDDEN = 403;

export async function login(
  userLogin: string,
  password: string,
): Promise<AuthenticatedUser> {
  const response = await fetch(`${AUTH_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ login: userLogin, password }),
  });
  if (response.ok) {
    return (await response.json()) as AuthenticatedUser;
  }
  const error: LoginError =
    response.status === HTTP_UNAUTHORIZED
      ? "INVALID_CREDENTIALS"
      : response.status === HTTP_FORBIDDEN
        ? "NOT_ACTIVATED"
        : "UNKNOWN";
  throw new Error(error);
}

// Returns the logged-in user, or null when there is no session.
export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const response = await fetch(`${AUTH_URL}/me`);
  if (!response.ok) {
    return null;
  }
  return (await response.json()) as AuthenticatedUser;
}

export async function logout(): Promise<void> {
  await fetch(`${AUTH_URL}/logout`, { method: "POST" });
}
