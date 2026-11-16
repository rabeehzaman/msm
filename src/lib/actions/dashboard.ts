"use server";

import { requireRole } from "@/lib/auth/guard";
import { todayIST } from "@/lib/format";
import { run, UserError } from "@/lib/money/action";
import { parsePeriod, periodProblem, resolvePeriod } from "@/lib/period";
import { getDashboardEntries, getDashboardPeriod, isCardKey } from "@/lib/queries/dashboard";

// Read-only, so view-only users can use the Dashboard filter too.

// The Dashboard figures for a period ("this-month" or "custom:YYYY-MM-DD:YYYY-MM-DD").
// The phone keeps the choice in a session cookie itself: setting a cookie here would make Next.js
// render the whole page again on top of this answer.
export async function loadDashboardPeriod(value: string) {
  return run(async () => {
    await requireRole("viewer");
    const period = parsePeriod(value);
    if (!period) {
      const custom = /^custom:([^:]*):([^:]*)$/.exec(value);
      throw new UserError((custom && periodProblem(custom[1], custom[2])) || "Please enter a valid date.");
    }
    const resolved = resolvePeriod(period, todayIST());
    const data = await getDashboardPeriod(resolved.from, resolved.to);
    return { period: resolved, data };
  });
}

// The entries behind one card, for the same From–To as the card.
export async function loadDashboardEntries(key: string, from: string, to: string) {
  return run(async () => {
    await requireRole("viewer");
    const problem = periodProblem(from, to);
    if (problem) throw new UserError(problem);
    if (!isCardKey(key)) throw new UserError("Nothing to show for this card.");
    return getDashboardEntries(key, from, to);
  });
}
