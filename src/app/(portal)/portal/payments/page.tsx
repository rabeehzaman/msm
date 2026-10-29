import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";

export default function PortalPaymentsPage() {
  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4">
      <h1 className="text-2xl font-bold">Payments</h1>
      <Card>
        <CardContent>
          <EmptyState message="No payment records yet." />
        </CardContent>
      </Card>
    </div>
  );
}
