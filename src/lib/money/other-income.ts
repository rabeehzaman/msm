import type { LedgerInput } from "./ledger";

export const OTHER_INCOME_SOURCE = "other_income";

// The Cash/Bank line for an Other Income entry. Cash & Bank balances, fund balances, the Dashboard's
// month income and Finance Overview's Total Income are all summed from these lines, so posting,
// replacing or removing this one line is what keeps every total in step.
export function otherIncomeLedger(entry: {
  id: string;
  date: string;
  amount: string;
  accountId: string;
  fundId: string;
  headName: string;
  receivedFrom: string | null;
  receiptNumber: string;
  bookNumber: string | null;
  note: string | null;
}): LedgerInput {
  return {
    accountId: entry.accountId,
    date: entry.date,
    direction: "in",
    kind: "income",
    amount: entry.amount,
    sourceType: OTHER_INCOME_SOURCE,
    sourceId: entry.id,
    category: entry.headName,
    fundId: entry.fundId,
    party: entry.receivedFrom,
    receiptNumber: entry.receiptNumber,
    bookNumber: entry.bookNumber,
    note: entry.note,
  };
}

type Line = { sourceType: string; category: string; total: number | string };

// Income split for reports: Other Income as its own group with a head-wise breakdown,
// everything else (collections, rent, fees ...) by category as before.
export function splitIncome(lines: Line[]) {
  const sum = (map: Map<string, number>, key: string, value: number) => map.set(key, Math.round(((map.get(key) ?? 0) + value) * 100) / 100);
  const regular = new Map<string, number>();
  const other = new Map<string, number>();
  for (const l of lines) sum(l.sourceType === OTHER_INCOME_SOURCE ? other : regular, l.category, Number(l.total));
  const sorted = (map: Map<string, number>) =>
    [...map.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([category, amount]) => ({ category, amount }));
  const total = (map: Map<string, number>) => Math.round([...map.values()].reduce((s, v) => s + v, 0) * 100) / 100;
  return { regular: sorted(regular), other: sorted(other), regularTotal: total(regular), otherTotal: total(other) };
}
