import { describe, expect, it } from "vitest";
import {
  checkSalaryMonth, defaultSalaryMonth, expectedLines, isSalaryMonthOpen, problemText, salaryCellStatus, salaryGridRows,
  salarySummary, type SalaryPerson,
} from "./calc";

const now = { year: 2026, month: 11 };

let seq = 0;
function pay(year: number, month: number, paidDate: string, over: { kind?: string; amount?: string; id?: string } = {}) {
  return { id: over.id ?? `p${++seq}`, year, month, kind: over.kind ?? "salary", amount: over.amount ?? "15000.00", paidDate };
}

function person(over: Partial<SalaryPerson> = {}): SalaryPerson {
  return {
    id: "abdu",
    name: "ABDU RASAK K",
    monthlySalary: "15000.00",
    cleaningFee: "0.00",
    cleaningMode: "none",
    joiningDate: "2026-01-10",
    duesFrom: null,
    isActive: true,
    inactiveFrom: null,
    allowances: [],
    payments: [],
    ...over,
  };
}

const statusOf = (rows: ReturnType<typeof salaryGridRows>, id: string, kind: string, month: number) =>
  rows.find((r) => r.person.id === id && r.kind === kind)!.months[month - 1].status;

describe("Salary Month on the grid", () => {
  it("marks the Salary Month paid, not the month of the payment date", () => {
    // February salary paid on 14-11-2026: stored as year 2026, month 2.
    const rows = salaryGridRows([person({ payments: [pay(2026, 2, "2026-11-14")] })], 2026, now);
    expect(statusOf(rows, "abdu", "salary", 2)).toBe("paid");
    expect(statusOf(rows, "abdu", "salary", 11)).toBe("due");
  });

  it("marks a different month than the tapped one when the Salary Month was changed", () => {
    // Opened from Mar, Salary Month changed to Apr: the payment is stored on April.
    const rows = salaryGridRows([person({ payments: [pay(2026, 4, "2026-11-14")] })], 2026, now);
    expect(statusOf(rows, "abdu", "salary", 4)).toBe("paid");
    expect(statusOf(rows, "abdu", "salary", 3)).toBe("due");
  });

  it("shows a Salary Month from another year under that year", () => {
    const p = person({ joiningDate: "2025-06-01", payments: [pay(2025, 12, "2026-11-14")] });
    expect(statusOf(salaryGridRows([p], 2025, now), "abdu", "salary", 12)).toBe("paid");
    expect(statusOf(salaryGridRows([p], 2026, now), "abdu", "salary", 12)).toBe("upcoming");
  });

  it("marks only that staff member", () => {
    const other = person({ id: "musthafa", name: "MUSTHAFA" });
    const rows = salaryGridRows([person({ payments: [pay(2026, 2, "2026-11-14")] }), other], 2026, now);
    expect(statusOf(rows, "abdu", "salary", 2)).toBe("paid");
    expect(statusOf(rows, "musthafa", "salary", 2)).toBe("due");
  });

  it("records a Separate cleaning fee against its chosen Salary Month, on its own row", () => {
    const p = person({
      cleaningMode: "separate",
      cleaningFee: "2000.00",
      payments: [pay(2026, 2, "2026-11-14", { kind: "cleaning", amount: "2000.00" })],
    });
    const rows = salaryGridRows([p], 2026, now);
    expect(statusOf(rows, "abdu", "cleaning", 2)).toBe("paid");
    expect(statusOf(rows, "abdu", "cleaning", 11)).toBe("due");
    expect(statusOf(rows, "abdu", "salary", 2)).toBe("due");
  });

  it("lets a future month be paid in advance, which turns green", () => {
    const rows = salaryGridRows([person({ payments: [pay(2026, 12, "2026-11-14")] })], 2026, now);
    expect(statusOf(rows, "abdu", "salary", 12)).toBe("paid");
    expect(checkSalaryMonth(person(), "salary", 2027, 1)).toBeNull();
  });

  it("moves the green mark when a payment's Salary Month is edited", () => {
    const before = person({ payments: [pay(2026, 3, "2026-11-14", { id: "x" })] });
    // Moving its own payment is not a clash.
    expect(checkSalaryMonth(before, "salary", 2026, 4, { id: "x", year: 2026, month: 3 })).toBeNull();
    const after = person({ payments: [pay(2026, 4, "2026-11-14", { id: "x" })] });
    const rows = salaryGridRows([after], 2026, now);
    expect(statusOf(rows, "abdu", "salary", 4)).toBe("paid");
    expect(statusOf(rows, "abdu", "salary", 3)).toBe("due");
  });
});

describe("Existing payments", () => {
  it("keep showing in the month they were stored for, whatever their payment date", () => {
    // Before this change the popup saved the tapped cell's month as year + month, so the same
    // columns are read now: nothing moves.
    const p = person({ payments: [pay(2026, 1, "2026-03-05"), pay(2026, 2, "2026-02-28"), pay(2026, 3, "2026-01-31")] });
    const rows = salaryGridRows([p], 2026, now);
    expect([1, 2, 3].map((m) => statusOf(rows, "abdu", "salary", m))).toEqual(["paid", "paid", "paid"]);
    expect(statusOf(rows, "abdu", "salary", 4)).toBe("due");
  });

  it("stay listed for someone inactive, and someone inactive with no date stays closed as before", () => {
    const p = person({ isActive: false, inactiveFrom: null, payments: [pay(2026, 2, "2026-02-28")] });
    const rows = salaryGridRows([p], 2026, now);
    expect(statusOf(rows, "abdu", "salary", 2)).toBe("paid");
    expect(statusOf(rows, "abdu", "salary", 3)).toBe("vacant");
    expect(salaryGridRows([person({ isActive: false })], 2026, now)).toHaveLength(0);
    expect(salarySummary([person({ isActive: false })], now).pendingCount).toBe(0);
  });
});

