import { useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export function UserManagement() {
  const [users, setUsers] = useState([
    { name: "Nguyen Van A", role: "Sale", email: "sale.a@roomman.vn", status: "Hoạt động", lastLogin: "2h trước" },
    { name: "Tran Thi B", role: "Quản lý", email: "manager.b@roomman.vn", status: "Hoạt động", lastLogin: "Hôm nay" },
    { name: "Le Van C", role: "Kế toán", email: "acc.c@roomman.vn", status: "Đang chờ", lastLogin: "Chưa từng đăng nhập" },
    { name: "Pham Thi D", role: "Khách hàng", email: "customer.d@email.com", status: "Hoạt động", lastLogin: "1 ngày trước" },
    { name: "Hoang Van E", role: "Khách hàng", email: "customer.e@email.com", status: "Đã khóa", lastLogin: "5 ngày trước" },
  ]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const handleEditClick = (user: any) => {
    setCurrentUser(user);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          {/* <Badge className="mb-3"></Badge> */}
          <h1 className="text-3xl font-bold text-slate-900">Quản lý người dùng</h1>
          <p className="mt-2 text-slate-600">
            Tạo, chỉnh sửa và quản lý tài khoản người dùng trên hệ thống, bao gồm nhân viên và khách hàng.
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-fit">
              <UserPlus className="w-4 h-4" />
              Thêm tài khoản
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Thêm người dùng mới</DialogTitle>
              <DialogDescription>
                Điền thông tin chi tiết để tạo tài khoản mới.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Họ và tên</Label>
                <Input id="name" placeholder="VD: Nguyễn Văn A" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="example@roomman.vn" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Vai trò</Label>
                <Select defaultValue="Khách hàng">
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn vai trò" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Quản lý">Quản lý</SelectItem>
                    <SelectItem value="Sale">Sale</SelectItem>
                    <SelectItem value="Kế toán">Kế toán</SelectItem>
                    <SelectItem value="Khách hàng">Khách hàng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Hủy</Button>
              <Button type="submit" onClick={() => setIsAddDialogOpen(false)}>Lưu người dùng</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[
          { label: "Tổng số tài khoản", value: "248", icon: Users },
          { label: "Tài khoản nhân viên", value: "42", icon: ShieldCheck },
          { label: "Đang chờ duyệt", value: "7", icon: Clock3 },
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
          <CardTitle className="text-slate-900">Danh sách người dùng</CardTitle>
          <CardDescription>Search và quản lý người dùng trên hệ thống</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_180px_180px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input className="pl-9" placeholder="Tìm kiếm theo tên hoặc email" />
            </div>
            <Input defaultValue="Tất cả vai trò" />
            <Input defaultValue="Tất cả trạng thái" />
          </div>

          <div className="rounded-2xl border border-slate-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Lần đăng nhập gần nhất</TableHead>
                  <TableHead className="text-right">Hoạt động</TableHead>
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
                          user.status === "Hoạt động"
                            ? "secondary"
                            : user.status === "Đang chờ"
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
                        <Button 
                          size="icon" 
                          variant="outline" 
                          aria-label="Edit account"
                          onClick={() => handleEditClick(user)}
                        >
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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin tài khoản của {currentUser?.name}.
            </DialogDescription>
          </DialogHeader>
          {currentUser && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Họ và tên</Label>
                <Input id="edit-name" defaultValue={currentUser.name} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input id="edit-email" type="email" defaultValue={currentUser.email} disabled />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-role">Vai trò</Label>
                <Select defaultValue={currentUser.role}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn vai trò" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Quản lý">Quản lý</SelectItem>
                    <SelectItem value="Sale">Sale</SelectItem>
                    <SelectItem value="Kế toán">Kế toán</SelectItem>
                    <SelectItem value="Khách hàng">Khách hàng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Trạng thái</Label>
                <Select defaultValue={currentUser.status}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hoạt động">Hoạt động</SelectItem>
                    <SelectItem value="Đang chờ">Đang chờ</SelectItem>
                    <SelectItem value="Đã khóa">Đã khóa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Hủy</Button>
            <Button type="submit" onClick={() => setIsEditDialogOpen(false)}>Cập nhật</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
