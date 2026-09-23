import { auth } from "@/lib/auth";

export type Role = "NANNY" | "FAMILY" | "ADMIN";

export type SessionUser = {
  id: string;
  role: Role;
  fullName: string;
};

export async function requireRole(
  ...roles: Role[]
): Promise<{ ok: true; user: SessionUser } | { ok: false; error: string }> {
  const session = await auth();

  if (!session?.user) {
    return { ok: false, error: "NOT_AUTHENTICATED" };
  }

  const user = session.user as unknown as SessionUser;

  if (!roles.includes(user.role)) {
    return { ok: false, error: "FORBIDDEN" };
  }

  return { ok: true, user };
}

export function dashboardPathForRole(role: Role): string {
  if (role === "NANNY") return "/baba";
  if (role === "FAMILY") return "/familia";
  return "/admin";
}
