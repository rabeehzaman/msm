"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/actions/auth";

export function SignOutButton({ label }: { label: string }) {
  return (
    <Button variant="outline" size="sm" onClick={() => signOut()}>
      {label}
    </Button>
  );
}
