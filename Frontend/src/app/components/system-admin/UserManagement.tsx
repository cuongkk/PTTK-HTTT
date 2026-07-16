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
  Clock3,
  KeyRound,
  Eye,
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
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { ApiError } from "../../services/apiClient";
import { userService, type UserListItem, type UserDetail } from "../../services/system-admin/userService";
import { roomService, type Branch } from "../../services/system-admin/roomService";
import { ConfirmDialog } from "../ui/ConfirmDialog";

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

const GENDER_OPTIONS = [
  { value: "nam", label: "Nam" },
  { value: "nu", label: "Nữ" },
  { value: "khac", label: "Khác" },
];

const MIN_PASSWORD_LENGTH = 6;

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

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("vi-VN");
}

function genderLabel(value: string | null | undefined) {
  return GENDER_OPTIONS.find((g) => g.value === value)?.label ?? "—";
}

const emptyNewUser = {
  fullName: "",
  email: "",
  roleId: "khach_hang",
  phoneNumber: "",
  password: "",
  confirmPassword: "",
  branchId: "",
  nationalId: "",
  gender: "",
  nationality: "Việt Nam",
  dateOfBirth: "",
  address: "",
};

const emptyEditUser = {
  fullName: "",
  phoneNumber: "",
  roleId: "",
  status: "",
  password: "",
  confirmPassword: "",
  branchId: "",
  hireDate: "",
  nationalId: "",
  gender: "",
  nationality: "",
  dateOfBirth: "",
  address: "",
};

