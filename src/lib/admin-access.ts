export const ADMIN_EMAIL = "dlflyoverseas@gmail.com";

export function isAdminSession(
  email: string | null | undefined,
  emailVerified: boolean,
  provider: string | null | undefined,
) {
  return email?.toLowerCase() === ADMIN_EMAIL && emailVerified && provider === "google.com";
}
