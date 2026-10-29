import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/empty-state";
import { Plus, Building2, Package, Wrench, IndianRupee } from "lucide-react";

export default function AssetsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Assets & Property</h1>
          <p className="page-subtitle">Manage properties, assets, inventory, and rentals</p>
        </div>
        <Button disabled title="Asset creation is not configured yet"><Plus /> Add Asset</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="flex items-center gap-4"><div className="stat-icon stat-icon-lagoon"><Building2 className="size-5 text-blue-600" /></div><div><p className="text-muted-foreground text-sm">Properties</p><p className="font-heading text-[1.75rem] leading-tight font-semibold tracking-tight">0</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-4"><div className="stat-icon"><Package className="text-muted-foreground size-5" /></div><div><p className="text-muted-foreground text-sm">Asset Items</p><p className="font-heading text-[1.75rem] leading-tight font-semibold tracking-tight">0</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-4"><div className="stat-icon"><IndianRupee className="text-muted-foreground size-5" /></div><div><p className="text-muted-foreground text-sm">Rental Income (MTD)</p><p className="font-heading text-[1.75rem] leading-tight font-semibold tracking-tight">Rs. 0</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-4"><div className="stat-icon"><Wrench className="text-muted-foreground size-5" /></div><div><p className="text-muted-foreground text-sm">Maintenance Due</p><p className="font-heading text-[1.75rem] leading-tight font-semibold tracking-tight">0</p></div></CardContent></Card>
      </div>

      <Tabs defaultValue="properties">
        <TabsList>
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="assets">Assets & Inventory</TabsTrigger>
        </TabsList>

        <TabsContent value="properties">
          <Card>
            <CardHeader><CardTitle>Property Register</CardTitle><CardDescription>All Mahallu-owned properties and Waqf assets</CardDescription></CardHeader>
            <CardContent>
              <EmptyState message="No properties yet." />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assets">
          <Card>
            <CardHeader><CardTitle>Asset Register</CardTitle><CardDescription>All physical assets with condition tracking</CardDescription></CardHeader>
            <CardContent>
              <EmptyState message="No assets yet." />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
