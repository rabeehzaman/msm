import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Building2, Package, Wrench, IndianRupee } from "lucide-react";

const properties = [
  { id: "P-001", name: "Masjid Main Building", type: "Mosque", area: "5,400 sq ft", status: "active", value: "Rs. 2.5 Cr" },
  { id: "P-002", name: "Madrasa Building", type: "Education", area: "3,200 sq ft", status: "active", value: "Rs. 1.2 Cr" },
  { id: "P-003", name: "Community Hall", type: "Rental", area: "2,800 sq ft", status: "active", value: "Rs. 85 L" },
  { id: "P-004", name: "Cemetery Land", type: "Cemetery", area: "1 Acre", status: "active", value: "Rs. 50 L" },
  { id: "P-005", name: "Commercial Shop - Unit 1", type: "Waqf Rental", area: "600 sq ft", status: "rented", value: "Rs. 15 L" },
  { id: "P-006", name: "Commercial Shop - Unit 2", type: "Waqf Rental", area: "600 sq ft", status: "rented", value: "Rs. 15 L" },
];

const assets = [
  { id: "A-001", name: "Sound System - Main Hall", category: "Electronics", purchased: "2023-06-15", value: 125000, condition: "Good" },
  { id: "A-002", name: "AC Units (4)", category: "Appliances", purchased: "2024-01-10", value: 280000, condition: "Good" },
  { id: "A-003", name: "Cooking Vessels Set", category: "Utensils", purchased: "2022-03-20", value: 45000, condition: "Fair" },
  { id: "A-004", name: "Plastic Chairs (200)", category: "Furniture", purchased: "2023-08-05", value: 60000, condition: "Good" },
  { id: "A-005", name: "Tables (20)", category: "Furniture", purchased: "2023-08-05", value: 40000, condition: "Good" },
  { id: "A-006", name: "Carpets - Prayer Hall", category: "Furnishing", purchased: "2024-06-01", value: 150000, condition: "Good" },
  { id: "A-007", name: "Generator - 5KVA", category: "Equipment", purchased: "2021-09-15", value: 85000, condition: "Needs Repair" },
];

const conditionColors: Record<string, "default" | "secondary" | "destructive"> = {
  Good: "default", Fair: "secondary", "Needs Repair": "destructive",
};

export default function AssetsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assets & Property</h1>
          <p className="text-muted-foreground">Manage properties, assets, inventory, and rentals</p>
        </div>
        <Button><Plus /> Add Asset</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="flex items-center gap-4 pt-6"><div className="flex size-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30"><Building2 className="size-5 text-blue-600" /></div><div><p className="text-muted-foreground text-sm">Properties</p><p className="text-2xl font-bold">6</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 pt-6"><div className="bg-muted flex size-10 items-center justify-center rounded-lg"><Package className="text-muted-foreground size-5" /></div><div><p className="text-muted-foreground text-sm">Asset Items</p><p className="text-2xl font-bold">234</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 pt-6"><div className="bg-muted flex size-10 items-center justify-center rounded-lg"><IndianRupee className="text-muted-foreground size-5" /></div><div><p className="text-muted-foreground text-sm">Rental Income (MTD)</p><p className="text-2xl font-bold">Rs. 42,000</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 pt-6"><div className="bg-muted flex size-10 items-center justify-center rounded-lg"><Wrench className="text-muted-foreground size-5" /></div><div><p className="text-muted-foreground text-sm">Maintenance Due</p><p className="text-2xl font-bold">3</p></div></CardContent></Card>
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
              <div className="rounded-md border">
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>ID</TableHead><TableHead>Property Name</TableHead><TableHead>Type</TableHead><TableHead>Area</TableHead><TableHead>Status</TableHead><TableHead>Estimated Value</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {properties.map(p => (
                      <TableRow key={p.id}>
                        <TableCell className="font-mono text-sm">{p.id}</TableCell>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell><Badge variant="outline">{p.type}</Badge></TableCell>
                        <TableCell className="text-muted-foreground text-sm">{p.area}</TableCell>
                        <TableCell><Badge variant={p.status === "rented" ? "secondary" : "default"}>{p.status}</Badge></TableCell>
                        <TableCell className="font-medium">{p.value}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assets">
          <Card>
            <CardHeader><CardTitle>Asset Register</CardTitle><CardDescription>All physical assets with condition tracking</CardDescription></CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>ID</TableHead><TableHead>Asset Name</TableHead><TableHead>Category</TableHead><TableHead>Purchased</TableHead><TableHead>Value</TableHead><TableHead>Condition</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {assets.map(a => (
                      <TableRow key={a.id}>
                        <TableCell className="font-mono text-sm">{a.id}</TableCell>
                        <TableCell className="font-medium">{a.name}</TableCell>
                        <TableCell><Badge variant="outline">{a.category}</Badge></TableCell>
                        <TableCell className="text-muted-foreground text-sm">{new Date(a.purchased).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</TableCell>
                        <TableCell className="font-medium">Rs. {a.value.toLocaleString("en-IN")}</TableCell>
                        <TableCell><Badge variant={conditionColors[a.condition]}>{a.condition}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
