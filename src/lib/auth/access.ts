export type Role = "admin" | "entry" | "viewer";

const rank: Record<Role, number> = { viewer: 1, entry: 2, admin: 3 };

export function hasRole(role: Role | null | undefined, min: Role) {
  return !!role && rank[role] >= rank[min];
}

const under = (pathname: string, prefix: string) => pathname === prefix || pathname.startsWith(prefix + "/");

// Pages anyone may open whether or not they have been given a role yet.
export function isOpenPath(pathname: string) {
  return under(pathname, "/login") || under(pathname, "/auth") || under(pathname, "/no-access");
}

// Which pages a role may open. Server actions check the role again on their own.
export function canOpenPath(role: Role, pathname: string) {
  if (role === "admin") return true;
  if (role === "entry") return !under(pathname, "/settings");
  return pathname === "/" || under(pathname, "/dashboard") || under(pathname, "/reports");
}
