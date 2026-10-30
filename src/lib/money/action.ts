// Server actions return this instead of throwing, because Next.js hides thrown
// messages in production and the person at the screen needs to see the reason.
export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string; needsConfirm?: boolean };

// A problem the person can act on. Its message is shown on screen.
export class UserError extends Error {
  constructor(message: string, public needsConfirm = false) {
    super(message);
  }
}

export async function run<T>(fn: () => Promise<T>, onDuplicate?: string): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (e) {
    if (e instanceof UserError) return { ok: false, error: e.message, needsConfirm: e.needsConfirm };
    const code = (e as { code?: string; cause?: { code?: string } }).code ?? (e as { cause?: { code?: string } }).cause?.code;
    if (code === "23505" && onDuplicate) return { ok: false, error: onDuplicate };
    console.error("Action failed", e);
    return { ok: false, error: "Something went wrong. Nothing was saved." };
  }
}

export function parseAmount(value: FormDataEntryValue | string | number | null | undefined, label = "Amount") {
  const text = String(value ?? "").trim();
  if (!/^\d{1,12}(\.\d{1,2})?$/.test(text) || Number(text) <= 0) {
    throw new UserError(`${label} must be more than zero.`);
  }
  return Number(text).toFixed(2);
}

// Like parseAmount but zero or blank is allowed.
export function parseOptionalAmount(value: FormDataEntryValue | string | number | null | undefined, label = "Amount") {
  const text = String(value ?? "").trim();
  if (!text) return "0.00";
  if (!/^\d{1,12}(\.\d{1,2})?$/.test(text)) throw new UserError(`${label} is not a valid amount.`);
  return Number(text).toFixed(2);
}

export function parseDate(value: FormDataEntryValue | string | null | undefined) {
  const text = String(value ?? "").trim();
  const d = new Date(`${text}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text) || Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== text) {
    throw new UserError("Please enter a valid date.");
  }
  return text;
}

export function parseOptionalDate(value: FormDataEntryValue | string | null | undefined) {
  const text = String(value ?? "").trim();
  return text ? parseDate(text) : null;
}

export function text(value: FormDataEntryValue | null | undefined) {
  const s = String(value ?? "").trim();
  return s || null;
}

export function requiredText(value: FormDataEntryValue | null | undefined, label: string) {
  const s = text(value);
  if (!s) throw new UserError(`${label} is required.`);
  return s;
}

export function parseId(value: FormDataEntryValue | string | null | undefined, label: string) {
  const s = String(value ?? "").trim();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)) {
    throw new UserError(`Please select ${label}.`);
  }
  return s;
}

export function parseYearMonth(yearValue: unknown, monthValue: unknown) {
  const year = Number(yearValue);
  const month = Number(monthValue);
  if (!Number.isInteger(year) || year < 2000 || year > 2100 || !Number.isInteger(month) || month < 1 || month > 12) {
    throw new UserError("Please select a valid month.");
  }
  return { year, month };
}
