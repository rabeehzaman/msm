import { describe, expect, it } from "vitest";
import { otherIncomeLedger, splitIncome } from "./other-income";

const entry = {
  id: "11111111-1111-1111-1111-111111111111",
  date: "2026-11-12",
  amount: "5000.00",
  accountId: "cash",
  fundId: "general",
  headName: "Hall / Auditorium hire",
  receivedFrom: "Ali",
  receiptNumber: "OTH-0001",
  bookNumber: null,
  note: "Wedding",
};

// The same sums the app runs in SQL: account and fund balances (in minus out) and month income.
function totals(lines: ReturnType<typeof otherIncomeLedger>[]) {
  const signed = (l: (typeof lines)[number]) => (l.direction === "in" ? 1 : -1) * Number(l.amount);
  const by = (key: "accountId" | "fundId", id: string) => lines.filter((l) => l[key] === id).reduce((s, l) => s + signed(l), 0);
  return {
    cash: by("accountId", "cash"),
    generalFund: by("fundId", "general"),
    monthIncome: lines.filter((l) => l.kind === "income" && l.date.startsWith("2026-11")).reduce((s, l) => s + Number(l.amount), 0),
  };
}

describe("Other Income in balances and totals", () => {
  it("posts one income line into the chosen account and fund", () => {
    const line = otherIncomeLedger(entry);
    expect(line).toMatchObject({
      direction: "in",
      kind: "income",
      sourceType: "other_income",
      sourceId: entry.id,
      accountId: "cash",
      fundId: "general",
      amount: "5000.00",
      category: "Hall / Auditorium hire",
      party: "Ali",
      receiptNumber: "OTH-0001",
    });
  });

  it("raises Cash, the fund and month income by ₹5,000; an edit to ₹4,500 adjusts by -₹500; delete restores", () => {
    const before = totals([]);
    const added = totals([otherIncomeLedger(entry)]);
    expect(added.cash - before.cash).toBe(5000);
    expect(added.generalFund - before.generalFund).toBe(5000);
    expect(added.monthIncome - before.monthIncome).toBe(5000);

    // An edit replaces the entry's one line (replaceLedger), it never adds a second one.
    const edited = totals([otherIncomeLedger({ ...entry, amount: "4500.00" })]);
    expect(edited.cash - added.cash).toBe(-500);
    expect(edited.monthIncome - added.monthIncome).toBe(-500);

    expect(totals([])).toEqual(before);
  });
});

describe("Reports: Other Income as its own group", () => {
  it("keeps Other Income apart from collections and breaks it down by head", () => {
    const split = splitIncome([
      { sourceType: "collection", category: "General Fund", total: "1000" },
      { sourceType: "rent", category: "Rent", total: "3000" },
      { sourceType: "other_income", category: "Hall / Auditorium hire", total: "5000" },
      { sourceType: "other_income", category: "Coconut sale", total: "250.50" },
      { sourceType: "other_income", category: "Hall / Auditorium hire", total: "1000" },
    ]);
    expect(split.regular).toEqual([
      { category: "General Fund", amount: 1000 },
      { category: "Rent", amount: 3000 },
    ]);
    expect(split.other).toEqual([
      { category: "Coconut sale", amount: 250.5 },
      { category: "Hall / Auditorium hire", amount: 6000 },
    ]);
    expect(split.otherTotal).toBe(6250.5);
    expect(split.regularTotal + split.otherTotal).toBe(10250.5);
  });

  it("does not mix a collection category that has the same name as a head", () => {
    const split = splitIncome([
      { sourceType: "collection", category: "Miscellaneous", total: "100" },
      { sourceType: "other_income", category: "Miscellaneous", total: "200" },
    ]);
    expect(split.regular).toEqual([{ category: "Miscellaneous", amount: 100 }]);
    expect(split.other).toEqual([{ category: "Miscellaneous", amount: 200 }]);
  });
});
