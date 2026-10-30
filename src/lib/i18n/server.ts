import { cookies } from "next/headers";
import type { Lang } from "./translate";

export async function getLang(): Promise<Lang> {
  const store = await cookies();
  return store.get("lang")?.value === "ml" ? "ml" : "en";
}
