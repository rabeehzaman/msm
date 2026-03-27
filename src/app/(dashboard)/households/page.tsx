import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Download, Filter } from "lucide-react";

const households = [
  {
    id: "1",
    houseNumber: "MH-001",
    familyName: "Rahman",
    ward: "Ward 1 - Juma Masjid",
    head: "Abdul Rahman K",
    members: 6,
    phone: "+91 94567 12345",
    status: "active" as const,
    subscription: "Paid",
  },
  {
    id: "2",
    houseNumber: "MH-002",
    familyName: "Basheer",
    ward: "Ward 1 - Juma Masjid",
    head: "Mohammed Basheer",
    members: 4,
    phone: "+91 98765 43210",
    status: "active" as const,
    subscription: "Overdue",
  },
  {
    id: "3",
    houseNumber: "MH-003",
    familyName: "Kunju Mohammed",
    ward: "Ward 2 - Maidan",
    head: "Kunju Mohammed P",
    members: 8,
    phone: "+91 90123 45678",
    status: "active" as const,
    subscription: "Paid",
  },
  {
    id: "4",
    houseNumber: "MH-004",
    familyName: "Siddique",
    ward: "Ward 2 - Maidan",
    head: "Siddique Ali",
    members: 3,
    phone: "+91 87654 32109",
    status: "inactive" as const,
    subscription: "N/A",
  },
  {
    id: "5",
    houseNumber: "MH-005",
    familyName: "Haris",
    ward: "Ward 3 - Palliyara",
    head: "Haris P K",
    members: 5,
    phone: "+91 94561 78901",
    status: "active" as const,
    subscription: "Paid",
  },
  {
    id: "6",
    houseNumber: "MH-006",
    familyName: "Aslam",
    ward: "Ward 3 - Palliyara",
    head: "Aslam K M",
    members: 7,
    phone: "+91 90876 54321",
    status: "active" as const,
    subscription: "Overdue",
  },
];

const statusColors = {
  active: "default" as const,
  inactive: "secondary" as const,
  suspended: "destructive" as const,
  transferred: "outline" as const,
};

export default function HouseholdsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Households</h1>
          <p className="text-muted-foreground">
            Manage all registered families in the Mahallu
          </p>
        </div>
        <Button>
          <Plus />
          Add Household
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Total Households", value: "1,284" },
          { label: "Active", value: "1,198" },
          { label: "This Month", value: "+12" },
          { label: "Subscription Overdue", value: "156" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-sm">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Household Directory</CardTitle>
              <CardDescription>
                Browse and manage all registered households
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="size-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-4 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
              <Input placeholder="Search by name, house number, or phone..." className="pl-9" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[150px]">
                <Filter className="mr-2 size-4" />
                <SelectValue placeholder="Ward" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Wards</SelectItem>
                <SelectItem value="ward1">Ward 1</SelectItem>
                <SelectItem value="ward2">Ward 2</SelectItem>
                <SelectItem value="ward3">Ward 3</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Data Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>House #</TableHead>
                  <TableHead>Family Name</TableHead>
                  <TableHead>Head of Family</TableHead>
                  <TableHead>Ward</TableHead>
                  <TableHead className="text-center">Members</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {households.map((household) => (
                  <TableRow key={household.id} className="cursor-pointer">
                    <TableCell className="font-medium">
                      {household.houseNumber}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {household.familyName}
                    </TableCell>
                    <TableCell>{household.head}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {household.ward}
                    </TableCell>
                    <TableCell className="text-center">
                      {household.members}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {household.phone}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          household.subscription === "Paid"
                            ? "default"
                            : household.subscription === "Overdue"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {household.subscription}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColors[household.status]}>
                        {household.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
