// Mirrors POST /auth/login and POST /auth/register (backend/services/authService.js).

export type UserRole = "client" | "owner" | "admin";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  picture: string | null;
  role: UserRole;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

// Exactly the JWT payload's public fields. `picture` is absent from the JWT
// by design (the backend never puts it in the token), so it cannot appear here.
export type SessionUser = {
  id: number;
  name: string;
  email: string | null;
  role: UserRole;
};
