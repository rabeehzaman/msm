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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assets & Property</h1>
          <p className="text-muted-foreground">Manage properties, assets, inventory, and rentals</p>
        </div>
        <Button disabled title="Asset creation is not configured yet"><Plus /> Add Asset</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="flex items-center gap-4 pt-6"><div className="flex size-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30"><Building2 className="size-5 text-blue-600" /></div><div><p className="text-muted-foreground text-sm">Properties</p><p className="text-2xl font-bold">0</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 pt-6"><div className="bg-muted flex size-10 items-center justify-center rounded-lg"><Package className="text-muted-foreground size-5" /></div><div><p className="text-muted-foreground text-sm">Asset Items</p><p className="text-2xl font-bold">0</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 pt-6"><div className="bg-muted flex size-10 items-center justify-center rounded-lg"><IndianRupee className="text-muted-foreground size-5" /></div><div><p className="text-muted-foreground text-sm">Rental Income (MTD)</p><p className="text-2xl font-bold">Rs. 0</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 pt-6"><div className="bg-muted flex size-10 items-center justify-center rounded-lg"><Wrench className="text-muted-foreground size-5" /></div><div><p className="text-muted-foreground text-sm">Maintenance Due</p><p className="text-2xl font-bold">0</p></div></CardContent></Card>
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
