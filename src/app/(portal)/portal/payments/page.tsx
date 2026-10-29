import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";

export default function PortalPaymentsPage() {
  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4">
      <h1 className="font-heading text-[1.75rem] leading-tight font-semibold tracking-tight">Payments</h1>
      <Card>
        <CardContent>
          <EmptyState message="No payment records yet." />
        </CardContent>
      </Card>
    </div>
  );
}
