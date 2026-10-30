"use client";

import { createContext, useContext } from "react";
import { hasRole, type Role } from "./access";

type Session = { name: string; email: string; role: Role };

const SessionContext = createContext<Session>({ name: "", email: "", role: "viewer" });

export function SessionProvider({ value, children }: { value: Session; children: React.ReactNode }) {
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const session = useContext(SessionContext);
  return {
    ...session,
    canEnter: hasRole(session.role, "entry"),
    isAdmin: hasRole(session.role, "admin"),
  };
}
