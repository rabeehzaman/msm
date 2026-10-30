"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, NativeSelect, SaveButton, useAction } from "@/components/money/form";
import { PageHeader } from "@/components/money/page-header";
import { updateAppUser } from "@/lib/actions/users";
import { useT } from "@/lib/i18n/client";

type AppUser = {
  userId: string;
  email: string;
  displayName: string | null;
  role: "admin" | "entry" | "viewer" | null;
  isActive: boolean;
};

export function UsersClient({ users }: { users: AppUser[] }) {
  const t = useT();
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Users & Access"
        subtitle="A new person signs up on the login page and appears here. Choose a role to let them in."
      />
      <div className="grid gap-4 md:grid-cols-2">
        {users.map((u) => (
          <UserCard key={u.userId} user={u} />
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t("What each role can do")}</CardTitle>
          <CardDescription>
            <span className="block">{t("Admin (Secretary/Treasurer): full access, settings, edit and delete.")}</span>
            <span className="block">{t("Entry user: can add entries, cannot delete entries or change settings.")}</span>
            <span className="block">{t("View only (President/committee): dashboard and reports only.")}</span>
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

function UserCard({ user }: { user: AppUser }) {
  const t = useT();
  const save = useAction(updateAppUser, { success: "Saved" });
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2 text-base">
          <span className="min-w-0 truncate">{user.email}</span>
          {!user.role && <Badge variant="destructive">{t("Waiting for access")}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={save.call} className="flex flex-col gap-3">
          <input type="hidden" name="userId" value={user.userId} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={t("Name")}>
              <Input name="displayName" defaultValue={user.displayName ?? ""} />
            </Field>
            <Field label={t("Role")}>
              <NativeSelect name="role" defaultValue={user.role ?? ""}>
                <option value="">{t("No access")}</option>
                <option value="admin">{t("Admin")}</option>
                <option value="entry">{t("Entry user")}</option>
                <option value="viewer">{t("View only")}</option>
              </NativeSelect>
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isActive" defaultChecked={user.isActive} className="size-4 accent-[var(--primary)]" />
            {t("Active")}
          </label>
          <SaveButton pending={save.pending} size="sm" className="self-start" />
        </form>
      </CardContent>
    </Card>
  );
}
