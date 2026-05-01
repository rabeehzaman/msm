import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Plus, Clock, CheckCircle2, FileText } from "lucide-react";

const applications = [
  {
    id: "WF-2025-018",
    scheme: "Medical Aid",
    amount: 5000,
    date: "2025-03-18",
    status: "under_review",
  },
  {
    id: "WF-2024-122",
    scheme: "Education Scholarship",
    amount: 10000,
    date: "2024-11-10",
    status: "approved",
  },
];

const schemes = [
  "Medical Aid",
  "Education Scholarship",
  "Marriage Assistance",
  "Orphan Sponsorship",
  "Widow Pension",
];

export default function PortalWelfarePage() {
  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Welfare</h1>
        <Button size="sm" disabled title="Portal welfare applications are not configured yet">
          <Plus className="size-4" /> Apply
        </Button>
      </div>

      <Card className="border-pink-200 bg-pink-50 dark:border-pink-800 dark:bg-pink-950/20">
        <CardContent className="flex items-center gap-3 pt-4 pb-4">
          <div className="flex size-10 items-center justify-center rounded-full bg-pink-100 dark:bg-pink-900/40">
            <Heart className="size-5 text-pink-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-pink-800 dark:text-pink-200">Community support desk</p>
            <p className="text-xs text-pink-700 dark:text-pink-300">Contact the Mahallu office to submit new requests.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">My Applications</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-2">
          {applications.map((application) => (
            <div key={application.id} className="flex items-center gap-3 rounded-lg border p-3">
              <div className="flex size-9 items-center justify-center rounded-full bg-muted">
                {application.status === "approved" ? (
                  <CheckCircle2 className="size-4 text-green-600" />
                ) : (
                  <Clock className="size-4 text-yellow-600" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{application.scheme}</p>
                <p className="text-muted-foreground text-xs">
                  {application.id} | Rs. {application.amount.toLocaleString("en-IN")} | {new Date(application.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                </p>
              </div>
              <Badge variant={application.status === "approved" ? "default" : "secondary"} className="text-xs">
                {application.status === "approved" ? "Approved" : "Under Review"}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Available Schemes</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-2">
          {schemes.map((scheme) => (
            <div key={scheme} className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <FileText className="text-muted-foreground size-4" />
                <span className="text-sm font-medium">{scheme}</span>
              </div>
              <Button variant="outline" size="sm" disabled title="Portal welfare applications are not configured yet">Apply</Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