export function UserManagement() {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserListItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailUser, setDetailUser] = useState<UserDetail | null>(null);

  const [newUser, setNewUser] = useState(emptyNewUser);
  const [editUser, setEditUser] = useState(emptyEditUser);
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; title: string; message: string; variant?: "warning" | "danger" | "info"; onConfirm: () => void }>({ open: false, title: "", message: "", onConfirm: () => {} });

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const [usersData, branchesData] = await Promise.all([userService.getAll(), roomService.getBranches()]);
      setUsers(usersData);
      setBranches(branchesData);
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

  const handleViewDetail = async (user: UserListItem) => {
    setIsDetailDialogOpen(true);
    setIsDetailLoading(true);
    setDetailUser(null);
    try {
      const detail = await userService.getById(user.accountId);
      setDetailUser(detail);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Không thể tải chi tiết người dùng.");
      setIsDetailDialogOpen(false);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleEditClick = async (user: UserListItem) => {
    setCurrentUser(user);
    setIsEditDialogOpen(true);
    setIsEditLoading(true);
    try {
      const detail = await userService.getById(user.accountId);
      setEditUser({
        fullName: detail.fullName,
        phoneNumber: detail.phoneNumber ?? "",
        roleId: detail.roleId,
        status: detail.status,
        password: "",
        confirmPassword: "",
        branchId: detail.branchId ?? "",
        hireDate: detail.hireDate ?? "",
        nationalId: detail.nationalId ?? "",
        gender: detail.gender ?? "",
        nationality: detail.nationality ?? "Việt Nam",
        dateOfBirth: detail.dateOfBirth ?? "",
        address: detail.address ?? "",
      });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Không thể tải thông tin người dùng.");
      setIsEditDialogOpen(false);
    } finally {
      setIsEditLoading(false);
    }
  };

  const handleCreateSubmit = () => {
    if (!newUser.fullName || !newUser.email) {
      toast.error("Vui lòng nhập đầy đủ họ tên và email.");
      return;
    }
    if (newUser.password.length < MIN_PASSWORD_LENGTH) {
      toast.error(`Mật khẩu phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự.`);
      return;
    }
    if (newUser.password !== newUser.confirmPassword) {
      toast.error("Xác nhận mật khẩu không khớp.");
      return;
    }

    setConfirmDialog({
      open: true,
      title: "Tạo tài khoản",
      message: `Xác nhận tạo tài khoản cho "${newUser.fullName || newUser.email}"?`,
      variant: "info",
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, open: false }));
        setIsSubmitting(true);
        try {
          const isCustomer = newUser.roleId === "khach_hang";
          await userService.create({
            fullName: newUser.fullName,
            email: newUser.email,
            roleId: newUser.roleId,
            password: newUser.password,
            phoneNumber: newUser.phoneNumber || undefined,
            branchId: !isCustomer ? newUser.branchId || undefined : undefined,
            nationalId: isCustomer ? newUser.nationalId || undefined : undefined,
            gender: isCustomer ? newUser.gender || undefined : undefined,
            nationality: isCustomer ? newUser.nationality || undefined : undefined,
            dateOfBirth: isCustomer ? newUser.dateOfBirth || undefined : undefined,
            address: isCustomer ? newUser.address || undefined : undefined,
          });
          toast.success("Đã tạo tài khoản.");
          setIsAddDialogOpen(false);
          setNewUser(emptyNewUser);
          await loadUsers();
        } catch (err) {
          toast.error(err instanceof ApiError ? err.message : "Tạo tài khoản thất bại.");
        } finally {
          setIsSubmitting(false);
        }
      },
    });
  };

  const handleUpdateSubmit = () => {
    if (!currentUser) return;
    if (editUser.password || editUser.confirmPassword) {
      if (editUser.password.length < MIN_PASSWORD_LENGTH) {
        toast.error(`Mật khẩu phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự.`);
        return;
      }
      if (editUser.password !== editUser.confirmPassword) {
        toast.error("Xác nhận mật khẩu không khớp.");
        return;
      }
    }

    setConfirmDialog({
      open: true,
      title: "Cập nhật tài khoản",
      message: `Xác nhận cập nhật tài khoản của "${currentUser.displayName}"?`,
      variant: "info",
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, open: false }));
        setIsSubmitting(true);
        try {
          const isCustomer = editUser.roleId === "khach_hang";
          await userService.update(currentUser.accountId, {
            fullName: editUser.fullName,
            phoneNumber: editUser.phoneNumber || undefined,
            roleId: editUser.roleId,
            status: editUser.status,
            password: editUser.password || undefined,
            branchId: !isCustomer ? editUser.branchId || undefined : undefined,
            hireDate: !isCustomer ? editUser.hireDate || undefined : undefined,
            nationalId: isCustomer ? editUser.nationalId || undefined : undefined,
            gender: isCustomer ? editUser.gender || undefined : undefined,
            nationality: isCustomer ? editUser.nationality || undefined : undefined,
            dateOfBirth: isCustomer ? editUser.dateOfBirth || undefined : undefined,
            address: isCustomer ? editUser.address || undefined : undefined,
          });
          toast.success("Đã cập nhật tài khoản.");
          setIsEditDialogOpen(false);
          await loadUsers();
        } catch (err) {
          toast.error(err instanceof ApiError ? err.message : "Cập nhật tài khoản thất bại.");
        } finally {
          setIsSubmitting(false);
        }
      },
    });
  };

  const handleResetPassword = (user: UserListItem) => {
    setConfirmDialog({
      open: true,
      title: "Đặt lại mật khẩu",
      message: `Đặt lại mật khẩu cho "${user.displayName}"?`,
      variant: "warning",
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, open: false }));
        try {
          const result = await userService.resetPassword(user.accountId);
          toast.success(`Mật khẩu mới: ${result.newPassword}`, { duration: 10000 });
        } catch (err) {
          toast.error(err instanceof ApiError ? err.message : "Đặt lại mật khẩu thất bại.");
        }
      },
    });
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
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open); if (!open) setNewUser(emptyNewUser); }}>
          <DialogTrigger asChild>
            <Button className="w-fit">
              <UserPlus className="w-4 h-4" />
              Thêm tài khoản
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px] max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Thêm người dùng mới</DialogTitle>
              <DialogDescription>
                Điền thông tin chi tiết để tạo tài khoản mới.
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

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="password">Mật khẩu</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder={`Tối thiểu ${MIN_PASSWORD_LENGTH} ký tự`}
                    value={newUser.password}
                    onChange={(e) => setNewUser((s) => ({ ...s, password: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirm-password">Xác nhận mật khẩu</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={newUser.confirmPassword}
                    onChange={(e) => setNewUser((s) => ({ ...s, confirmPassword: e.target.value }))}
                  />
                </div>
              </div>

              {newUser.roleId === "khach_hang" ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="national-id">CCCD</Label>
                      <Input
                        id="national-id"
                        value={newUser.nationalId}
                        onChange={(e) => setNewUser((s) => ({ ...s, nationalId: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="gender">Giới tính</Label>
                      <Select
                        value={newUser.gender}
                        onValueChange={(value) => setNewUser((s) => ({ ...s, gender: value }))}
                      >
                        <SelectTrigger id="gender">
                          <SelectValue placeholder="Chọn giới tính" />
                        </SelectTrigger>
                        <SelectContent>
                          {GENDER_OPTIONS.map((g) => (
                            <SelectItem key={g.value} value={g.value}>
                              {g.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="nationality">Quốc tịch</Label>
                      <Input
                        id="nationality"
                        value={newUser.nationality}
                        onChange={(e) => setNewUser((s) => ({ ...s, nationality: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="dob">Ngày sinh</Label>
                      <Input
                        id="dob"
                        type="date"
                        value={newUser.dateOfBirth}
                        onChange={(e) => setNewUser((s) => ({ ...s, dateOfBirth: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="address">Địa chỉ</Label>
                    <Input
                      id="address"
                      value={newUser.address}
                      onChange={(e) => setNewUser((s) => ({ ...s, address: e.target.value }))}
                    />
                  </div>
                </>
              ) : (
                <div className="grid gap-2">
                  <Label htmlFor="branch">Chi nhánh</Label>
                  <Select
                    value={newUser.branchId}
                    onValueChange={(value) => setNewUser((s) => ({ ...s, branchId: value }))}
                  >
                    <SelectTrigger id="branch">
                      <SelectValue placeholder="Chọn chi nhánh" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((b) => (
                        <SelectItem key={b.branchId} value={b.branchId}>
                          {b.branchName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
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
                            aria-label="View details"
                            onClick={() => handleViewDetail(user)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
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

      {/* Dialog xem chi tiết */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[480px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết người dùng</DialogTitle>
            <DialogDescription>Toàn bộ hồ sơ của tài khoản.</DialogDescription>
          </DialogHeader>
          {isDetailLoading || !detailUser ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : (
            <div className="space-y-5 py-2">
              <div>
                <h4 className="text-sm font-semibold text-slate-500 mb-2">Thông tin chung</h4>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <dt className="text-slate-500">Username</dt>
                  <dd className="text-slate-900">{detailUser.username}</dd>
                  <dt className="text-slate-500">Email</dt>
                  <dd className="text-slate-900">{detailUser.email ?? "—"}</dd>
                  <dt className="text-slate-500">Số điện thoại</dt>
                  <dd className="text-slate-900">{detailUser.phoneNumber ?? "—"}</dd>
                  <dt className="text-slate-500">Vai trò</dt>
                  <dd className="text-slate-900">{detailUser.roleName}</dd>
                  <dt className="text-slate-500">Trạng thái</dt>
                  <dd><Badge variant={statusBadgeVariant(detailUser.status)}>{statusLabel(detailUser.status)}</Badge></dd>
                  <dt className="text-slate-500">Loại tài khoản</dt>
                  <dd className="text-slate-900">{detailUser.ownerType === "employee" ? "Nhân viên" : "Khách hàng"}</dd>
                  <dt className="text-slate-500">Ngày tạo</dt>
                  <dd className="text-slate-900">{formatDate(detailUser.createdAt)}</dd>
                  <dt className="text-slate-500">Lần đăng nhập cuối</dt>
                  <dd className="text-slate-900">{formatLastLogin(detailUser.lastLoginAt)}</dd>
                </dl>
              </div>

              {detailUser.ownerType === "employee" ? (
                <div>
                  <h4 className="text-sm font-semibold text-slate-500 mb-2">Thông tin nhân viên</h4>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <dt className="text-slate-500">Chi nhánh</dt>
                    <dd className="text-slate-900">{detailUser.branchName ?? "—"}</dd>
                    <dt className="text-slate-500">Chức vụ</dt>
                    <dd className="text-slate-900">{detailUser.roleName}</dd>
                    <dt className="text-slate-500">Ngày vào làm</dt>
                    <dd className="text-slate-900">{formatDate(detailUser.hireDate)}</dd>
                  </dl>
                </div>
              ) : (
                <div>
                  <h4 className="text-sm font-semibold text-slate-500 mb-2">Thông tin khách hàng</h4>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <dt className="text-slate-500">CCCD</dt>
                    <dd className="text-slate-900">{detailUser.nationalId ?? "—"}</dd>
                    <dt className="text-slate-500">Giới tính</dt>
                    <dd className="text-slate-900">{genderLabel(detailUser.gender)}</dd>
                    <dt className="text-slate-500">Quốc tịch</dt>
                    <dd className="text-slate-900">{detailUser.nationality ?? "—"}</dd>
                    <dt className="text-slate-500">Ngày sinh</dt>
                    <dd className="text-slate-900">{formatDate(detailUser.dateOfBirth)}</dd>
                    <dt className="text-slate-500">Địa chỉ</dt>
                    <dd className="text-slate-900 col-span-1">{detailUser.address ?? "—"}</dd>
                  </dl>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[480px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin tài khoản của {currentUser?.displayName}.
            </DialogDescription>
          </DialogHeader>
          {isEditLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : currentUser && (
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
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-role">Vai trò</Label>
                  <Select
                    value={editUser.roleId}
                    onValueChange={(value) => setEditUser((s) => ({ ...s, roleId: value }))}
                  >
                    <SelectTrigger id="edit-role">
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
                    <SelectTrigger id="edit-status">
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

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-password">Mật khẩu mới</Label>
                  <Input
                    id="edit-password"
                    type="password"
                    placeholder="Để trống nếu không đổi"
                    value={editUser.password}
                    onChange={(e) => setEditUser((s) => ({ ...s, password: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-confirm-password">Xác nhận mật khẩu</Label>
                  <Input
                    id="edit-confirm-password"
                    type="password"
                    value={editUser.confirmPassword}
                    onChange={(e) => setEditUser((s) => ({ ...s, confirmPassword: e.target.value }))}
                  />
                </div>
              </div>

              {editUser.roleId === "khach_hang" ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-national-id">CCCD</Label>
                      <Input
                        id="edit-national-id"
                        value={editUser.nationalId}
                        onChange={(e) => setEditUser((s) => ({ ...s, nationalId: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-gender">Giới tính</Label>
                      <Select
                        value={editUser.gender}
                        onValueChange={(value) => setEditUser((s) => ({ ...s, gender: value }))}
                      >
                        <SelectTrigger id="edit-gender">
                          <SelectValue placeholder="Chọn giới tính" />
                        </SelectTrigger>
                        <SelectContent>
                          {GENDER_OPTIONS.map((g) => (
                            <SelectItem key={g.value} value={g.value}>
                              {g.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-nationality">Quốc tịch</Label>
                      <Input
                        id="edit-nationality"
                        value={editUser.nationality}
                        onChange={(e) => setEditUser((s) => ({ ...s, nationality: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-dob">Ngày sinh</Label>
                      <Input
                        id="edit-dob"
                        type="date"
                        value={editUser.dateOfBirth}
                        onChange={(e) => setEditUser((s) => ({ ...s, dateOfBirth: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-address">Địa chỉ</Label>
                    <Input
                      id="edit-address"
                      value={editUser.address}
                      onChange={(e) => setEditUser((s) => ({ ...s, address: e.target.value }))}
                    />
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-branch">Chi nhánh</Label>
                    <Select
                      value={editUser.branchId}
                      onValueChange={(value) => setEditUser((s) => ({ ...s, branchId: value }))}
                    >
                      <SelectTrigger id="edit-branch">
                        <SelectValue placeholder="Chọn chi nhánh" />
                      </SelectTrigger>
                      <SelectContent>
                        {branches.map((b) => (
                          <SelectItem key={b.branchId} value={b.branchId}>
                            {b.branchName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-hire-date">Ngày vào làm</Label>
                    <Input
                      id="edit-hire-date"
                      type="date"
                      value={editUser.hireDate}
                      onChange={(e) => setEditUser((s) => ({ ...s, hireDate: e.target.value }))}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Hủy</Button>
            <Button type="submit" disabled={isSubmitting || isEditLoading} onClick={handleUpdateSubmit}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant={confirmDialog.variant ?? "info"}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}
