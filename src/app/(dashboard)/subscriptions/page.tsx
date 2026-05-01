import { getSubscriptions } from "@/lib/queries/finance";
import { getHouseholds } from "@/lib/queries/households";
import { SubscriptionsClient } from "./client";

export const dynamic = "force-dynamic";

export default async function SubscriptionsPage() {
  const [subscriptions, households] = await Promise.all([
    getSubscriptions(),
    getHouseholds(),
  ]);

  return <SubscriptionsClient subscriptions={subscriptions} households={households} />;
}
