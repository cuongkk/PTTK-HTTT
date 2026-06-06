import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Input } from "../ui/input";
import {
  Users,
  Search,
  UserPlus,
  ShieldCheck,
  PenSquare,
  Trash2,
  Clock3,
} from "lucide-react";

export function UserManagement() {
  const users = [
    { name: "Nguyen Van A", role: "Sale", email: "sale.a@roomman.vn", status: "Active", lastLogin: "2h ago" },
    { name: "Tran Thi B", role: "Manager", email: "manager.b@roomman.vn", status: "Active", lastLogin: "Today" },
    { name: "Le Van C", role: "Accountant", email: "acc.c@roomman.vn", status: "Pending", lastLogin: "Never" },
    { name: "Pham Thi D", role: "Customer", email: "customer.d@email.com", status: "Active", lastLogin: "1d ago" },
    { name: "Hoang Van E", role: "Customer", email: "customer.e@email.com", status: "Locked", lastLogin: "5d ago" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge className="mb-3">Role administration</Badge>
          <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
          <p className="mt-2 text-slate-600">
            Create, edit, assign roles, and control access for staff and customer accounts.
          </p>
        </div>
        <Button className="w-fit">
          <UserPlus className="w-4 h-4" />
          Create account
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[
          { label: "Total accounts", value: "248", icon: Users },
          { label: "Staff accounts", value: "42", icon: ShieldCheck },
          { label: "Pending approvals", value: "7", icon: Clock3 },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="shadow-sm border-slate-200/80">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="rounded-2xl bg-blue-50 p-3 text-blue-700">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-sm text-emerald-600">Updated</span>
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
          <CardTitle className="text-slate-900">Account directory</CardTitle>
          <CardDescription>Search and review role assignments across the platform.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_180px_180px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input className="pl-9" placeholder="Search by name or email" />
            </div>
            <Input defaultValue="All roles" />
            <Input defaultValue="All statuses" />
          </div>

          <div className="rounded-2xl border border-slate-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.email}>
                    <TableCell className="font-medium text-slate-900">{user.name}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.status === "Active"
                            ? "secondary"
                            : user.status === "Pending"
                              ? "outline"
                              : "destructive"
                        }
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.lastLogin}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button size="icon" variant="outline" aria-label="Edit account">
                          <PenSquare className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="outline" aria-label="Delete account">
                          <Trash2 className="h-4 w-4" />
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
