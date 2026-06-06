import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Building2, Plus, Search, Edit3, BadgeDollarSign, BedDouble, Layers3 } from "lucide-react";

export function RoomBedCatalog() {
  const roomTypes = [
    { name: "Single room", beds: 1, capacity: 1, price: "2,200,000 VND", status: "Available", occupancy: "18/20" },
    { name: "Shared room", beds: 2, capacity: 2, price: "1,600,000 VND", status: "Available", occupancy: "12/15" },
    { name: "Premium room", beds: 1, capacity: 1, price: "3,200,000 VND", status: "Limited", occupancy: "8/10" },
    { name: "Family room", beds: 4, capacity: 4, price: "4,800,000 VND", status: "Full", occupancy: "6/6" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge className="mb-3">Catalog management</Badge>
          <h1 className="text-3xl font-bold text-slate-900">Room / Bed Catalog</h1>
          <p className="mt-2 text-slate-600">
            Add new room types, adjust rental prices, and maintain maximum capacity.
          </p>
        </div>
        <Button className="w-fit">
          <Plus className="h-4 w-4" />
          Add room type
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[
          { label: "Room types", value: "14", icon: Building2 },
          { label: "Bed types", value: "8", icon: BedDouble },
          { label: "Configured floors", value: "6", icon: Layers3 },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="shadow-sm border-slate-200/80">
              <CardContent className="pt-6">
                <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700 w-fit">
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
          <CardTitle className="text-slate-900">Room types</CardTitle>
          <CardDescription>Manage rentable room templates and bed capacity settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="relative max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input className="pl-9" placeholder="Search room or bed type" />
          </div>

          <div className="rounded-2xl border border-slate-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room type</TableHead>
                  <TableHead>Beds</TableHead>
                  <TableHead>Max capacity</TableHead>
                  <TableHead>Monthly price</TableHead>
                  <TableHead>Occupancy</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roomTypes.map((room) => (
                  <TableRow key={room.name}>
                    <TableCell className="font-medium text-slate-900">{room.name}</TableCell>
                    <TableCell>{room.beds}</TableCell>
                    <TableCell>{room.capacity}</TableCell>
                    <TableCell className="font-medium">{room.price}</TableCell>
                    <TableCell>{room.occupancy}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          room.status === "Full"
                            ? "destructive"
                            : room.status === "Limited"
                              ? "outline"
                              : "secondary"
                        }
                      >
                        {room.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" aria-label="Edit room type">
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" aria-label="Adjust price">
                          <BadgeDollarSign className="h-4 w-4" />
                        </Button>
                      </div>
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
