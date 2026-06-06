import { useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { DollarSign, Plus, Search, Edit3, Trash2, PlugZap, Droplets, Wifi, Sparkles } from "lucide-react";
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

export function ServiceCatalog() {
  const [services, setServices] = useState([
    { name: "Điện", unit: "kWh", price: "3,500 VND", category: "Utility", icon: PlugZap },
    { name: "Nước", unit: "m3", price: "15,000 VND", category: "Utility", icon: Droplets },
    { name: "Wi-Fi", unit: "month", price: "120,000 VND", category: "Connectivity", icon: Wifi },
    { name: "Dọn dẹp", unit: "visit", price: "80,000 VND", category: "Service", icon: Sparkles },
  ]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentService, setCurrentService] = useState<any>(null);

  const handleEditClick = (service: any) => {
    setCurrentService(service);
    setIsEditDialogOpen(true);
  };

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
                <Input id="service-name" placeholder="VD: Gửi xe" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="category">Loại</Label>
                  <Select defaultValue="Service">
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Chọn loại" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Utility">Tiện ích</SelectItem>
                      <SelectItem value="Connectivity">Kết nối</SelectItem>
                      <SelectItem value="Service">Dịch vụ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="unit">Đơn vị</Label>
                  <Input id="unit" placeholder="VD: xe/tháng" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="service-price">Giá đơn vị (VND)</Label>
                <Input id="service-price" placeholder="100,000" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Hủy</Button>
              <Button type="submit" onClick={() => setIsAddDialogOpen(false)}>Lưu dịch vụ</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[
          { label: "Dịch vụ đang hoạt động", value: "9", icon: DollarSign },
          { label: "Mục tiện ích", value: "4", icon: PlugZap },
          { label: "Cập nhật hàng tháng", value: "2", icon: Trash2 },
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
          <CardTitle className="text-slate-900">Danh sách giá dịch vụ</CardTitle>
          <CardDescription>Cập nhật tỷ lệ đơn vị cho điện, nước, Wi-Fi và phí dọn dẹp.</CardDescription>
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
                  <TableHead>Dịch vụ</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Đơn vị</TableHead>
                  <TableHead>Giá đơn vị</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
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
                        <Badge variant="secondary">Hoạt động</Badge>
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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa dịch vụ</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin và đơn giá cho dịch vụ {currentService?.name}.
            </DialogDescription>
          </DialogHeader>
          {currentService && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-service-name">Tên dịch vụ</Label>
                <Input id="edit-service-name" defaultValue={currentService.name} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-category">Loại</Label>
                  <Select defaultValue={currentService.category}>
                    <SelectTrigger id="edit-category">
                      <SelectValue placeholder="Chọn loại" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Utility">Tiện ích</SelectItem>
                      <SelectItem value="Connectivity">Kết nối</SelectItem>
                      <SelectItem value="Service">Dịch vụ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-unit">Đơn vị</Label>
                  <Input id="edit-unit" defaultValue={currentService.unit} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-service-price">Giá đơn vị (VND)</Label>
                <Input id="edit-service-price" defaultValue={currentService.price} />
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
