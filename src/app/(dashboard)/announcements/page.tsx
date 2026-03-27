import { getAnnouncements } from "@/lib/queries/lifecycle";
import { AnnouncementsClient } from "./client";

export const dynamic = "force-dynamic";

export default async function AnnouncementsPage() {
  const announcements = await getAnnouncements();

  return <AnnouncementsClient announcements={announcements} />;
}
