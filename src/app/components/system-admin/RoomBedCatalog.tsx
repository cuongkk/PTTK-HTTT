import { useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Building2, Plus, Search, Edit3, BadgeDollarSign, BedDouble, Layers3 } from "lucide-react";
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

export function RoomBedCatalog() {
  const [roomTypes, setRoomTypes] = useState([
    { name: "Phòng đơn", beds: 1, capacity: 1, price: "2,200,000 VND", status: "Còn phòng", occupancy: "18/20" },
    { name: "Phòng chung", beds: 2, capacity: 2, price: "1,600,000 VND", status: "Còn phòng", occupancy: "12/15" },
    { name: "Phòng cao cấp", beds: 1, capacity: 1, price: "3,200,000 VND", status: "Đã đầy", occupancy: "8/10" },
    { name: "Phòng gia đình", beds: 4, capacity: 4, price: "4,800,000 VND", status: "Đã đầy", occupancy: "6/6" },
  ]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<any>(null);

  const handleEditClick = (room: any) => {
    setCurrentRoom(room);
    setIsEditDialogOpen(true);
  };

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
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-fit">
              <Plus className="h-4 w-4" />
              Thêm loại phòng
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Thêm loại phòng mới</DialogTitle>
              <DialogDescription>
                Cấu hình thông tin cho loại phòng mới trong hệ thống.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="room-name">Tên loại phòng</Label>
                <Input id="room-name" placeholder="VD: Phòng Studio" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="beds">Số giường</Label>
                  <Input id="beds" type="number" placeholder="1" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="capacity">Sức chứa</Label>
                  <Input id="capacity" type="number" placeholder="1" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Giá hàng tháng (VND)</Label>
                <Input id="price" placeholder="2,000,000" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Hủy</Button>
              <Button type="submit" onClick={() => setIsAddDialogOpen(false)}>Lưu loại phòng</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[
          { label: "Loại phòng", value: "14", icon: Building2 },
          { label: "Loại giường", value: "8", icon: BedDouble },
          { label: "Tầng đã cấu hình", value: "6", icon: Layers3 },
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
          <CardTitle className="text-slate-900">Loại phòng</CardTitle>
          <CardDescription>Quản lý các mẫu phòng cho thuê và cài đặt sức chứa của giường.</CardDescription>
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
                  <TableHead>Loại phòng</TableHead>
                  <TableHead>Số giường</TableHead>
                  <TableHead>Sức chứa tối đa</TableHead>
                  <TableHead>Giá hàng tháng</TableHead>
                  <TableHead>Trạng thái</TableHead>
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
                          room.status === "Đã đầy"
                            ? "destructive"
                            : room.status === "Sắp hết"
                              ? "outline"
                              : "secondary"
                        }
                      >
                        {room.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          aria-label="Edit room type"
                          onClick={() => handleEditClick(room)}
                        >
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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa loại phòng</DialogTitle>
            <DialogDescription>
              Cập nhật cấu hình cho {currentRoom?.name}.
            </DialogDescription>
          </DialogHeader>
          {currentRoom && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-room-name">Tên loại phòng</Label>
                <Input id="edit-room-name" defaultValue={currentRoom.name} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-beds">Số giường</Label>
                  <Input id="edit-beds" type="number" defaultValue={currentRoom.beds} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-capacity">Sức chứa</Label>
                  <Input id="edit-capacity" type="number" defaultValue={currentRoom.capacity} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-price">Giá hàng tháng (VND)</Label>
                <Input id="edit-price" defaultValue={currentRoom.price} />
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
