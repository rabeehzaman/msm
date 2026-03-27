import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { IndianRupee, Download, CheckCircle2, Clock, ArrowUpRight } from "lucide-react";

const transactions = [
  { id: "REC-2451", type: "Subscription", period: "March 2025", amount: 500, date: "2025-03-01", status: "paid", method: "UPI" },
  { id: "REC-2432", type: "Subscription", period: "February 2025", amount: 500, date: "2025-02-01", status: "paid", method: "Cash" },
  { id: "REC-2418", type: "Donation", period: "Building Fund", amount: 5000, date: "2025-01-20", status: "paid", method: "Bank Transfer" },
  { id: "REC-2405", type: "Subscription", period: "January 2025", amount: 500, date: "2025-01-02", status: "paid", method: "UPI" },
  { id: "REC-2390", type: "Madrasa Fee", period: "Jan-Mar 2025", amount: 4500, date: "2025-01-01", status: "paid", method: "Cash" },
  { id: "REC-2378", type: "Subscription", period: "December 2024", amount: 500, date: "2024-12-01", status: "paid", method: "UPI" },
  { id: "REC-2355", type: "Zakat", period: "Ramadan 2024", amount: 25000, date: "2024-03-15", status: "paid", method: "Bank Transfer" },
];

export default function PaymentsPage() {
  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4">
      <h1 className="text-2xl font-bold">Payments</h1>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-green-700 dark:text-green-300">Total Paid (FY)</p>
            <p className="text-xl font-bold text-green-700 dark:text-green-300">Rs. 36,500</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-muted-foreground text-xs">Outstanding</p>
            <p className="text-xl font-bold">Rs. 0</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Pay */}
      <Card>
        <CardContent className="flex items-center justify-between pt-6">
          <div>
            <p className="text-muted-foreground text-sm">Next subscription due</p>
            <p className="text-lg font-bold">Rs. 500 - April 2025</p>
          </div>
          <Button><IndianRupee className="size-4" /> Pay</Button>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Payment History</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-1">
          {transactions.map((tx, i) => (
            <div key={tx.id}>
              {i > 0 && <Separator className="my-1" />}
              <div className="flex items-center gap-3 py-2">
                <div className="flex size-9 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <CheckCircle2 className="size-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{tx.type}</p>
                    <Badge variant="outline" className="text-xs">{tx.method}</Badge>
                  </div>
                  <p className="text-muted-foreground text-xs">{tx.period} | {new Date(tx.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">Rs. {tx.amount.toLocaleString("en-IN")}</p>
                  <button className="text-primary flex items-center gap-1 text-xs"><Download className="size-3" /> Receipt</button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
