import { describe, expect, it } from "vitest";
import {
  claimPart, defaultRentalMonth, expectedForMonth, dueForMonth, paymentSlot, pendingMonths, rentTypeForMonth, roomMonth, suggestedRent,
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

  it("warns before a second payment for a covered Fixed month, and allows moving a payment onto a free month", () => {
    const r = { ...room(), payments: [p("a", 1, "3000"), p("b", 2, "3000")] };
    // Fully paid: another payment is only saved after "Save anyway?", and it becomes part 2.
    expect(paymentSlot(r, 2026, 1)).toMatchObject({ alreadyPaid: true, canOverride: true, part: 2 });
    expect(claimPart(paymentSlot(r, 2026, 1), false)).toEqual({ ok: false, needsConfirm: true });
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

describe("Fixed rent paid in parts", () => {
  const p = (id: string, year: number, month: number, amount: string, part = 1) => ({ id, year, month, amount, part });

  it("goes Due, then Partially paid with the balance, then Paid", () => {
    expect(roomMonth(room(), 2026, 11, now)).toMatchObject({ status: "due", balance: 3000 });

    const one = room({ payments: [pay(2026, 11, "2000")] });
    expect(roomMonth(one, 2026, 11, now)).toMatchObject({ status: "partial", paidTotal: 2000, balance: 1000 });

    const two = room({ payments: [pay(2026, 11, "2000"), pay(2026, 11, "1000")] });
    expect(roomMonth(two, 2026, 11, now)).toMatchObject({ status: "paid", paidTotal: 3000, balance: 0 });
  });

  it("a part-paid future month shows Partially paid, not Upcoming", () => {
    const r = room({ payments: [pay(2026, 12, "1000")] });
    expect(roomMonth(r, 2026, 12, now)).toMatchObject({ status: "partial", balance: 2000 });
  });

  it("allows an extra payment after Paid only with the confirm flag, as the next part", () => {
    const r = { ...room(), payments: [p("a", 2026, 11, "2000", 1), p("b", 2026, 11, "1000", 2)] };
    const slot = paymentSlot(r, 2026, 11);
    expect(slot).toMatchObject({ type: "fixed", alreadyPaid: true, canOverride: true, part: 3 });
    expect(claimPart(slot, false)).toEqual({ ok: false, needsConfirm: true });
    expect(claimPart(slot, true)).toEqual({ ok: true, part: 3 });
    // Not yet covered: no confirm needed.
    const partial = { ...room(), payments: [p("a", 2026, 11, "2000", 1)] };
    expect(claimPart(paymentSlot(partial, 2026, 11), false)).toEqual({ ok: true, part: 2 });
  });

  it("numbers parts max + 1 for that room's month, even after a part was deleted", () => {
    const r = { ...room(), payments: [p("a", 2026, 5, "1000", 1), p("c", 2026, 5, "500", 3), p("x", 2026, 6, "3000", 7)] };
    expect(paymentSlot(r, 2026, 5).part).toBe(4);
    expect(paymentSlot(r, 2026, 7).part).toBe(1);
    // Same month number in another year is a different Rental Month.
    expect(paymentSlot(r, 2025, 5).part).toBe(1);
  });

  it("moving a payment's Rental Month puts it on the next free part of the new month", () => {
    const r = { ...room(), payments: [p("a", 2026, 3, "1500", 1), p("b", 2026, 3, "1500", 2), p("m", 2026, 4, "1000", 1)] };
    // Moving "m" (April) onto March: March is covered, so it asks first, then takes part 3.
    const slot = paymentSlot(r, 2026, 3, "m");
    expect(slot).toMatchObject({ alreadyPaid: true, part: 3 });
    expect(claimPart(slot, true)).toEqual({ ok: true, part: 3 });
    // Moving "b" (March part 2) to April, which has part 1: it becomes April part 2, and March is part-paid.
    expect(paymentSlot(r, 2026, 4, "b")).toMatchObject({ alreadyPaid: false, part: 2 });
    const moved = room({ payments: [pay(2026, 3, "1500"), pay(2026, 4, "1000"), pay(2026, 4, "1500")] });
    expect(roomMonth(moved, 2026, 3, now)).toMatchObject({ status: "partial", balance: 1500 });
    expect(roomMonth(moved, 2026, 4, now)).toMatchObject({ status: "partial", balance: 500 });
    // Keeping a payment on its own month never collides with itself.
    expect(paymentSlot(r, 2026, 3, "b")).toMatchObject({ alreadyPaid: false, part: 2 });
  });

  it("pending sums every part: rent minus paid when above 0, never negative, never double-counted", () => {
    const r = room({
      payments: [
        pay(2026, 1, "3000"), // paid in one go
        pay(2026, 2, "2000"), pay(2026, 2, "500"), // part-paid, 500 left
        pay(2026, 3, "3000"), pay(2026, 3, "1000"), // paid plus an extra 1000
        pay(2026, 4, "1500"), pay(2026, 4, "1500"), // paid in two parts
      ],
    });
    const pending = pendingMonths(r, now);
    expect(pending.map((x) => [x.month, x.amount])).toEqual([
      [2, 500], [5, 3000], [6, 3000], [7, 3000], [8, 3000], [9, 3000], [10, 3000], [11, 3000],
    ]);
    expect(pending.reduce((s, x) => s + x.amount, 0)).toBe(21500);
    expect(roomMonth(r, 2026, 3, now)).toMatchObject({ status: "paid", paidTotal: 4000, balance: 0 });
  });

  it("an unpaid Fixed month at ₹0 still counts as pending, as before", () => {
    const r = room({ rents: [{ ...fixedRent, amount: "0.00" }], payments: [pay(2026, 1, "100")] });
    const pending = pendingMonths(r, now);
    expect(pending.map((x) => x.month)).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    expect(pending.every((x) => x.amount === 0)).toBe(true);
  });

  it("this month's expected is the rent when part-paid, and what was paid when more came in", () => {
    const at = (payments: { year: number; month: number; amount: string }[]) =>
      expectedForMonth(roomMonth(room({ payments }), 2026, 11, now));
    expect(at([])).toBe(3000);
    expect(at([pay(2026, 11, "1000")])).toBe(3000);
    expect(at([pay(2026, 11, "3000")])).toBe(3000);
    expect(at([pay(2026, 11, "3000"), pay(2026, 11, "500")])).toBe(3500);
  });
});
