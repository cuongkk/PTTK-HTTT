import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Toggle } from "../ui/toggle";
import { Slider } from "../ui/slider";
import { Settings, Clock3, Percent, ShieldCheck, BellRing, Save } from "lucide-react";

export function SystemSettings() {
  const policies = [
    { title: "Deposit refund ratio", description: "Choose the percentage refunded on contract liquidation.", value: "70%", icon: Percent },
    { title: "Payment waiting window", description: "How long tenants can wait before an overdue state triggers.", value: "24 hours", icon: Clock3 },
    { title: "Approval escalation", description: "Auto-escalate pending requests if they exceed the SLA.", value: "48 hours", icon: ShieldCheck },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge className="mb-3">Global configuration</Badge>
          <h1 className="text-3xl font-bold text-slate-900">System Settings</h1>
          <p className="mt-2 text-slate-600">
            Maintain shared rules that apply across sales, accounting, management, and customer workflows.
          </p>
        </div>
        <Button className="w-fit">
          <Save className="h-4 w-4" />
          Save changes
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {policies.map((policy) => {
          const Icon = policy.icon;
          return (
            <Card key={policy.title} className="shadow-sm border-slate-200/80">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="rounded-2xl bg-purple-50 p-3 text-purple-700">
                    <Icon className="h-6 w-6" />
                  </div>
                  <Badge variant="outline">Active</Badge>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">{policy.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{policy.description}</p>
                <p className="mt-4 text-2xl font-bold text-slate-900">{policy.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card className="shadow-sm border-slate-200/80">
          <CardHeader>
            <CardTitle className="text-slate-900">Policy editor</CardTitle>
            <CardDescription>Adjust the most frequently changed global parameters.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">Deposit refund ratio</label>
                <span className="text-sm text-slate-500">70%</span>
              </div>
              <Slider defaultValue={[70]} max={100} step={10} />
              <p className="text-xs text-slate-500">Used when calculating refundable amounts after liquidation.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Payment waiting hours</label>
                <Input defaultValue="24" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Auto escalation hours</label>
                <Input defaultValue="48" />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button variant="outline">Preview impact</Button>
              <Button>Commit policy</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200/80">
          <CardHeader>
            <CardTitle className="text-slate-900">Operational switches</CardTitle>
            <CardDescription>Turn cross-module capabilities on or off without redeploying.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Email alerts for overdue payments", description: "Notify accounting and tenant contacts automatically.", enabled: true },
              { label: "Room change audit trail", description: "Keep a permanent log for room and bed updates.", enabled: true },
              { label: "Maintenance lock on vacant rooms", description: "Block bookings when a room is marked under maintenance.", enabled: false },
            ].map((item) => (
              <div key={item.label} className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-slate-500" />
                    <h4 className="font-medium text-slate-900">{item.label}</h4>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{item.description}</p>
                </div>
                <Toggle pressed={item.enabled} aria-label={item.label} />
              </div>
            ))}

            <div className="rounded-2xl bg-blue-50 p-4 text-sm text-blue-900">
              <div className="flex items-center gap-2 font-medium">
                <BellRing className="h-4 w-4" />
                Change review reminder
              </div>
              <p className="mt-1 text-blue-800">
                Every policy update is recorded for audit and can be reviewed by the system admin.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
