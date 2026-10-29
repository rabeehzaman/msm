import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";

export default function PortalAnnouncementsPage() {
  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4">
      <h1 className="text-2xl font-bold">Announcements</h1>
      <Card>
        <CardContent>
          <EmptyState message="No announcements yet." />
        </CardContent>
      </Card>
    </div>
  );
}
