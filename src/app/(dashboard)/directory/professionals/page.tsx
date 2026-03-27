import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Phone, Briefcase, Plus } from "lucide-react";

const professionals = [
  { name: "Dr. Ahmed K", profession: "Doctor", specialization: "General Medicine", business: "Ahmed Clinic", ward: "Ward 1", phone: "+91 94567 11111", available: true },
  { name: "Adv. Rashid M", profession: "Lawyer", specialization: "Civil Law", business: "Rashid & Associates", ward: "Ward 2", phone: "+91 94567 22222", available: true },
  { name: "Mohammed Basheer", profession: "Teacher", specialization: "Mathematics", business: "Govt. School", ward: "Ward 1", phone: "+91 94567 33333", available: true },
  { name: "Haris P K", profession: "Electrician", specialization: "Home Wiring", business: "Haris Electrical", ward: "Ward 3", phone: "+91 94567 44444", available: true },
  { name: "Aslam K M", profession: "Plumber", specialization: "Sanitary", business: "-", ward: "Ward 3", phone: "+91 94567 55555", available: false },
  { name: "Faizal P", profession: "Carpenter", specialization: "Furniture", business: "Faizal Wood Works", ward: "Ward 5", phone: "+91 94567 66666", available: true },
  { name: "Ibrahim Ali", profession: "Auto Driver", specialization: "Local Transport", business: "-", ward: "Ward 6", phone: "+91 94567 77777", available: true },
  { name: "Najeeb K", profession: "Tailor", specialization: "Men's Wear", business: "Najeeb Tailors", ward: "Ward 4", phone: "+91 94567 88888", available: true },
  { name: "Siddique M", profession: "Mechanic", specialization: "Two Wheeler", business: "SM Motors", ward: "Ward 7", phone: "+91 94567 99999", available: true },
  { name: "Ashraf K", profession: "Photographer", specialization: "Events", business: "Ashraf Studio", ward: "Ward 8", phone: "+91 94567 00000", available: true },
];

function getInitials(name: string) { return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase(); }

export default function ProfessionalsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Professional Directory</h1>
          <p className="text-muted-foreground">Community members&apos; skills and business services</p>
        </div>
        <Button><Plus /> Add Listing</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Total Listings</p><p className="text-2xl font-bold">324</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Professions</p><p className="text-2xl font-bold">48</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Businesses</p><p className="text-2xl font-bold">156</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Directory</CardTitle><CardDescription>Search community professionals and services</CardDescription></CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-4">
            <div className="relative flex-1"><Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" /><Input placeholder="Search by name, profession, or skill..." className="pl-9" /></div>
            <Select defaultValue="all"><SelectTrigger className="w-[180px]"><SelectValue placeholder="Profession" /></SelectTrigger><SelectContent><SelectItem value="all">All Professions</SelectItem><SelectItem value="doctor">Doctor</SelectItem><SelectItem value="lawyer">Lawyer</SelectItem><SelectItem value="teacher">Teacher</SelectItem><SelectItem value="electrician">Electrician</SelectItem><SelectItem value="plumber">Plumber</SelectItem></SelectContent></Select>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {professionals.map(p => (
              <div key={p.name} className="flex items-center gap-4 rounded-lg border p-4">
                <Avatar className="size-10"><AvatarFallback className="text-xs">{getInitials(p.name)}</AvatarFallback></Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{p.name}</span>
                    <Badge variant={p.available ? "default" : "secondary"} className="text-xs">{p.available ? "Available" : "Busy"}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm"><Briefcase className="text-muted-foreground size-3" /><span className="text-primary">{p.profession}</span><span className="text-muted-foreground">- {p.specialization}</span></div>
                  {p.business !== "-" && <p className="text-muted-foreground text-xs">{p.business} | {p.ward}</p>}
                </div>
                <Button variant="ghost" size="sm"><Phone className="size-4" /></Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
