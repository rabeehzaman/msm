import { and, eq } from "drizzle-orm";
import { expenseEntries } from "@/db/schema";
import type { Actor } from "@/lib/auth/guard";
import { fundIdByName } from "./funds";
import { nextReceiptNumber, postLedger, removeLedger, type Tx } from "./ledger";

// Bills and maintenance post through here, so paying one needs no second entry.
export async function postExpense(
  tx: Tx,
  actor: Actor,
  input: {
    date: string;
    amount: string;
    payee: string;
    category: string;
    categoryId?: string | null;
    accountId: string;
    description?: string | null;
    fundId?: string | null;
    sourceType?: string;
    sourceId?: string;
  },
) {
  const voucherNumber = await nextReceiptNumber(tx, actor.tenantId, "EXP");
  const fundId = input.fundId ?? (await fundIdByName(tx, actor.tenantId, "General Fund"));
  const [row] = await tx
    .insert(expenseEntries)
    .values({
      tenantId: actor.tenantId,
      fundId: fundId!,
      voucherNumber,
      amount: input.amount,
      payee: input.payee,
      category: input.category,
      categoryId: input.categoryId ?? null,
      description: input.description ?? null,
      status: "paid",
      date: input.date,
      accountId: input.accountId,
      sourceType: input.sourceType ?? null,
      sourceId: input.sourceId ?? null,
      createdBy: actor.userId,
    })
    .returning({ id: expenseEntries.id });
  await postLedger(tx, actor, {
    accountId: input.accountId,
    date: input.date,
    direction: "out",
    kind: "expense",
    amount: input.amount,
    sourceType: "expense",
    sourceId: row.id,
    category: input.category,
    fundId,
    party: input.payee,
    receiptNumber: voucherNumber,
    note: input.description,
  });
  return row.id;
}

export async function removePostedExpense(tx: Tx, tenantId: string, expenseId: string) {
  await removeLedger(tx, "expense", expenseId);
  await tx.delete(expenseEntries).where(and(eq(expenseEntries.id, expenseId), eq(expenseEntries.tenantId, tenantId)));
}
