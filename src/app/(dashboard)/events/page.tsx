import { getEvents } from "@/lib/queries/lifecycle";
import { EventsClient } from "./client";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const events = await getEvents();

  return <EventsClient events={events} />;
}
