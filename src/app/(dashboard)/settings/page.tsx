import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Upload } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage Mahallu configuration and preferences</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList><TabsTrigger value="general">General</TabsTrigger><TabsTrigger value="finance">Finance</TabsTrigger><TabsTrigger value="notifications">Notifications</TabsTrigger><TabsTrigger value="appearance">Appearance</TabsTrigger></TabsList>

        <TabsContent value="general" className="flex flex-col gap-4">
          <Card>
            <CardHeader><CardTitle>Mahallu Information</CardTitle><CardDescription>Basic details about your Mahallu</CardDescription></CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2"><label className="text-sm font-medium">Mahallu Name</label><Input defaultValue="Juma Masjid Mahallu" /></div>
                <div className="flex flex-col gap-2"><label className="text-sm font-medium">Mahallu Name (Malayalam)</label><Input defaultValue="ജുമാ മസ്ജിദ് മഹല്ലു" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2"><label className="text-sm font-medium">Address</label><Input defaultValue="Near Bus Stand, Kondotty" /></div>
                <div className="flex flex-col gap-2"><label className="text-sm font-medium">District</label><Input defaultValue="Malappuram" /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-2"><label className="text-sm font-medium">Phone</label><Input defaultValue="+91 483 2712345" /></div>
                <div className="flex flex-col gap-2"><label className="text-sm font-medium">Email</label><Input defaultValue="info@jumamasjid.org" /></div>
                <div className="flex flex-col gap-2"><label className="text-sm font-medium">Pincode</label><Input defaultValue="676102" /></div>
              </div>
              <div className="flex flex-col gap-2"><label className="text-sm font-medium">Logo</label><div className="flex items-center gap-4"><div className="bg-primary text-primary-foreground flex size-16 items-center justify-center rounded-lg text-2xl font-bold">M</div><Button variant="outline"><Upload className="size-4" /> Upload Logo</Button></div></div>
              <Button className="self-start"><Save className="size-4" /> Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="finance" className="flex flex-col gap-4">
          <Card>
            <CardHeader><CardTitle>Financial Settings</CardTitle><CardDescription>Configure subscription plans and fiscal year</CardDescription></CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2"><label className="text-sm font-medium">Fiscal Year Start</label><Select defaultValue="april"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="january">January</SelectItem><SelectItem value="april">April</SelectItem></SelectContent></Select></div>
                <div className="flex flex-col gap-2"><label className="text-sm font-medium">Currency</label><Input defaultValue="INR (Rs.)" disabled /></div>
              </div>
              <Separator />
              <p className="text-sm font-semibold">Subscription Plans</p>
              <div className="grid grid-cols-4 gap-4">
                <div className="flex flex-col gap-2"><label className="text-xs font-medium">Standard</label><Input defaultValue="500" type="number" /></div>
                <div className="flex flex-col gap-2"><label className="text-xs font-medium">NRI</label><Input defaultValue="2000" type="number" /></div>
                <div className="flex flex-col gap-2"><label className="text-xs font-medium">Senior</label><Input defaultValue="300" type="number" /></div>
                <div className="flex flex-col gap-2"><label className="text-xs font-medium">BPL</label><Input defaultValue="100" type="number" /></div>
              </div>
              <Button className="self-start"><Save className="size-4" /> Save</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="flex flex-col gap-4">
          <Card>
            <CardHeader><CardTitle>Notification Preferences</CardTitle><CardDescription>Configure automated reminders and alerts</CardDescription></CardHeader>
            <CardContent className="flex flex-col gap-4">
              {[
                { label: "Subscription payment reminders", desc: "Send 7 days before, on due date, and 14 days after" },
                { label: "Madrasa absence alerts", desc: "Notify parents on consecutive absences" },
                { label: "Friday collection reports", desc: "Auto-send collection summary to committee" },
                { label: "Certificate status updates", desc: "Notify applicants on status changes" },
                { label: "Emergency broadcasts", desc: "Enable emergency alert system" },
              ].map(n => (
                <div key={n.label} className="flex items-center justify-between rounded-lg border p-4">
                  <div><p className="text-sm font-medium">{n.label}</p><p className="text-muted-foreground text-xs">{n.desc}</p></div>
                  <Switch defaultChecked />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="flex flex-col gap-4">
          <Card>
            <CardHeader><CardTitle>Appearance</CardTitle><CardDescription>Customize the look of your Mahallu portal</CardDescription></CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div><p className="text-sm font-medium">Language</p><p className="text-muted-foreground text-xs">Default interface language</p></div>
                <Select defaultValue="en"><SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="en">English</SelectItem><SelectItem value="ml">Malayalam (മലയാളം)</SelectItem></SelectContent></Select>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div><p className="text-sm font-medium">Dark Mode</p><p className="text-muted-foreground text-xs">Toggle dark theme</p></div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
