import { ml } from "./ml";

export type Lang = "en" | "ml";

// The English text is the key, so a missing translation simply shows English.
export function translate(lang: Lang, text: string, vars?: Record<string, string | number>) {
  let out = lang === "ml" ? (ml[text] ?? text) : text;
  if (vars) for (const [k, v] of Object.entries(vars)) out = out.replaceAll(`{${k}}`, String(v));
  return out;
}