describe("Default Salary Month", () => {
  it("opens on the oldest unpaid month", () => {
    expect(defaultSalaryMonth(person({ payments: [pay(2026, 1, "2026-01-31")] }), "salary", now)).toEqual({ year: 2026, month: 2 });
  });

  it("opens on this month when nothing is pending", () => {
    const allPaid = person({ payments: Array.from({ length: 11 }, (_, i) => pay(2026, i + 1, "2026-11-14")) });
    expect(defaultSalaryMonth(allPaid, "salary", now)).toEqual(now);
  });

  it("starts from 'Count dues from' when it is set", () => {
    expect(defaultSalaryMonth(person({ duesFrom: "2026-06-01" }), "salary", now)).toEqual({ year: 2026, month: 6 });
  });

  it("pre-fills the amounts that apply to the chosen month", () => {
    const p = person({
      cleaningMode: "included",
      cleaningFee: "1000.00",
      allowances: [{ year: 2026, amount: "3000.00", mode: "lump", months: [3] }],
    });
    expect(expectedLines(p, p.allowances, 2026, 3, "salary")).toEqual({ basic: 15000, cleaning: 1000, ramadan: 3000, total: 19000 });
    expect(expectedLines(p, p.allowances, 2026, 4, "salary")).toEqual({ basic: 15000, cleaning: 1000, ramadan: 0, total: 16000 });
  });
});

describe("Checks before saving", () => {
  it("warns when the Salary Month is already paid for that staff member", () => {
    const p = person({ payments: [pay(2026, 2, "2026-11-14", { id: "feb" })] });
    const problem = checkSalaryMonth(p, "salary", 2026, 2);
    expect(problem?.code).toBe("already-paid");
    expect(problem?.paymentId).toBe("feb");
    expect(problemText(problem!)).toBe("Salary for Feb 2026 is already paid for ABDU RASAK K.");
    // The cleaning fee line is its own payment.
    expect(checkSalaryMonth(p, "cleaning", 2026, 2)).toBeNull();
    // Another staff member's payment does not clash.
    expect(checkSalaryMonth(person({ id: "m", name: "M" }), "salary", 2026, 2)).toBeNull();
  });

  it("refuses a Salary Month before joining or 'Count dues from', with a clear message", () => {
    const problem = checkSalaryMonth(person(), "salary", 2025, 12);
    expect(problem?.code).toBe("before-start");
    expect(problemText(problem!)).toContain("counts from Jan 2026");
    expect(checkSalaryMonth(person(), "salary", 2026, 1)).toBeNull();
    expect(checkSalaryMonth(person({ duesFrom: "2026-05-01" }), "salary", 2026, 4)?.code).toBe("before-start");
  });

  it("refuses a Salary Month after they were marked inactive, and allows the months before", () => {
    const left = person({ isActive: false, inactiveFrom: "2026-09-20" });
    expect(checkSalaryMonth(left, "salary", 2026, 9)).toBeNull();
    const problem = checkSalaryMonth(left, "salary", 2026, 10);
    expect(problem?.code).toBe("after-inactive");
    expect(problemText(problem!)).toBe("ABDU RASAK K was marked inactive in Sep 2026. Choose Sep 2026 or an earlier month.");
    expect(checkSalaryMonth(person({ isActive: false }), "salary", 2026, 2)?.code).toBe("inactive");
  });

  it("keeps an existing payment editable on its own month even if the dates changed since", () => {
    const p = person({ joiningDate: "2026-05-01", payments: [pay(2026, 2, "2026-02-28", { id: "old" })] });
    expect(checkSalaryMonth(p, "salary", 2026, 2, { id: "old", year: 2026, month: 2 })).toBeNull();
    expect(checkSalaryMonth(p, "salary", 2026, 3, { id: "old", year: 2026, month: 2 })?.code).toBe("before-start");
  });

  it("shows months outside the person's service as vacant", () => {
    const left = person({ isActive: false, inactiveFrom: "2026-09-20" });
    expect(isSalaryMonthOpen(left, 2026, 9)).toBe(true);
    expect(salaryCellStatus(left, false, 2026, 10, now)).toBe("vacant");
    expect(salaryCellStatus(left, false, 2026, 8, now)).toBe("due");
  });
});

describe("Dashboard pending by Salary Month", () => {
  it("clears February's due when February is paid in November, and November stays pending", () => {
    const before = salarySummary([person()], now);
    expect(before.pendingCount).toBe(11);
    expect(before.pendingAmount).toBe(165000);
    expect(before.thisMonthPending).toBe(15000);

    const after = salarySummary([person({ payments: [pay(2026, 2, "2026-11-14")] })], now);
    expect(after.pendingCount).toBe(10);
    expect(after.pendingAmount).toBe(150000);
    // Paid in November, but not for November.
    expect(after.paid).toBe(0);
    expect(after.thisMonthPending).toBe(15000);
    expect(after.thisMonthPendingCount).toBe(1);
  });

  it("counts this month as paid only for a November Salary Month", () => {
    const s = salarySummary([person({ payments: [pay(2026, 11, "2026-12-02")] })], now);
    expect(s.paid).toBe(15000);
    expect(s.thisMonthPending).toBe(0);
    expect(s.pendingCount).toBe(10);
  });

  it("counts someone inactive only up to the month they were marked inactive", () => {
    const s = salarySummary([person({ isActive: false, inactiveFrom: "2026-03-15" })], now);
    expect(s.pendingCount).toBe(3);
    expect(s.thisMonthPendingCount).toBe(0);
  });
});
