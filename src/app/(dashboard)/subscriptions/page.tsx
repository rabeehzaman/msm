import { getActiveAccounts } from "@/lib/queries/accounts";
import { getSubscriptionBook } from "@/lib/queries/collections";
import { getHouseholds } from "@/lib/queries/households";
import { SubscriptionsClient } from "./client";

export const dynamic = "force-dynamic";

export default async function SubscriptionsPage() {
  const [book, households, accounts] = await Promise.all([getSubscriptionBook(), getHouseholds(), getActiveAccounts()]);
  return (
    <SubscriptionsClient
      book={book}
      households={households.map((h) => ({ id: h.id, label: `${h.houseNumber} ${h.familyName}` }))}
      accounts={accounts}
    />
  );
}
