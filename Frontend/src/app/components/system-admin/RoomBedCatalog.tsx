import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Building2, Plus, Search, Edit3, BedDouble, Layers3, Trash2, Loader2, X } from "lucide-react";
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
import { Toggle } from "../ui/toggle";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { ApiError } from "../../services/apiClient";
import { roomService, type Room, type Branch, type Bed } from "../../services/system-admin/roomService";
import { bedService } from "../../services/system-admin/bedService";
import { ConfirmDialog } from "../ui/ConfirmDialog";

const ROOM_TYPE_OPTIONS = [
  { value: "nguyen_can", label: "Nguyên căn" },
  { value: "ghep", label: "Ghép" },
];

const ROOM_STATUS_OPTIONS = [
  { value: "trong", label: "Còn phòng" },
  { value: "da_dat_coc", label: "Đã đặt cọc" },
  { value: "dang_thue", label: "Đang thuê" },
];

const ALLOWED_GENDER_OPTIONS = [
  { value: "khong_gioi_han", label: "Không giới hạn" },
  { value: "nam", label: "Nam" },
  { value: "nu", label: "Nữ" },
];

function statusLabel(status: string) {
  return ROOM_STATUS_OPTIONS.find((s) => s.value === status)?.label ?? status;
}

function statusBadgeVariant(status: string): "secondary" | "outline" | "destructive" {
  if (status === "dang_thue") return "destructive";
  if (status === "trong") return "secondary";
  return "outline";
}

function allowedGenderLabel(value: string | null) {
  return ALLOWED_GENDER_OPTIONS.find((g) => g.value === value)?.label ?? "Không giới hạn";
}

const emptyNewRoom = {
  branchId: "",
  roomName: "",
  roomType: "nguyen_can",
  capacity: "1",
  area: "",
  roomPrice: "",
  floor: "",
  areaSquareMeters: "",
  description: "",
  allowedGender: "khong_gioi_han",
  requiresQuietLifestyle: false,
  curfewTime: "",
  hasAirConditioner: false,
  hasParking: false,
};

const emptyEditRoom = {
  branchId: "",
  roomName: "",
  roomType: "nguyen_can",
  capacity: "1",
  area: "",
  roomPrice: "",
  floor: "",
  areaSquareMeters: "",
  description: "",
  allowedGender: "khong_gioi_han",
  requiresQuietLifestyle: false,
  curfewTime: "",
  hasAirConditioner: false,
  hasParking: false,
  status: "trong",
};

const emptyBedForm = { bedNumber: "", monthlyRent: "", status: "trong" };

