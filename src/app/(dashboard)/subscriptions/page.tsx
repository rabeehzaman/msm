import { getSubscriptions } from "@/lib/queries/finance";
import { SubscriptionsClient } from "./client";

export const dynamic = "force-dynamic";

export default async function SubscriptionsPage() {
  const subscriptions = await getSubscriptions();

  return <SubscriptionsClient subscriptions={subscriptions} />;
}
