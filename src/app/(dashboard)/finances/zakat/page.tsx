"use client";

import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Calculator, IndianRupee, Users, Heart } from "lucide-react";

const asnafCategories = [
  { name: "Al-Fuqara (The Poor)", arabic: "الفقراء", count: 28, disbursed: 84000 },
  { name: "Al-Masakin (The Needy)", arabic: "المساكين", count: 22, disbursed: 66000 },
  { name: "Al-Amil (Zakat Workers)", arabic: "العاملين عليها", count: 3, disbursed: 15000 },
  { name: "Al-Muallaf (New Muslims)", arabic: "المؤلفة قلوبهم", count: 2, disbursed: 10000 },
  { name: "Ar-Riqab (Freeing Captives)", arabic: "الرقاب", count: 0, disbursed: 0 },
  { name: "Al-Gharimin (Debtors)", arabic: "الغارمين", count: 8, disbursed: 40000 },
  { name: "Fi Sabilillah (In God's Cause)", arabic: "في سبيل الله", count: 5, disbursed: 25000 },
  { name: "Ibn Al-Sabil (Travelers)", arabic: "ابن السبيل", count: 1, disbursed: 5000 },
];

const distributions = [
  { id: "ZD-001", recipient: "Fathima Beevi", house: "MH-023", category: "Al-Fuqara", amount: 5000, date: "2025-03-20", fy: "2024-25" },
  { id: "ZD-002", recipient: "Ibrahim K", house: "MH-089", category: "Al-Gharimin", amount: 10000, date: "2025-03-15", fy: "2024-25" },
  { id: "ZD-003", recipient: "Ayisha M", house: "MH-034", category: "Al-Masakin", amount: 3000, date: "2025-03-10", fy: "2024-25" },
  { id: "ZD-004", recipient: "Rashid Ali", house: "MH-102", category: "Al-Fuqara", amount: 5000, date: "2025-03-05", fy: "2024-25" },
  { id: "ZD-005", recipient: "Najeeb P", house: "MH-056", category: "Al-Gharimin", amount: 8000, date: "2025-02-28", fy: "2024-25" },
];

const totalCollected = 385000;
const totalDisbursed = 245000;

export default function ZakatPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Zakat Management</h1>
          <p className="text-muted-foreground">Collection, Nisab calculation, and 8-category distribution</p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger render={<Button variant="outline" />}><Calculator /> Nisab Calculator</DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Zakat Nisab Calculator</DialogTitle>
                <DialogDescription>Calculate Zakat obligation based on wealth</DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Calculation Standard</label>
                  <Select defaultValue="gold">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gold">Gold Standard (87.48g)</SelectItem>
                      <SelectItem value="silver">Silver Standard (612g)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Cash & Bank Balance</label>
                    <Input type="number" placeholder="0" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Gold Value (Rs.)</label>
                    <Input type="number" placeholder="0" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Silver Value (Rs.)</label>
                    <Input type="number" placeholder="0" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Investments</label>
                    <Input type="number" placeholder="0" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Business Stock</label>
                    <Input type="number" placeholder="0" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Debts Owed to You</label>
                    <Input type="number" placeholder="0" />
                  </div>
                </div>
                <Separator />
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Minus: Liabilities / Debts You Owe</label>
                  <Input type="number" placeholder="0" />
                </div>
                <div className="rounded-lg bg-green-50 p-4 dark:bg-green-950/20">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Net Zakatable Wealth</span>
                    <span className="text-lg font-bold">Rs. 0</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-medium">Zakat Due (2.5%)</span>
                    <span className="text-xl font-bold text-green-600">Rs. 0</span>
                  </div>
                </div>
              </div>
              <DialogFooter><Button variant="outline">Close</Button></DialogFooter>
            </DialogContent>
          </Dialog>
          <Button><Plus /> Record Distribution</Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Total Collected (FY)</p>
            <p className="text-2xl font-bold">Rs. {totalCollected.toLocaleString("en-IN")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Total Disbursed</p>
            <p className="text-2xl font-bold text-green-600">Rs. {totalDisbursed.toLocaleString("en-IN")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Available Balance</p>
            <p className="text-2xl font-bold">Rs. {(totalCollected - totalDisbursed).toLocaleString("en-IN")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Beneficiaries</p>
            <p className="text-2xl font-bold">69</p>
          </CardContent>
        </Card>
      </div>

      {/* Utilization Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="mb-2 flex items-center justify-between"><span className="text-sm font-medium">Zakat Utilization</span><span className="text-sm font-medium">{((totalDisbursed/totalCollected)*100).toFixed(1)}%</span></div>
          <Progress value={(totalDisbursed/totalCollected)*100} className="h-3" />
          <p className="text-muted-foreground mt-1 text-xs">Rs. {(totalCollected - totalDisbursed).toLocaleString("en-IN")} remaining to be distributed</p>
        </CardContent>
      </Card>

      {/* 8 Asnaf Categories */}
      <Card>
        <CardHeader><CardTitle>8 Asnaf Categories (Eligible Recipients)</CardTitle><CardDescription>Zakat distribution must follow Quranic categories</CardDescription></CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {asnafCategories.map(cat => (
              <div key={cat.name} className="rounded-lg border p-4">
                <p className="text-xs text-muted-foreground">{cat.arabic}</p>
                <p className="text-sm font-semibold">{cat.name}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-muted-foreground text-xs">{cat.count} recipients</span>
                  <span className="text-sm font-bold">Rs. {cat.disbursed.toLocaleString("en-IN")}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Distribution Table */}
      <Card>
        <CardHeader><CardTitle>Distribution Register</CardTitle><CardDescription>All Zakat disbursements with recipient and category tracking</CardDescription></CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader><TableRow>
                <TableHead>ID</TableHead><TableHead>Recipient</TableHead><TableHead>House</TableHead><TableHead>Category</TableHead><TableHead>Date</TableHead><TableHead>FY</TableHead><TableHead className="text-right">Amount</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {distributions.map(d => (
                  <TableRow key={d.id}>
                    <TableCell className="font-mono text-sm">{d.id}</TableCell>
                    <TableCell className="font-medium">{d.recipient}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{d.house}</TableCell>
                    <TableCell><Badge variant="outline">{d.category}</Badge></TableCell>
                    <TableCell className="text-muted-foreground text-sm">{new Date(d.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{d.fy}</TableCell>
                    <TableCell className="text-right font-medium text-green-600">Rs. {d.amount.toLocaleString("en-IN")}</TableCell>
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
