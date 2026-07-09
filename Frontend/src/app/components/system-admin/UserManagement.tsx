import { useEffect, useState } from "react";
import { toast } from "sonner";
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
  KeyRound,
  Loader2,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { ApiError } from "../../services/apiClient";
import { userService, type UserListItem } from "../../services/system-admin/userService";

const ROLE_OPTIONS = [
  { value: "system_admin", label: "Quản trị hệ thống" },
  { value: "quan_ly", label: "Quản lý" },
  { value: "sale", label: "Sale" },
  { value: "ke_toan", label: "Kế toán" },
  { value: "khach_hang", label: "Khách hàng" },
];

const STATUS_OPTIONS = [
  { value: "kich_hoat", label: "Hoạt động" },
  { value: "khoa", label: "Đã khóa" },
  { value: "vo_hieu_hoa", label: "Vô hiệu hóa" },
];

function statusLabel(status: string) {
  return STATUS_OPTIONS.find((s) => s.value === status)?.label ?? status;
}

function statusBadgeVariant(status: string): "secondary" | "outline" | "destructive" {
  if (status === "kich_hoat") return "secondary";
  if (status === "vo_hieu_hoa") return "destructive";
  return "outline";
}

function formatLastLogin(value: string | null) {
  if (!value) return "Chưa từng đăng nhập";
  return new Date(value).toLocaleString("vi-VN");
}

export function UserManagement() {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserListItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserListItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newUser, setNewUser] = useState({ fullName: "", email: "", roleId: "khach_hang", phoneNumber: "" });
  const [editUser, setEditUser] = useState({ fullName: "", phoneNumber: "", roleId: "", status: "" });

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await userService.getAll();
      setUsers(data);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Không thể tải danh sách người dùng.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return u.displayName.toLowerCase().includes(term) || (u.email ?? "").toLowerCase().includes(term);
  });

  const handleEditClick = (user: UserListItem) => {
    setCurrentUser(user);
    setEditUser({ fullName: user.displayName, phoneNumber: "", roleId: user.roleId, status: user.status });
    setIsEditDialogOpen(true);
  };

  const handleCreateSubmit = async () => {
    if (!window.confirm(`Xác nhận tạo tài khoản cho "${newUser.fullName || newUser.email}"?`)) return;

    setIsSubmitting(true);
    try {
      const result = await userService.create(newUser);
      toast.success(`Đã tạo tài khoản. Mật khẩu tạm thời: ${result.temporaryPassword}`, { duration: 10000 });
      setIsAddDialogOpen(false);
      setNewUser({ fullName: "", email: "", roleId: "khach_hang", phoneNumber: "" });
      await loadUsers();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Tạo tài khoản thất bại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateSubmit = async () => {
    if (!currentUser) return;
    if (!window.confirm(`Xác nhận cập nhật tài khoản của "${currentUser.displayName}"?`)) return;

    setIsSubmitting(true);
    try {
      await userService.update(currentUser.accountId, editUser);
      toast.success("Đã cập nhật tài khoản.");
      setIsEditDialogOpen(false);
      await loadUsers();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Cập nhật tài khoản thất bại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    try {
      await userService.remove(deleteTarget.accountId);
      toast.success(`Đã xóa tài khoản của "${deleteTarget.displayName}".`);
      setDeleteTarget(null);
      await loadUsers();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Xóa tài khoản thất bại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (user: UserListItem) => {
    if (!window.confirm(`Đặt lại mật khẩu cho "${user.displayName}"?`)) return;
    try {
      const result = await userService.resetPassword(user.accountId);
      toast.success(`Mật khẩu mới: ${result.newPassword}`, { duration: 10000 });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Đặt lại mật khẩu thất bại.");
    }
  };

  const stats = [
    { label: "Tổng số tài khoản", value: String(users.length), icon: Users },
    {
      label: "Tài khoản nhân viên",
      value: String(users.filter((u) => u.ownerType === "employee").length),
      icon: ShieldCheck,
    },
    {
      label: "Đang chờ / bị khóa",
      value: String(users.filter((u) => u.status !== "kich_hoat").length),
      icon: Clock3,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
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
                Điền thông tin chi tiết để tạo tài khoản mới. Mật khẩu tạm thời sẽ được tạo tự động.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Họ và tên</Label>
                <Input
                  id="name"
                  placeholder="VD: Nguyễn Văn A"
                  value={newUser.fullName}
                  onChange={(e) => setNewUser((s) => ({ ...s, fullName: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@roomman.vn"
                  value={newUser.email}
                  onChange={(e) => setNewUser((s) => ({ ...s, email: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input
                  id="phone"
                  placeholder="09xxxxxxxx"
                  value={newUser.phoneNumber}
                  onChange={(e) => setNewUser((s) => ({ ...s, phoneNumber: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Vai trò</Label>
                <Select
                  value={newUser.roleId}
                  onValueChange={(value) => setNewUser((s) => ({ ...s, roleId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn vai trò" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Hủy</Button>
              <Button
                type="submit"
                disabled={isSubmitting || !newUser.fullName || !newUser.email}
                onClick={handleCreateSubmit}
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Lưu người dùng
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="shadow-sm border-slate-200/80">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="rounded-2xl bg-blue-50 p-3 text-blue-700">
                    <Icon className="w-6 h-6" />
                  </div>
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
          <div className="relative max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="pl-9"
              placeholder="Tìm kiếm theo tên hoặc email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
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
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-slate-500 py-8">
                      <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-slate-500 py-8">
                      Không có người dùng nào.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.accountId}>
                      <TableCell className="font-medium text-slate-900">{user.displayName}</TableCell>
                      <TableCell>{user.roleName}</TableCell>
                      <TableCell>{user.email ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant={statusBadgeVariant(user.status)}>{statusLabel(user.status)}</Badge>
                      </TableCell>
                      <TableCell>{formatLastLogin(user.lastLoginAt)}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            aria-label="Reset password"
                            onClick={() => handleResetPassword(user)}
                          >
                            <KeyRound className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            aria-label="Edit account"
                            onClick={() => handleEditClick(user)}
                          >
                            <PenSquare className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            aria-label="Delete account"
                            onClick={() => setDeleteTarget(user)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
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
              Cập nhật thông tin tài khoản của {currentUser?.displayName}.
            </DialogDescription>
          </DialogHeader>
          {currentUser && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Họ và tên</Label>
                <Input
                  id="edit-name"
                  value={editUser.fullName}
                  onChange={(e) => setEditUser((s) => ({ ...s, fullName: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-phone">Số điện thoại</Label>
                <Input
                  id="edit-phone"
                  value={editUser.phoneNumber}
                  onChange={(e) => setEditUser((s) => ({ ...s, phoneNumber: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-role">Vai trò</Label>
                <Select
                  value={editUser.roleId}
                  onValueChange={(value) => setEditUser((s) => ({ ...s, roleId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn vai trò" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Trạng thái</Label>
                <Select
                  value={editUser.status}
                  onValueChange={(value) => setEditUser((s) => ({ ...s, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Hủy</Button>
            <Button type="submit" disabled={isSubmitting} onClick={handleUpdateSubmit}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa tài khoản?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này sẽ xóa vĩnh viễn tài khoản của "{deleteTarget?.displayName}". Bạn không thể hoàn tác sau khi xác nhận.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Hủy</AlertDialogCancel>
            <AlertDialogAction disabled={isSubmitting} onClick={handleConfirmDelete}>
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
