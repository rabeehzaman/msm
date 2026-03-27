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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

const members = [
  {
    id: "1",
    name: "Abdul Rahman K",
    household: "MH-001 - Rahman",
    gender: "Male",
    age: 52,
    phone: "+91 94567 12345",
    bloodGroup: "O+",
    occupation: "Business",
    status: "active",
    role: "Head",
    isNri: false,
  },
  {
    id: "2",
    name: "Fathima Rahman",
    household: "MH-001 - Rahman",
    gender: "Female",
    age: 48,
    phone: "+91 94567 12346",
    bloodGroup: "A+",
    occupation: "Homemaker",
    status: "active",
    role: "Spouse",
    isNri: false,
  },
  {
    id: "3",
    name: "Mohammed Basheer",
    household: "MH-002 - Basheer",
    gender: "Male",
    age: 45,
    phone: "+91 98765 43210",
    bloodGroup: "B+",
    occupation: "Teacher",
    status: "active",
    role: "Head",
    isNri: false,
  },
  {
    id: "4",
    name: "Rashid Ali K",
    household: "MH-001 - Rahman",
    gender: "Male",
    age: 28,
    phone: "+91 55123 45678",
    bloodGroup: "O+",
    occupation: "Engineer",
    status: "nri",
    role: "Son",
    isNri: true,
  },
  {
    id: "5",
    name: "Kunju Mohammed P",
    household: "MH-003 - Kunju Mohammed",
    gender: "Male",
    age: 65,
    phone: "+91 90123 45678",
    bloodGroup: "AB+",
    occupation: "Retired",
    status: "active",
    role: "Head",
    isNri: false,
  },
  {
    id: "6",
    name: "Haris P K",
    household: "MH-005 - Haris",
    gender: "Male",
    age: 38,
    phone: "+91 94561 78901",
    bloodGroup: "A-",
    occupation: "Driver",
    status: "active",
    role: "Head",
    isNri: false,
  },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  inactive: "secondary",
  nri: "outline",
  deceased: "destructive",
};

export default function MembersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Members</h1>
          <p className="text-muted-foreground">
            View and manage all community members
          </p>
        </div>
        <Button>
          <Plus />
          Add Member
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        {[
          { label: "Total Members", value: "5,432" },
          { label: "Active", value: "4,891" },
          { label: "NRI", value: "423" },
          { label: "Senior Citizens", value: "312" },
          { label: "Blood Donors", value: "1,245" },
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
              <CardTitle>Member Directory</CardTitle>
              <CardDescription>
                Complete list of all registered members
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="size-4" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-4 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
              <Input
                placeholder="Search by name, phone, or Aadhaar..."
                className="pl-9"
              />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[150px]">
                <Filter className="mr-2 size-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="nri">NRI</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="deceased">Deceased</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Blood Group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Groups</SelectItem>
                <SelectItem value="a+">A+</SelectItem>
                <SelectItem value="a-">A-</SelectItem>
                <SelectItem value="b+">B+</SelectItem>
                <SelectItem value="b-">B-</SelectItem>
                <SelectItem value="o+">O+</SelectItem>
                <SelectItem value="o-">O-</SelectItem>
                <SelectItem value="ab+">AB+</SelectItem>
                <SelectItem value="ab-">AB-</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Data Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Household</TableHead>
                  <TableHead>Relation</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Blood</TableHead>
                  <TableHead>Occupation</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id} className="cursor-pointer">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarFallback className="text-xs">
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-muted-foreground text-xs">
                            {member.gender}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {member.household}
                    </TableCell>
                    <TableCell className="text-sm">{member.role}</TableCell>
                    <TableCell className="text-sm">{member.age}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        {member.bloodGroup}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {member.occupation}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {member.phone}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={statusVariants[member.status] || "secondary"}
                      >
                        {member.isNri ? "NRI" : member.status}
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
