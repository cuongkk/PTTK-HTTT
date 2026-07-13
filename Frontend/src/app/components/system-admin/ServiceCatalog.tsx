import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { DollarSign, Plus, Search, Edit3, Trash2, PlugZap, Loader2 } from "lucide-react";
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
import { serviceCatalogService, type ServiceItem } from "../../services/system-admin/serviceCatalogService";
import { ConfirmDialog } from "../ui/ConfirmDialog";

const SERVICE_TYPE_OPTIONS = [
  { value: "dien", label: "Điện" },
  { value: "nuoc", label: "Nước" },
  { value: "wifi", label: "Wi-Fi" },
  { value: "ve_sinh", label: "Dọn dẹp" },
  { value: "khac", label: "Khác" },
];

function typeLabel(type: string) {
  return SERVICE_TYPE_OPTIONS.find((t) => t.value === type)?.label ?? type;
}

const emptyNewService = { serviceName: "", serviceType: "dien", unit: "", unitPrice: "", description: "" };

export function ServiceCatalog() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentService, setCurrentService] = useState<ServiceItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ServiceItem | null>(null);

  const [newService, setNewService] = useState(emptyNewService);
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; title: string; message: string; onConfirm: () => void }>({ open: false, title: "", message: "", onConfirm: () => {} });
  const [editService, setEditService] = useState({
    serviceName: "",
    serviceType: "dien",
    unit: "",
    unitPrice: "",
    description: "",
    isActive: true,
  });

  const load = async () => {
    setIsLoading(true);
    try {
      const data = await serviceCatalogService.getAll();
      setServices(data);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Không thể tải danh mục dịch vụ.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredServices = services.filter((s) =>
    s.serviceName.toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

  const handleEditClick = (service: ServiceItem) => {
    setCurrentService(service);
    setEditService({
      serviceName: service.serviceName,
      serviceType: service.serviceType,
      unit: service.unit,
      unitPrice: String(service.unitPrice),
      description: service.description ?? "",
      isActive: service.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const handleCreateSubmit = async () => {
    if (!newService.serviceName || !newService.unit || !newService.unitPrice) {
      toast.error("Vui lòng nhập đầy đủ tên, đơn vị và giá dịch vụ.");
      return;
    }
    if (Number(newService.unitPrice) < 0) {
      toast.error("Đơn giá không được âm.");
      return;
    }
    setConfirmDialog({
      open: true,
      title: "Tạo dịch vụ",
      message: `Xác nhận tạo dịch vụ "${newService.serviceName}"?`,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, open: false }));
        setIsSubmitting(true);
        try {
          await serviceCatalogService.create({
            serviceName: newService.serviceName,
            serviceType: newService.serviceType,
            unit: newService.unit,
            unitPrice: Number(newService.unitPrice) || 0,
            description: newService.description || undefined,
          });
          toast.success("Đã thêm dịch vụ mới.");
          setIsAddDialogOpen(false);
          setNewService(emptyNewService);
          await load();
        } catch (err) {
          toast.error(err instanceof ApiError ? err.message : "Tạo dịch vụ thất bại.");
        } finally {
          setIsSubmitting(false);
        }
      }
    });
  };

  const handleUpdateSubmit = async () => {
    if (!currentService) return;
    if (Number(editService.unitPrice) < 0) {
      toast.error("Đơn giá không được âm.");
      return;
    }
    setConfirmDialog({
      open: true,
      title: "Cập nhật dịch vụ",
      message: `Xác nhận cập nhật dịch vụ "${currentService.serviceName}"?`,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, open: false }));
        setIsSubmitting(true);
        try {
          await serviceCatalogService.update(currentService.serviceId, {
            serviceName: editService.serviceName,
            serviceType: editService.serviceType,
            unit: editService.unit,
            unitPrice: Number(editService.unitPrice) || 0,
            description: editService.description || undefined,
            isActive: editService.isActive,
          });
          toast.success("Đã cập nhật dịch vụ.");
          setIsEditDialogOpen(false);
          await load();
        } catch (err) {
          toast.error(err instanceof ApiError ? err.message : "Cập nhật dịch vụ thất bại.");
        } finally {
          setIsSubmitting(false);
        }
      }
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    try {
      await serviceCatalogService.remove(deleteTarget.serviceId);
      toast.success(`Đã xóa dịch vụ "${deleteTarget.serviceName}".`);
      setDeleteTarget(null);
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Xóa dịch vụ thất bại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const stats = [
    { label: "Dịch vụ đang hoạt động", value: String(services.filter((s) => s.isActive).length), icon: DollarSign },
    { label: "Tổng số dịch vụ", value: String(services.length), icon: PlugZap },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge className="mb-3">Quản lý phí</Badge>
          <h1 className="text-3xl font-bold text-slate-900">Danh mục dịch vụ</h1>
          <p className="mt-2 text-slate-600">
            Duy trì các khoản phí tiện ích và dịch vụ bổ sung được sử dụng trong các hợp đồng cho thuê.
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-fit">
              <Plus className="h-4 w-4" />
              Thêm dịch vụ
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Thêm dịch vụ mới</DialogTitle>
              <DialogDescription>
                Tạo một loại dịch vụ hoặc tiện ích mới để tính phí.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="service-name">Tên dịch vụ</Label>
                <Input
                  id="service-name"
                  placeholder="VD: Gửi xe"
                  value={newService.serviceName}
                  onChange={(e) => setNewService((s) => ({ ...s, serviceName: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="category">Loại</Label>
                  <Select
                    value={newService.serviceType}
                    onValueChange={(value) => setNewService((s) => ({ ...s, serviceType: value }))}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Chọn loại" />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICE_TYPE_OPTIONS.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="unit">Đơn vị</Label>
                  <Input
                    id="unit"
                    placeholder="VD: xe/tháng"
                    value={newService.unit}
                    onChange={(e) => setNewService((s) => ({ ...s, unit: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="service-price">Giá đơn vị (VND)</Label>
                <Input
                  id="service-price"
                  type="number"
                  min="0"
                  placeholder="100000"
                  value={newService.unitPrice}
                  onChange={(e) => setNewService((s) => ({ ...s, unitPrice: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Hủy</Button>
              <Button disabled={isSubmitting} onClick={handleCreateSubmit}>
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Lưu dịch vụ
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {stats.map((stat) => {
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
          <CardTitle className="text-slate-900">Danh sách giá dịch vụ</CardTitle>
          <CardDescription>Cập nhật tỷ lệ đơn vị cho điện, nước, Wi-Fi và phí dọn dẹp.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="relative max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="pl-9"
              placeholder="Search service name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="rounded-2xl border border-slate-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dịch vụ</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Đơn vị</TableHead>
                  <TableHead>Giá đơn vị</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-slate-500 py-8">
                      <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                    </TableCell>
                  </TableRow>
                ) : filteredServices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-slate-500 py-8">
                      Không có dịch vụ nào.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredServices.map((service) => (
                    <TableRow key={service.serviceId}>
                      <TableCell className="font-medium text-slate-900">{service.serviceName}</TableCell>
                      <TableCell>{typeLabel(service.serviceType)}</TableCell>
                      <TableCell>{service.unit}</TableCell>
                      <TableCell className="font-medium">{service.unitPrice.toLocaleString("vi-VN")} VND</TableCell>
                      <TableCell>
                        <Badge variant={service.isActive ? "secondary" : "destructive"}>
                          {service.isActive ? "Hoạt động" : "Ngừng"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            aria-label="Edit service"
                            onClick={() => handleEditClick(service)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            aria-label="Delete service"
                            onClick={() => setDeleteTarget(service)}
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
            <DialogTitle>Chỉnh sửa dịch vụ</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin và đơn giá cho dịch vụ {currentService?.serviceName}.
            </DialogDescription>
          </DialogHeader>
          {currentService && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-service-name">Tên dịch vụ</Label>
                <Input
                  id="edit-service-name"
                  value={editService.serviceName}
                  onChange={(e) => setEditService((s) => ({ ...s, serviceName: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-category">Loại</Label>
                  <Select
                    value={editService.serviceType}
                    onValueChange={(value) => setEditService((s) => ({ ...s, serviceType: value }))}
                  >
                    <SelectTrigger id="edit-category">
                      <SelectValue placeholder="Chọn loại" />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICE_TYPE_OPTIONS.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-unit">Đơn vị</Label>
                  <Input
                    id="edit-unit"
                    value={editService.unit}
                    onChange={(e) => setEditService((s) => ({ ...s, unit: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-service-price">Giá đơn vị (VND)</Label>
                <Input
                  id="edit-service-price"
                  type="number"
                  min="0"
                  value={editService.unitPrice}
                  onChange={(e) => setEditService((s) => ({ ...s, unitPrice: e.target.value }))}
                />
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

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa dịch vụ?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này sẽ xóa vĩnh viễn dịch vụ "{deleteTarget?.serviceName}". Bạn không thể hoàn tác sau khi xác nhận.
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
        variant="info"
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
      />
    </div>
  );
}