export function RoomBedCatalog() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Room | null>(null);

  const [newRoom, setNewRoom] = useState(emptyNewRoom);
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; title: string; message: string; variant?: "warning" | "danger" | "info"; onConfirm: () => void }>({ open: false, title: "", message: "", onConfirm: () => {} });
  const [editRoom, setEditRoom] = useState(emptyEditRoom);

  // Quản lý giường
  const [isBedDialogOpen, setIsBedDialogOpen] = useState(false);
  const [bedRoom, setBedRoom] = useState<Room | null>(null);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [isBedsLoading, setIsBedsLoading] = useState(false);
  const [isBedSubmitting, setIsBedSubmitting] = useState(false);
  const [bedFormMode, setBedFormMode] = useState<"add" | "edit" | null>(null);
  const [editingBed, setEditingBed] = useState<Bed | null>(null);
  const [bedForm, setBedForm] = useState(emptyBedForm);

  const load = async () => {
    setIsLoading(true);
    try {
      const [roomsData, branchesData] = await Promise.all([roomService.getAll(), roomService.getBranches()]);
      setRooms(roomsData);
      setBranches(branchesData);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Không thể tải danh mục phòng.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredRooms = rooms.filter((r) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return r.roomName.toLowerCase().includes(term) || r.branchName.toLowerCase().includes(term);
  });

  const handleEditClick = (room: Room) => {
    setCurrentRoom(room);
    setEditRoom({
      branchId: room.branchId,
      roomName: room.roomName,
      roomType: room.roomType,
      capacity: String(room.capacity),
      area: room.area ?? "",
      roomPrice: room.roomPrice != null ? String(room.roomPrice) : "",
      floor: room.floor != null ? String(room.floor) : "",
      areaSquareMeters: room.areaSquareMeters != null ? String(room.areaSquareMeters) : "",
      description: room.description ?? "",
      allowedGender: room.allowedGender ?? "khong_gioi_han",
      requiresQuietLifestyle: room.requiresQuietLifestyle,
      curfewTime: room.curfewTime ?? "",
      hasAirConditioner: room.hasAirConditioner,
      hasParking: room.hasParking,
      status: room.status,
    });
    setIsEditDialogOpen(true);
  };

  const handleCreateSubmit = async () => {
    if (!newRoom.branchId || !newRoom.roomName) {
      toast.error("Vui lòng chọn chi nhánh và nhập tên phòng.");
      return;
    }
    setConfirmDialog({
      open: true,
      title: "Tạo phòng",
      message: `Xác nhận tạo phòng "${newRoom.roomName}"?`,
      variant: "info",
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, open: false }));
        setIsSubmitting(true);
        try {
          await roomService.create({
            branchId: newRoom.branchId,
            roomName: newRoom.roomName,
            roomType: newRoom.roomType,
            capacity: Number(newRoom.capacity) || 1,
            area: newRoom.area || undefined,
            roomPrice: newRoom.roomPrice ? Number(newRoom.roomPrice) : undefined,
            floor: newRoom.floor ? Number(newRoom.floor) : undefined,
            areaSquareMeters: newRoom.areaSquareMeters ? Number(newRoom.areaSquareMeters) : undefined,
            description: newRoom.description || undefined,
            allowedGender: newRoom.allowedGender === "khong_gioi_han" ? undefined : newRoom.allowedGender,
            requiresQuietLifestyle: newRoom.requiresQuietLifestyle,
            curfewTime: newRoom.curfewTime || undefined,
            hasAirConditioner: newRoom.hasAirConditioner,
            hasParking: newRoom.hasParking,
          });
          toast.success("Đã thêm loại phòng mới.");
          setIsAddDialogOpen(false);
          setNewRoom(emptyNewRoom);
          await load();
        } catch (err) {
          toast.error(err instanceof ApiError ? err.message : "Tạo phòng thất bại.");
        } finally {
          setIsSubmitting(false);
        }
      },
    });
  };

  const handleUpdateSubmit = async () => {
    if (!currentRoom) return;
    setConfirmDialog({
      open: true,
      title: "Cập nhật phòng",
      message: `Xác nhận cập nhật phòng "${currentRoom.roomName}"?`,
      variant: "info",
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, open: false }));
        setIsSubmitting(true);
        try {
          await roomService.update(currentRoom.roomId, {
            branchId: editRoom.branchId,
            roomName: editRoom.roomName,
            roomType: editRoom.roomType,
            capacity: Number(editRoom.capacity) || 1,
            area: editRoom.area || undefined,
            roomPrice: editRoom.roomPrice ? Number(editRoom.roomPrice) : undefined,
            floor: editRoom.floor ? Number(editRoom.floor) : undefined,
            areaSquareMeters: editRoom.areaSquareMeters ? Number(editRoom.areaSquareMeters) : undefined,
            description: editRoom.description || undefined,
            allowedGender: editRoom.allowedGender === "khong_gioi_han" ? undefined : editRoom.allowedGender,
            requiresQuietLifestyle: editRoom.requiresQuietLifestyle,
            curfewTime: editRoom.curfewTime || undefined,
            hasAirConditioner: editRoom.hasAirConditioner,
            hasParking: editRoom.hasParking,
            status: editRoom.status,
          });
          toast.success("Đã cập nhật phòng.");
          setIsEditDialogOpen(false);
          await load();
        } catch (err) {
          toast.error(err instanceof ApiError ? err.message : "Cập nhật phòng thất bại.");
        } finally {
          setIsSubmitting(false);
        }
      },
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    try {
      await roomService.remove(deleteTarget.roomId);
      toast.success(`Đã xóa phòng "${deleteTarget.roomName}".`);
      setDeleteTarget(null);
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Xóa phòng thất bại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---- Quản lý giường ----
  const loadBeds = async (roomId: string) => {
    setIsBedsLoading(true);
    try {
      const data = await bedService.getByRoomId(roomId);
      setBeds(data);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Không thể tải danh sách giường.");
    } finally {
      setIsBedsLoading(false);
    }
  };

  const handleOpenBedDialog = (room: Room) => {
    setBedRoom(room);
    setBedFormMode(null);
    setEditingBed(null);
    setIsBedDialogOpen(true);
    loadBeds(room.roomId);
  };

  const handleAddBedClick = () => {
    setBedFormMode("add");
    setEditingBed(null);
    setBedForm(emptyBedForm);
  };

  const handleEditBedClick = (bed: Bed) => {
    setBedFormMode("edit");
    setEditingBed(bed);
    setBedForm({ bedNumber: String(bed.bedNumber), monthlyRent: String(bed.monthlyRent), status: bed.status });
  };

  const handleBedFormCancel = () => {
    setBedFormMode(null);
    setEditingBed(null);
    setBedForm(emptyBedForm);
  };

  const handleBedFormSubmit = async () => {
    if (!bedRoom) return;
    const bedNumber = Number(bedForm.bedNumber);
    const monthlyRent = Number(bedForm.monthlyRent);
    if (!bedNumber || bedNumber < 1) {
      toast.error("Vui lòng nhập số giường hợp lệ.");
      return;
    }
    if (!monthlyRent || monthlyRent <= 0) {
      toast.error("Vui lòng nhập giá thuê hợp lệ.");
      return;
    }

    setIsBedSubmitting(true);
    try {
      if (bedFormMode === "edit" && editingBed) {
        await bedService.update(editingBed.bedId, { bedNumber, monthlyRent, status: bedForm.status });
        toast.success(`Đã cập nhật giường số ${bedNumber}.`);
      } else {
        await bedService.create({ roomId: bedRoom.roomId, bedNumber, monthlyRent });
        toast.success(`Đã thêm giường số ${bedNumber}.`);
      }
      handleBedFormCancel();
      await loadBeds(bedRoom.roomId);
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Lưu giường thất bại.");
    } finally {
      setIsBedSubmitting(false);
    }
  };

  const handleDeleteBed = (bed: Bed) => {
    setConfirmDialog({
      open: true,
      title: "Xóa giường",
      message: `Xác nhận xóa giường số ${bed.bedNumber}?`,
      variant: "danger",
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, open: false }));
        if (!bedRoom) return;
        setIsBedSubmitting(true);
        try {
          await bedService.remove(bed.bedId);
          toast.success(`Đã xóa giường số ${bed.bedNumber}.`);
          await loadBeds(bedRoom.roomId);
          await load();
        } catch (err) {
          toast.error(err instanceof ApiError ? err.message : "Xóa giường thất bại.");
        } finally {
          setIsBedSubmitting(false);
        }
      },
    });
  };

  const stats = [
    { label: "Tổng số phòng", value: String(rooms.length), icon: Building2 },
    { label: "Tổng số giường", value: String(rooms.reduce((sum, r) => sum + r.beds.length, 0)), icon: BedDouble },
    { label: "Chi nhánh", value: String(branches.length), icon: Layers3 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge className="mb-3">Quản lý danh mục</Badge>
          <h1 className="text-3xl font-bold text-slate-900">Danh mục phòng/giường</h1>
          <p className="mt-2 text-slate-600">
            Thêm loại phòng mới, điều chỉnh giá thuê, và duy trì sức chứa tối đa.
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open); if (!open) setNewRoom(emptyNewRoom); }}>
          <DialogTrigger asChild>
            <Button className="w-fit">
              <Plus className="h-4 w-4" />
              Thêm loại phòng
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px] max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Thêm loại phòng mới</DialogTitle>
              <DialogDescription>
                Cấu hình thông tin cho loại phòng mới trong hệ thống.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="branch">Chi nhánh</Label>
                <Select
                  value={newRoom.branchId}
                  onValueChange={(value) => setNewRoom((s) => ({ ...s, branchId: value }))}
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
              <div className="grid gap-2">
                <Label htmlFor="room-name">Tên phòng</Label>
                <Input
                  id="room-name"
                  placeholder="VD: Phòng Studio"
                  value={newRoom.roomName}
                  onChange={(e) => setNewRoom((s) => ({ ...s, roomName: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="room-type">Loại phòng</Label>
                <Select
                  value={newRoom.roomType}
                  onValueChange={(value) => setNewRoom((s) => ({ ...s, roomType: value }))}
                >
                  <SelectTrigger id="room-type">
                    <SelectValue placeholder="Chọn loại phòng" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROOM_TYPE_OPTIONS.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="capacity">Sức chứa</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min={1}
                    value={newRoom.capacity}
                    onChange={(e) => setNewRoom((s) => ({ ...s, capacity: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="area">Khu vực</Label>
                  <Input
                    id="area"
                    placeholder="VD: Tầng 2"
                    value={newRoom.area}
                    onChange={(e) => setNewRoom((s) => ({ ...s, area: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="floor">Tầng</Label>
                  <Input
                    id="floor"
                    type="number"
                    value={newRoom.floor}
                    onChange={(e) => setNewRoom((s) => ({ ...s, floor: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="area-sqm">Diện tích (m²)</Label>
                  <Input
                    id="area-sqm"
                    type="number"
                    value={newRoom.areaSquareMeters}
                    onChange={(e) => setNewRoom((s) => ({ ...s, areaSquareMeters: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Giá hàng tháng (VND)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="2000000"
                  value={newRoom.roomPrice}
                  onChange={(e) => setNewRoom((s) => ({ ...s, roomPrice: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  value={newRoom.description}
                  onChange={(e) => setNewRoom((s) => ({ ...s, description: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="allowed-gender">Giới tính cho phép</Label>
                  <Select
                    value={newRoom.allowedGender}
                    onValueChange={(value) => setNewRoom((s) => ({ ...s, allowedGender: value }))}
                  >
                    <SelectTrigger id="allowed-gender">
                      <SelectValue placeholder="Chọn giới tính" />
                    </SelectTrigger>
                    <SelectContent>
                      {ALLOWED_GENDER_OPTIONS.map((g) => (
                        <SelectItem key={g.value} value={g.value}>
                          {g.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="curfew">Giờ giới nghiêm</Label>
                  <Input
                    id="curfew"
                    type="time"
                    value={newRoom.curfewTime}
                    onChange={(e) => setNewRoom((s) => ({ ...s, curfewTime: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Toggle
                  pressed={newRoom.hasAirConditioner}
                  onPressedChange={(v) => setNewRoom((s) => ({ ...s, hasAirConditioner: v }))}
                >
                  Điều hòa
                </Toggle>
                <Toggle
                  pressed={newRoom.hasParking}
                  onPressedChange={(v) => setNewRoom((s) => ({ ...s, hasParking: v }))}
                >
                  Chỗ gửi xe
                </Toggle>
                <Toggle
                  pressed={newRoom.requiresQuietLifestyle}
                  onPressedChange={(v) => setNewRoom((s) => ({ ...s, requiresQuietLifestyle: v }))}
                >
                  Yêu cầu yên tĩnh
                </Toggle>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Hủy</Button>
              <Button disabled={isSubmitting} onClick={handleCreateSubmit}>
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Lưu loại phòng
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
          <CardTitle className="text-slate-900">Danh sách phòng</CardTitle>
          <CardDescription>Quản lý các phòng cho thuê và cài đặt sức chứa của giường.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="relative max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="pl-9"
              placeholder="Tìm kiếm theo tên phòng hoặc chi nhánh"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="rounded-2xl border border-slate-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên phòng</TableHead>
                  <TableHead>Chi nhánh</TableHead>
                  <TableHead>Số giường</TableHead>
                  <TableHead>Sức chứa tối đa</TableHead>
                  <TableHead>Giá hàng tháng</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-slate-500 py-8">
                      <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                    </TableCell>
                  </TableRow>
                ) : filteredRooms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-slate-500 py-8">
                      Không có phòng nào.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRooms.map((room) => (
                    <TableRow key={room.roomId}>
                      <TableCell className="font-medium text-slate-900">{room.roomName}</TableCell>
                      <TableCell>{room.branchName}</TableCell>
                      <TableCell>{room.beds.length}</TableCell>
                      <TableCell>{room.capacity}</TableCell>
                      <TableCell className="font-medium">
                        {room.roomPrice != null ? room.roomPrice.toLocaleString("vi-VN") + " VND" : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusBadgeVariant(room.status)}>{statusLabel(room.status)}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            aria-label="Manage beds"
                            onClick={() => handleOpenBedDialog(room)}
                          >
                            <BedDouble className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            aria-label="Edit room"
                            onClick={() => handleEditClick(room)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            aria-label="Delete room"
                            onClick={() => setDeleteTarget(room)}
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
        <DialogContent className="sm:max-w-[480px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa phòng</DialogTitle>
            <DialogDescription>
              Cập nhật cấu hình cho {currentRoom?.roomName}.
            </DialogDescription>
          </DialogHeader>
          {currentRoom && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-branch">Chi nhánh</Label>
                <Select
                  value={editRoom.branchId}
                  onValueChange={(value) => setEditRoom((s) => ({ ...s, branchId: value }))}
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
                <Label htmlFor="edit-room-name">Tên phòng</Label>
                <Input
                  id="edit-room-name"
                  value={editRoom.roomName}
                  onChange={(e) => setEditRoom((s) => ({ ...s, roomName: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-room-type">Loại phòng</Label>
                <Select
                  value={editRoom.roomType}
                  onValueChange={(value) => setEditRoom((s) => ({ ...s, roomType: value }))}
                >
                  <SelectTrigger id="edit-room-type">
                    <SelectValue placeholder="Chọn loại phòng" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROOM_TYPE_OPTIONS.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-capacity">Sức chứa</Label>
                  <Input
                    id="edit-capacity"
                    type="number"
                    value={editRoom.capacity}
                    onChange={(e) => setEditRoom((s) => ({ ...s, capacity: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-area">Khu vực</Label>
                  <Input
                    id="edit-area"
                    value={editRoom.area}
                    onChange={(e) => setEditRoom((s) => ({ ...s, area: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-floor">Tầng</Label>
                  <Input
                    id="edit-floor"
                    type="number"
                    value={editRoom.floor}
                    onChange={(e) => setEditRoom((s) => ({ ...s, floor: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-area-sqm">Diện tích (m²)</Label>
                  <Input
                    id="edit-area-sqm"
                    type="number"
                    value={editRoom.areaSquareMeters}
                    onChange={(e) => setEditRoom((s) => ({ ...s, areaSquareMeters: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-price">Giá hàng tháng (VND)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={editRoom.roomPrice}
                  onChange={(e) => setEditRoom((s) => ({ ...s, roomPrice: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Mô tả</Label>
                <Textarea
                  id="edit-description"
                  value={editRoom.description}
                  onChange={(e) => setEditRoom((s) => ({ ...s, description: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-allowed-gender">Giới tính cho phép</Label>
                  <Select
                    value={editRoom.allowedGender}
                    onValueChange={(value) => setEditRoom((s) => ({ ...s, allowedGender: value }))}
                  >
                    <SelectTrigger id="edit-allowed-gender">
                      <SelectValue placeholder="Chọn giới tính" />
                    </SelectTrigger>
                    <SelectContent>
                      {ALLOWED_GENDER_OPTIONS.map((g) => (
                        <SelectItem key={g.value} value={g.value}>
                          {g.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-curfew">Giờ giới nghiêm</Label>
                  <Input
                    id="edit-curfew"
                    type="time"
                    value={editRoom.curfewTime}
                    onChange={(e) => setEditRoom((s) => ({ ...s, curfewTime: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Trạng thái</Label>
                <Select
                  value={editRoom.status}
                  onValueChange={(value) => setEditRoom((s) => ({ ...s, status: value }))}
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROOM_STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-wrap gap-3">
                <Toggle
                  pressed={editRoom.hasAirConditioner}
                  onPressedChange={(v) => setEditRoom((s) => ({ ...s, hasAirConditioner: v }))}
                >
                  Điều hòa
                </Toggle>
                <Toggle
                  pressed={editRoom.hasParking}
                  onPressedChange={(v) => setEditRoom((s) => ({ ...s, hasParking: v }))}
                >
                  Chỗ gửi xe
                </Toggle>
                <Toggle
                  pressed={editRoom.requiresQuietLifestyle}
                  onPressedChange={(v) => setEditRoom((s) => ({ ...s, requiresQuietLifestyle: v }))}
                >
                  Yêu cầu yên tĩnh
                </Toggle>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Hủy</Button>
            <Button disabled={isSubmitting} onClick={handleUpdateSubmit}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog quản lý giường */}
      <Dialog open={isBedDialogOpen} onOpenChange={(open) => { setIsBedDialogOpen(open); if (!open) { setBedRoom(null); handleBedFormCancel(); } }}>
        <DialogContent className="sm:max-w-[560px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quản lý giường — {bedRoom?.roomName}</DialogTitle>
            <DialogDescription>
              Thêm, sửa giá/trạng thái hoặc xóa từng giường trong phòng này.
              {bedRoom && ` Giới tính cho phép: ${allowedGenderLabel(bedRoom.allowedGender)}.`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="rounded-2xl border border-slate-200">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Số giường</TableHead>
                    <TableHead>Giá thuê/tháng</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isBedsLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-slate-500 py-6">
                        <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                      </TableCell>
                    </TableRow>
                  ) : beds.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-slate-500 py-6">
                        Chưa có giường nào.
                      </TableCell>
                    </TableRow>
                  ) : (
                    beds.map((bed) => (
                      <TableRow key={bed.bedId}>
                        <TableCell className="font-medium text-slate-900">{bed.bedNumber}</TableCell>
                        <TableCell>{bed.monthlyRent.toLocaleString("vi-VN")} VND</TableCell>
                        <TableCell>
                          <Badge variant={statusBadgeVariant(bed.status)}>{statusLabel(bed.status)}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              aria-label="Edit bed"
                              onClick={() => handleEditBedClick(bed)}
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              aria-label="Delete bed"
                              onClick={() => handleDeleteBed(bed)}
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

            {bedFormMode ? (
              <div className="rounded-2xl border border-slate-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-900">
                    {bedFormMode === "edit" ? `Sửa giường số ${editingBed?.bedNumber}` : "Thêm giường mới"}
                  </h4>
                  <Button variant="ghost" size="icon" onClick={handleBedFormCancel} aria-label="Đóng">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="bed-number">Số giường</Label>
                    <Input
                      id="bed-number"
                      type="number"
                      min={1}
                      value={bedForm.bedNumber}
                      onChange={(e) => setBedForm((s) => ({ ...s, bedNumber: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="bed-rent">Giá thuê/tháng (VND)</Label>
                    <Input
                      id="bed-rent"
                      type="number"
                      value={bedForm.monthlyRent}
                      onChange={(e) => setBedForm((s) => ({ ...s, monthlyRent: e.target.value }))}
                    />
                  </div>
                </div>
                {bedFormMode === "edit" && (
                  <div className="grid gap-2">
                    <Label htmlFor="bed-status">Trạng thái</Label>
                    <Select
                      value={bedForm.status}
                      onValueChange={(value) => setBedForm((s) => ({ ...s, status: value }))}
                    >
                      <SelectTrigger id="bed-status">
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        {ROOM_STATUS_OPTIONS.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={handleBedFormCancel}>Hủy</Button>
                  <Button disabled={isBedSubmitting} onClick={handleBedFormSubmit}>
                    {isBedSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    Lưu giường
                  </Button>
                </div>
              </div>
            ) : (
              <Button variant="outline" className="w-full" onClick={handleAddBedClick}>
                <Plus className="h-4 w-4" />
                Thêm giường
              </Button>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBedDialogOpen(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa phòng?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này sẽ xóa vĩnh viễn phòng "{deleteTarget?.roomName}". Phòng còn giường sẽ không thể xóa.
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
