import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { DollarSign, Plus, Search, Edit3, Trash2, PlugZap, Droplets, Wifi, Sparkles } from "lucide-react";

export function ServiceCatalog() {
  const services = [
    { name: "Electricity", unit: "kWh", price: "3,500 VND", category: "Utility", icon: PlugZap },
    { name: "Water", unit: "m3", price: "15,000 VND", category: "Utility", icon: Droplets },
    { name: "Wi-Fi", unit: "month", price: "120,000 VND", category: "Connectivity", icon: Wifi },
    { name: "Cleaning", unit: "visit", price: "80,000 VND", category: "Service", icon: Sparkles },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge className="mb-3">Fee management</Badge>
          <h1 className="text-3xl font-bold text-slate-900">Service Catalog</h1>
          <p className="mt-2 text-slate-600">
            Maintain utility charges and add-on services used across rental contracts.
          </p>
        </div>
        <Button className="w-fit">
          <Plus className="h-4 w-4" />
          Add service
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[
          { label: "Active services", value: "9", icon: DollarSign },
          { label: "Utility items", value: "4", icon: PlugZap },
          { label: "Monthly updates", value: "2", icon: Trash2 },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="shadow-sm border-slate-200/80">
              <CardContent className="pt-6">
                <div className="rounded-2xl bg-orange-50 p-3 text-orange-700 w-fit">
                  <Icon className="h-6 w-6" />
                </div>
                <p className="mt-4 text-sm text-slate-500">{stat.label}</p>
                <p className="mt-1 text-3xl font-bold text-slate-900">{stat.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="shadow-sm border-slate-200/80">
        <CardHeader>
          <CardTitle className="text-slate-900">Service price list</CardTitle>
          <CardDescription>Update unit rates for electricity, water, Wi-Fi, and cleaning fees.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="relative max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input className="pl-9" placeholder="Search service name" />
          </div>

          <div className="rounded-2xl border border-slate-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Unit price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => {
                  const Icon = service.icon;
                  return (
                    <TableRow key={service.name}>
                      <TableCell className="font-medium text-slate-900">
                        <div className="flex items-center gap-3">
                          <div className="rounded-xl bg-slate-100 p-2 text-slate-700">
                            <Icon className="h-4 w-4" />
                          </div>
                          {service.name}
                        </div>
                      </TableCell>
                      <TableCell>{service.category}</TableCell>
                      <TableCell>{service.unit}</TableCell>
                      <TableCell className="font-medium">{service.price}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">Active</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="icon" aria-label="Edit service">
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" aria-label="Delete service">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
