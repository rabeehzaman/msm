import { describe, expect, it } from "vitest";
import {
  defaultRentalMonth, dueForMonth, paymentSlot, pendingMonths, rentTypeForMonth, roomMonth, suggestedRent,
  type RoomMonthFacts,
} from "./status";

const now = { year: 2026, month: 11 };
const tenancy = { id: "t1", tenantName: "Babu", startDate: "2026-01-05", endDate: null, duesFrom: null };
const fixedRent = { amount: "3000.00", effectiveFrom: "2026-01-01", rentType: "fixed" };

function room(over: Partial<RoomMonthFacts> = {}): RoomMonthFacts {
  return { tenancies: [tenancy], rents: [fixedRent], monthRents: [], payments: [], ...over };
}
const pay = (year: number, month: number, amount: string) => ({ year, month, amount });

describe("Rental Month (fixed rooms)", () => {
  it("marks the Rental Month paid, not the month of the payment date", () => {
    // January rent received in November is stored as year 2026, month 1.
    const r = room({ payments: [pay(2026, 1, "3000")] });
    expect(roomMonth(r, 2026, 1, now).status).toBe("paid");
    expect(roomMonth(r, 2026, 11, now).status).toBe("due");
  });

  it("shows a Rental Month from another year under that year", () => {
    const r = room({
      tenancies: [{ ...tenancy, startDate: "2025-06-01" }],
      rents: [{ ...fixedRent, effectiveFrom: "2025-06-01" }],
      payments: [pay(2025, 12, "3000")],
    });
    expect(roomMonth(r, 2025, 12, now).status).toBe("paid");
    expect(roomMonth(r, 2026, 12, now).status).toBe("upcoming");
  });

  it("allows paying a future month in advance, which turns green", () => {
    const r = room({ payments: [pay(2026, 12, "3000")] });
    expect(roomMonth(r, 2026, 12, now).status).toBe("paid");
  });

  it("treats months before the tenant's start, or with no tenant, as vacant", () => {
    const r = room({ tenancies: [{ ...tenancy, startDate: "2026-03-10" }] });
    expect(roomMonth(r, 2026, 2, now).status).toBe("vacant");
    expect(roomMonth(r, 2026, 3, now).tracked).toBe(true);
  });

  it("keeps the old pending rule for fixed rooms", () => {
    const r = room({ payments: [pay(2026, 1, "3000"), pay(2026, 2, "3000")] });
    const pending = pendingMonths(r, now);
    expect(pending.map((p) => p.month)).toEqual([3, 4, 5, 6, 7, 8, 9, 10, 11]);
    expect(pending.every((p) => p.amount === 3000)).toBe(true);
  });

  it("opens on the oldest unpaid month, or this month when nothing is due", () => {
    expect(defaultRentalMonth(room({ payments: [pay(2026, 1, "3000")] }), now)).toEqual({ year: 2026, month: 2 });
    const allPaid = room({ payments: Array.from({ length: 11 }, (_, i) => pay(2026, i + 1, "3000")) });
    expect(defaultRentalMonth(allPaid, now)).toEqual(now);
  });
});

