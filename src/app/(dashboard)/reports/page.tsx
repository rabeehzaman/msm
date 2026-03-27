import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, BarChart3, FileText, Users, GraduationCap, Calendar, TrendingUp } from "lucide-react";

const reportCategories = [
  {
    title: "Financial Reports",
    icon: TrendingUp,
    count: 13,
    reports: [
      "Income & Expenditure Statement",
      "Balance Sheet",
      "Receipts & Payments Register",
      "Budget vs Actuals",
      "Subscription Arrears Aging",
      "Friday Collection Summary",
      "Fund Balance Report",
      "Donation Register",
      "Bank Reconciliation",
      "Zakat Collection & Distribution",
      "Expense Category Analysis",
      "Cash Flow Statement",
      "Fund-wise Income/Expense",
    ],
  },
  {
    title: "Member Reports",
    icon: Users,
    count: 5,
    reports: [
      "Complete Family Register",
      "New Registration Report",
      "Demographics Breakdown",
      "Dues Collection Analysis",
      "Member Engagement Report",
    ],
  },
  {
    title: "Madrasa Reports",
    icon: GraduationCap,
    count: 6,
    reports: [
      "Student Enrollment Register",
      "Attendance Report (Daily/Monthly/Term)",
      "Exam Results Summary",
      "Individual Student Progress",
      "Teacher Performance Report",
      "Class-wise Strength Report",
    ],
  },
  {
    title: "Operational Reports",
    icon: Calendar,
    count: 8,
    reports: [
      "Event Summary",
      "Welfare Disbursement Report",
      "Certificate Issuance Register",
      "Committee Meeting Minutes",
      "Sub-Committee Activity",
      "Volunteer Activity Log",
      "Asset/Property Inventory",
      "Maintenance Schedule",
    ],
  },
  {
    title: "Analytics",
    icon: BarChart3,
    count: 5,
    reports: [
      "Year-over-Year Comparison",
      "Collection Efficiency Trend",
      "Welfare Impact Assessment",
      "Community Growth Analysis",
      "Donor Retention Analysis",
    ],
  },
];

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">37+ standard reports across all modules</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        {reportCategories.map(cat => (
          <Card key={cat.title}>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="bg-primary/10 flex size-10 items-center justify-center rounded-lg">
                <cat.icon className="text-primary size-5" />
              </div>
              <div>
                <p className="text-sm font-medium">{cat.title}</p>
                <p className="text-muted-foreground text-xs">{cat.count} reports</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {reportCategories.map(cat => (
        <Card key={cat.title}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <cat.icon className="text-primary size-5" />
              <div>
                <CardTitle>{cat.title}</CardTitle>
                <CardDescription>{cat.count} available reports</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {cat.reports.map(report => (
                <div key={report} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <FileText className="text-muted-foreground size-4" />
                    <span className="text-sm font-medium">{report}</span>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
