import Link from "next/link";
import { db } from "@/db";
import { appUsers } from "@/db/schema";
import { getCurrentUser, ensureTenant } from "@/lib/queries/auth";
import { getAppUser } from "@/lib/auth/guard";
import { getLang } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/translate";
import { BrandMark } from "@/components/brand";
import { SignOutButton } from "./sign-out-button";

export const dynamic = "force-dynamic";

export default async function NoAccessPage() {
  const user = await getCurrentUser();
  const lang = await getLang();
  const t = (s: string) => translate(lang, s);

  // A new login is recorded here so an admin can see it in Settings > Users.
  let appUser = await getAppUser();
  if (user && !appUser) {
    const tenant = await ensureTenant();
    await db
      .insert(appUsers)
      .values({ userId: user.id, tenantId: tenant.id, email: user.email ?? "" })
      .onConflictDoNothing();
    appUser = null;
  }
  const hasAccess = !!appUser?.role && appUser.isActive;

  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <div className="glass flex max-w-md flex-col items-center gap-4 rounded-3xl p-8 text-center shadow-glass-lg">
        <BrandMark className="size-12" />
        <h1 className="font-heading text-2xl font-semibold">
          {t(hasAccess ? "Something went wrong" : "Waiting for access")}
        </h1>
        <p className="text-muted-foreground text-sm">
          {t(
            hasAccess
              ? "We could not check your access just now. Please try again."
              : "Your login works, but an admin has not given you access yet. Ask the Secretary or Treasurer to open Settings > Users and choose a role for you.",
          )}
        </p>
        {user?.email && <p className="text-muted-foreground text-xs">{user.email}</p>}
        <div className="flex gap-2">
          {hasAccess && (
            <Link href="/dashboard" className="text-primary text-sm font-medium underline">
              {t("Try again")}
            </Link>
          )}
          {user ? <SignOutButton label={t("Sign out")} /> : <Link href="/login" className="text-primary text-sm font-medium underline">{t("Sign in")}</Link>}
        </div>
      </div>
    </main>
  );
}
