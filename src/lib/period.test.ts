import { describe, expect, it } from "vitest";
import { parseDisplayDate, parsePeriod, pendingMonthsFor, periodProblem, resolvePeriod } from "./period";

const today = "2026-11-16"; // a Monday

describe("resolvePeriod", () => {
  const r = (preset: Parameters<typeof resolvePeriod>[0]) => {
    const { from, to } = resolvePeriod(preset, today);
    return [from, to];
  };
  it("quick periods end today", () => {
    expect(r({ preset: "today" })).toEqual(["2026-11-16", "2026-11-16"]);
    expect(r({ preset: "yesterday" })).toEqual(["2026-11-15", "2026-11-15"]);
    expect(r({ preset: "this-week" })).toEqual(["2026-11-16", "2026-11-16"]);
    expect(r({ preset: "this-month" })).toEqual(["2026-11-01", "2026-11-16"]);
    expect(r({ preset: "last-month" })).toEqual(["2026-10-01", "2026-10-31"]);
    expect(r({ preset: "this-fy" })).toEqual(["2026-04-01", "2026-11-16"]);
  });
  it("weeks start on Monday and the financial year on 1 April", () => {
    expect(resolvePeriod({ preset: "this-week" }, "2026-11-22")).toMatchObject({ from: "2026-11-16", to: "2026-11-22" });
    expect(resolvePeriod({ preset: "this-fy" }, "2027-02-10")).toMatchObject({ from: "2026-04-01" });
    expect(resolvePeriod({ preset: "last-month" }, "2026-01-05")).toMatchObject({ from: "2025-12-01", to: "2025-12-31" });
  });
  it("custom keeps its dates", () => {
    expect(resolvePeriod({ preset: "custom", from: "2026-10-01", to: "2026-10-31" }, today)).toEqual({
      preset: "custom",
      from: "2026-10-01",
      to: "2026-10-31",
      key: "custom:2026-10-01:2026-10-31",
    });
  });
});

describe("parsePeriod", () => {
  it("reads presets and custom ranges, and refuses anything else", () => {
    expect(parsePeriod("last-month")).toEqual({ preset: "last-month" });
    expect(parsePeriod("custom:2026-10-01:2026-10-01")).toEqual({ preset: "custom", from: "2026-10-01", to: "2026-10-01" });
    expect(parsePeriod("custom:2026-10-31:2026-10-01")).toBeNull();
    expect(parsePeriod("custom:2026-02-30:2026-03-01")).toBeNull();
    expect(parsePeriod("forever")).toBeNull();
    expect(parsePeriod(undefined)).toBeNull();
  });
});

describe("custom dates", () => {
  it("reads DD-MM-YYYY", () => {
    expect(parseDisplayDate("01-10-2026")).toBe("2026-10-01");
    expect(parseDisplayDate("1/10/2026")).toBe("2026-10-01");
    expect(parseDisplayDate("31-02-2026")).toBeNull();
    expect(parseDisplayDate("2026-10-01")).toBeNull();
  });
  it("refuses a From date after the To date", () => {
    expect(periodProblem("2026-10-02", "2026-10-01")).toBe("The From date cannot be after the To date.");
    expect(periodProblem("2026-10-01", "2026-10-01")).toBeNull();
  });
});

describe("pendingMonthsFor", () => {
  it("uses the To date's month for a period shorter than a month", () => {
    expect(pendingMonthsFor("2026-10-28", "2026-11-03")).toEqual([{ year: 2026, month: 11 }]);
    expect(pendingMonthsFor("2026-11-01", "2026-11-16")).toEqual([{ year: 2026, month: 11 }]);
    expect(pendingMonthsFor("2026-11-16", "2026-11-16")).toEqual([{ year: 2026, month: 11 }]);
  });
  it("uses every month a longer period touches", () => {
    expect(pendingMonthsFor("2026-10-01", "2026-10-31")).toEqual([{ year: 2026, month: 10 }]);
    expect(pendingMonthsFor("2026-10-15", "2026-11-20")).toEqual([
      { year: 2026, month: 10 },
      { year: 2026, month: 11 },
    ]);
    expect(pendingMonthsFor("2026-04-01", "2026-11-16")).toHaveLength(8);
    expect(pendingMonthsFor("2026-12-15", "2027-01-14")).toEqual([
      { year: 2026, month: 12 },
      { year: 2027, month: 1 },
    ]);
  });
});