describe("Variable rent", () => {
  const variable = { amount: "0.00", effectiveFrom: "2026-01-01", rentType: "variable" };

  it("shows Amount not set (not Due) and adds nothing to pending until the rent is entered", () => {
    const r = room({ rents: [variable] });
    expect(roomMonth(r, 2026, 11, now).status).toBe("unset");
    expect(roomMonth(r, 2026, 12, now).status).toBe("upcoming");
    expect(pendingMonths(r, now)).toEqual([]);
  });

  it("goes Due, then Partially paid, then Paid as the month is entered and paid", () => {
    const set = room({ rents: [variable], monthRents: [{ year: 2026, month: 11, amount: "4500" }] });
    expect(roomMonth(set, 2026, 11, now).status).toBe("due");
    expect(pendingMonths(set, now)).toEqual([expect.objectContaining({ month: 11, amount: 4500 })]);

    const part = { ...set, payments: [pay(2026, 11, "3000")] };
    const m = roomMonth(part, 2026, 11, now);
    expect(m.status).toBe("partial");
    expect(m.balance).toBe(1500);
    expect(pendingMonths(part, now)[0].amount).toBe(1500);

    const full = { ...set, payments: [pay(2026, 11, "3000"), pay(2026, 11, "1500")] };
    expect(roomMonth(full, 2026, 11, now).status).toBe("paid");
    expect(pendingMonths(full, now)).toEqual([]);
  });

  it("keeps each month's own amount", () => {
    const r = room({
      rents: [variable],
      monthRents: [
        { year: 2026, month: 11, amount: "4500" },
        { year: 2026, month: 12, amount: "5200" },
      ],
    });
    expect(dueForMonth(r.rents, r.monthRents, 2026, 11)).toBe(4500);
    expect(dueForMonth(r.rents, r.monthRents, 2026, 12)).toBe(5200);
  });

  it("never uses the usual rent as the amount due, only as a suggestion", () => {
    const usual = { ...variable, amount: "4000.00" };
    const r = room({ rents: [usual] });
    expect(dueForMonth(r.rents, r.monthRents, 2026, 11)).toBeNull();
    expect(suggestedRent(r.rents, r.monthRents, 2026, 11)).toBe(4000);
    const withLast = room({ rents: [usual], monthRents: [{ year: 2026, month: 10, amount: "4300" }] });
    expect(suggestedRent(withLast.rents, withLast.monthRents, 2026, 11)).toBe(4300);
  });

  it("switching to Fixed from a later month leaves earlier months as they were", () => {
    const rents = [variable, { amount: "5000.00", effectiveFrom: "2027-01-01", rentType: "fixed" }];
    const r = room({ rents, monthRents: [{ year: 2026, month: 11, amount: "4500" }], payments: [pay(2026, 11, "4500")] });
    expect(rentTypeForMonth(rents, 2026, 12)).toBe("variable");
    expect(rentTypeForMonth(rents, 2027, 1)).toBe("fixed");
    expect(roomMonth(r, 2026, 11, now).status).toBe("paid");
    expect(roomMonth(r, 2027, 1, { year: 2027, month: 1 }).due).toBe(5000);
  });

  it("rooms without a rent type stay Fixed", () => {
    expect(rentTypeForMonth([{ amount: "3000", effectiveFrom: "2026-01-01" }], 2026, 5)).toBe("fixed");
  });
});

describe("Paying a month twice", () => {
  const p = (id: string, month: number, amount: string, part = 1) => ({ id, year: 2026, month, amount, part });

  it("refuses a second payment for a Fixed month, and allows moving a payment onto a free month", () => {
    const r = { ...room(), payments: [p("a", 1, "3000"), p("b", 2, "3000")] };
    expect(paymentSlot(r, 2026, 1)).toMatchObject({ alreadyPaid: true, canOverride: false });
    expect(paymentSlot(r, 2026, 3)).toMatchObject({ alreadyPaid: false, part: 1 });
    // Editing payment "a" and keeping it on January is not a duplicate of itself.
    expect(paymentSlot(r, 2026, 1, "a").alreadyPaid).toBe(false);
    // Moving "b" from February onto January is.
    expect(paymentSlot(r, 2026, 1, "b").alreadyPaid).toBe(true);
  });

  it("takes Variable parts until the rent is covered, then warns", () => {
    const base = { ...room({ rents: [{ amount: "0", effectiveFrom: "2026-01-01", rentType: "variable" }] }) };
    const monthRents = [{ year: 2026, month: 11, amount: "4500" }];
    const one = { ...base, monthRents, payments: [p("a", 11, "3000")] };
    expect(paymentSlot(one, 2026, 11)).toMatchObject({ alreadyPaid: false, part: 2 });
    const two = { ...base, monthRents, payments: [p("a", 11, "3000"), p("b", 11, "1500", 2)] };
    expect(paymentSlot(two, 2026, 11)).toMatchObject({ alreadyPaid: true, canOverride: true, part: 3 });
  });
});
