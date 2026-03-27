import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  Home,
  Wallet,
  GraduationCap,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Clock,
} from "lucide-react";

const stats = [
  {
    title: "Total Households",
    value: "1,284",
    change: "+12",
    trend: "up" as const,
    period: "this month",
    icon: Home,
  },
  {
    title: "Total Members",
    value: "5,432",
    change: "+48",
    trend: "up" as const,
    period: "this month",
    icon: Users,
  },
  {
    title: "Collection Rate",
    value: "87.3%",
    change: "+2.1%",
    trend: "up" as const,
    period: "vs last month",
    icon: Wallet,
  },
  {
    title: "Madrasa Students",
    value: "892",
    change: "-3",
    trend: "down" as const,
    period: "this month",
    icon: GraduationCap,
  },
];

const pendingApprovals = [
  { type: "Certificate Request", count: 5, urgency: "normal" },
  { type: "Welfare Application", count: 3, urgency: "high" },
  { type: "Marriage NOC", count: 2, urgency: "normal" },
  { type: "Expense Approval", count: 8, urgency: "high" },
  { type: "New Registration", count: 4, urgency: "normal" },
];

const recentActivity = [
  {
    action: "New household registered",
    detail: "House #1285 - Rahman Family",
    time: "2 min ago",
  },
  {
    action: "Subscription payment received",
    detail: "House #456 - Rs. 500",
    time: "15 min ago",
  },
  {
    action: "Friday collection completed",
    detail: "Total: Rs. 45,230",
    time: "1 hour ago",
  },
  {
    action: "Death certificate issued",
    detail: "Certificate #DC-2024-089",
    time: "3 hours ago",
  },
  {
    action: "Madrasa attendance marked",
    detail: "Class 5 - 32/35 present",
    time: "5 hours ago",
  },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back. Here&apos;s an overview of your Mahallu.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="text-muted-foreground size-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-muted-foreground flex items-center gap-1 text-xs">
                {stat.trend === "up" ? (
                  <TrendingUp className="size-3 text-green-500" />
                ) : (
                  <TrendingDown className="size-3 text-red-500" />
                )}
                <span
                  className={
                    stat.trend === "up" ? "text-green-500" : "text-red-500"
                  }
                >
                  {stat.change}
                </span>
                <span>{stat.period}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Two column layout */}
      <div className="grid gap-4 lg:grid-cols-7">
        {/* Pending Approvals */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
            <CardDescription>
              Items requiring your attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {pendingApprovals.map((item) => (
                <div
                  key={item.type}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-muted flex size-8 items-center justify-center rounded-lg">
                      <Clock className="size-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        item.urgency === "high" ? "destructive" : "secondary"
                      }
                    >
                      {item.count}
                    </Badge>
                    <ArrowUpRight className="text-muted-foreground size-4" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {recentActivity.map((activity, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="bg-primary/10 mt-0.5 flex size-2 rounded-full" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-muted-foreground text-xs">
                      {activity.detail}
                    </p>
                  </div>
                  <span className="text-muted-foreground whitespace-nowrap text-xs">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fund Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Fund Overview</CardTitle>
          <CardDescription>
            Current balance across all fund types
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { name: "General Fund", balance: "Rs. 4,52,300", pct: 65 },
              { name: "Zakat Fund", balance: "Rs. 2,18,500", pct: 45 },
              { name: "Madrasa Fund", balance: "Rs. 1,85,200", pct: 72 },
              { name: "Building Fund", balance: "Rs. 8,34,100", pct: 28 },
            ].map((fund) => (
              <div key={fund.name} className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{fund.name}</span>
                  <span className="text-muted-foreground text-xs">
                    {fund.pct}% utilized
                  </span>
                </div>
                <span className="text-lg font-bold">{fund.balance}</span>
                <Progress value={fund.pct} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
