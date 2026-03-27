import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileText, Download, Plus, Clock, CheckCircle2 } from "lucide-react";

const myCertificates = [
  { id: "CC-2025-045", type: "Character Certificate", date: "2025-03-20", status: "delivered" },
  { id: "MC-2025-012", type: "Membership Certificate", date: "2025-02-15", status: "delivered" },
  { id: "NK-2024-008", type: "Nikah Certificate", date: "2024-09-10", status: "delivered" },
];

const pendingRequests = [
  { id: "REQ-234", type: "Clearance Certificate", date: "2025-03-25", status: "under_review" },
];

const availableCertificates = [
  "Character Certificate",
  "Membership Certificate",
  "Clearance Certificate",
  "NOC (Transfer)",
  "Property Certificate",
];

export default function PortalCertificatesPage() {
  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Certificates</h1>
        <Button size="sm"><Plus className="size-4" /> Request</Button>
      </div>

      {/* Pending */}
      {pendingRequests.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20">
          <CardHeader className="pb-2"><CardTitle className="text-base">Pending Requests</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-2">
            {pendingRequests.map(r => (
              <div key={r.id} className="flex items-center gap-3">
                <Clock className="size-5 text-yellow-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{r.type}</p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300">Requested {new Date(r.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</p>
                </div>
                <Badge variant="secondary">Under Review</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Issued Certificates */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">My Certificates</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-1">
          {myCertificates.map((cert, i) => (
            <div key={cert.id}>
              {i > 0 && <Separator className="my-1" />}
              <div className="flex items-center gap-3 py-2">
                <div className="flex size-9 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <FileText className="size-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{cert.type}</p>
                  <p className="text-muted-foreground text-xs">
                    {cert.id} | {new Date(cert.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </p>
                </div>
                <Button variant="ghost" size="sm"><Download className="size-4" /></Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Request New */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Request a Certificate</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-2">
          {availableCertificates.map(type => (
            <div key={type} className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <FileText className="text-muted-foreground size-4" />
                <span className="text-sm font-medium">{type}</span>
              </div>
              <Button variant="outline" size="sm">Request</Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
