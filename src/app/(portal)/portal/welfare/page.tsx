import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";

export default function PortalWelfarePage() {
  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4">
      <h1 className="text-2xl font-bold">Welfare</h1>
      <Card>
        <CardContent>
          <EmptyState message="No welfare applications yet." />
        </CardContent>
      </Card>
    </div>
  );
}
