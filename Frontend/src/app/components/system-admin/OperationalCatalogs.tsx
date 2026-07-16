import { useEffect, useState } from "react";
import { Image, Loader2, Pencil, Plus, Save, ShieldCheck, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Textarea } from "../ui/textarea";
import { ApiError } from "../../services/apiClient";
import { roomService, type Branch, type Room } from "../../services/system-admin/roomService";
import { serviceCatalogService, type ServiceItem } from "../../services/system-admin/serviceCatalogService";
import { systemAdminService, type AdminAmenity, type AdminResidenceRule, type AdminRoomImage, type AdminServiceRate, type RoomAmenity, type SaveResidenceRule } from "../../services/system-admin/systemAdminService";

const today = new Date().toISOString().slice(0, 10);
const emptyRule = (branchId = ""): SaveResidenceRule => ({ branchId, title: "", content: "", ruleType: "khac", violationLevel: "nhac_nho", defaultPenaltyAmount: null, effectiveFrom: today, effectiveTo: null, status: "hieu_luc" });

export function OperationalCatalogs() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [rules, setRules] = useState<AdminResidenceRule[]>([]);
  const [amenities, setAmenities] = useState<AdminAmenity[]>([]);
  const [images, setImages] = useState<AdminRoomImage[]>([]);
  const [rates, setRates] = useState<AdminServiceRate[]>([]);

  const [ruleId, setRuleId] = useState<string | null>(null);
  const [ruleForm, setRuleForm] = useState<SaveResidenceRule>(emptyRule());
  const [amenityId, setAmenityId] = useState<string | null>(null);
  const [amenityForm, setAmenityForm] = useState({ amenityName: "", description: "", isActive: true });
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [roomAmenities, setRoomAmenities] = useState<RoomAmenity[]>([]);
  const [roomAmenityForm, setRoomAmenityForm] = useState({ amenityId: "", quantity: 1, note: "" });
  const [imageId, setImageId] = useState<string | null>(null);
  const [imageForm, setImageForm] = useState({ imageUrl: "", description: "", displayOrder: 1, isPrimary: false });
  const [rateId, setRateId] = useState<string | null>(null);
  const [rateForm, setRateForm] = useState({ serviceId: "", scopeType: "chi_nhanh", targetId: "", unitPrice: 0, isActive: true });

  const errorMessage = (error: unknown, fallback: string) => error instanceof ApiError ? error.message : fallback;
  const load = async () => {
    setLoading(true);
    try {
      const [branchData, roomData, serviceData, ruleData, amenityData, imageData, rateData] = await Promise.all([
        roomService.getBranches(), roomService.getAll(), serviceCatalogService.getAll(), systemAdminService.getResidenceRules(),
        systemAdminService.getAmenities(), systemAdminService.getRoomImages(), systemAdminService.getServiceRates(),
      ]);
      setBranches(branchData); setRooms(roomData); setServices(serviceData); setRules(ruleData); setAmenities(amenityData); setImages(imageData); setRates(rateData);
      const firstRoom = selectedRoomId || roomData[0]?.roomId || "";
      setSelectedRoomId(firstRoom);
      if (!ruleForm.branchId && branchData[0]) setRuleForm(emptyRule(branchData[0].branchId));
      if (firstRoom) setRoomAmenities(await systemAdminService.getRoomAmenities(firstRoom));
    } catch (error) { toast.error(errorMessage(error, "Không thể tải danh mục vận hành.")); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const reloadRoomAmenities = async (roomId: string) => { setSelectedRoomId(roomId); setRoomAmenities(roomId ? await systemAdminService.getRoomAmenities(roomId) : []); };
  const runSave = async (action: () => Promise<unknown>, success: string) => {
    setSaving(true); try { await action(); toast.success(success); await load(); } catch (error) { toast.error(errorMessage(error, "Không thể lưu thay đổi.")); } finally { setSaving(false); }
  };

  const saveRule = () => {
    if (!ruleForm.branchId || !ruleForm.title.trim() || !ruleForm.content.trim()) return toast.error("Nhập đầy đủ chi nhánh, tiêu đề và nội dung nội quy.");
    runSave(() => ruleId ? systemAdminService.updateResidenceRule(ruleId, ruleForm) : systemAdminService.createResidenceRule(ruleForm), "Đã lưu nội quy.");
    setRuleId(null); setRuleForm(emptyRule(branches[0]?.branchId));
  };
  const editRule = (x: AdminResidenceRule) => { setRuleId(x.residenceRuleId); setRuleForm({ branchId: x.branchId, title: x.title, content: x.content, ruleType: x.ruleType, violationLevel: x.violationLevel, defaultPenaltyAmount: x.defaultPenaltyAmount, effectiveFrom: x.effectiveFrom, effectiveTo: x.effectiveTo, status: x.status }); };

  const saveAmenity = () => {
    if (!amenityForm.amenityName.trim()) return toast.error("Nhập tên tiện nghi.");
    runSave(() => amenityId ? systemAdminService.updateAmenity(amenityId, amenityForm) : systemAdminService.createAmenity(amenityForm), "Đã lưu tiện nghi.");
    setAmenityId(null); setAmenityForm({ amenityName: "", description: "", isActive: true });
  };
  const editAmenity = (x: AdminAmenity) => { setAmenityId(x.amenityId); setAmenityForm({ amenityName: x.amenityName, description: x.description ?? "", isActive: x.isActive }); };
  const saveRoomAmenity = async () => {
    if (!selectedRoomId || !roomAmenityForm.amenityId) return toast.error("Chọn phòng và tiện nghi.");
    setSaving(true); try { await systemAdminService.saveRoomAmenity(selectedRoomId, roomAmenityForm); toast.success("Đã cập nhật tiện nghi của phòng."); await reloadRoomAmenities(selectedRoomId); setRoomAmenityForm({ amenityId: "", quantity: 1, note: "" }); }
    catch (error) { toast.error(errorMessage(error, "Không thể lưu tiện nghi phòng.")); } finally { setSaving(false); }
  };

  const saveImage = () => {
    if (!selectedRoomId || !imageForm.imageUrl.trim()) return toast.error("Chọn phòng và nhập đường dẫn ảnh.");
    runSave(() => imageId ? systemAdminService.updateRoomImage(imageId, imageForm) : systemAdminService.createRoomImage(selectedRoomId, imageForm), "Đã lưu ảnh phòng.");
    setImageId(null); setImageForm({ imageUrl: "", description: "", displayOrder: 1, isPrimary: false });
  };
  const editImage = (x: AdminRoomImage) => { setSelectedRoomId(x.roomId); setImageId(x.roomImageId); setImageForm({ imageUrl: x.imageUrl, description: x.description ?? "", displayOrder: x.displayOrder, isPrimary: x.isPrimary }); };

  const saveRate = () => {
    if (!rateForm.serviceId || !rateForm.targetId || rateForm.unitPrice < 0) return toast.error("Chọn dịch vụ, phạm vi áp dụng và nhập đơn giá hợp lệ.");
    runSave(() => rateId ? systemAdminService.updateServiceRate(rateId, rateForm) : systemAdminService.createServiceRate(rateForm), "Đã lưu giá dịch vụ áp dụng.");
    setRateId(null); setRateForm({ serviceId: "", scopeType: "chi_nhanh", targetId: "", unitPrice: 0, isActive: true });
  };
  const editRate = (x: AdminServiceRate) => { setRateId(x.serviceRateId); setRateForm({ serviceId: x.serviceId, scopeType: x.scopeType, targetId: x.targetId, unitPrice: x.unitPrice, isActive: x.isActive }); };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-7 w-7 animate-spin" /></div>;
  return <div className="space-y-7">
    <div><Badge className="mb-3">Danh mục phụ</Badge><h1 className="text-3xl font-bold text-slate-900">Danh mục vận hành</h1><p className="mt-2 text-slate-600">Nội quy theo chi nhánh, tiện nghi và ảnh phòng, cùng giá dịch vụ áp dụng riêng.</p></div>
    <Tabs defaultValue="rules"><TabsList className="grid h-auto w-full grid-cols-2 gap-2 md:grid-cols-4">
      <TabsTrigger value="rules">Nội quy</TabsTrigger><TabsTrigger value="amenities">Tiện nghi</TabsTrigger><TabsTrigger value="images">Ảnh phòng</TabsTrigger><TabsTrigger value="rates">Giá dịch vụ</TabsTrigger>
    </TabsList>

      <TabsContent value="rules" className="space-y-5"><Card><CardHeader><CardTitle>{ruleId ? "Sửa nội quy" : "Thêm nội quy"}</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Field label="Chi nhánh"><Select value={ruleForm.branchId} onValueChange={(branchId) => setRuleForm({ ...ruleForm, branchId })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{branches.map(x => <SelectItem key={x.branchId} value={x.branchId}>{x.branchName}</SelectItem>)}</SelectContent></Select></Field>
        <Field label="Tiêu đề"><Input value={ruleForm.title} onChange={e => setRuleForm({ ...ruleForm, title: e.target.value })}/></Field>
        <Field label="Loại nội quy"><Select value={ruleForm.ruleType} onValueChange={(ruleType) => setRuleForm({ ...ruleForm, ruleType })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{[["gio_giac","Giờ giấc"],["trat_tu","Trật tự"],["luu_tru","Lưu trú"],["tai_san","Tài sản"],["khac","Khác"]].map(([v,l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent></Select></Field>
        <Field label="Mức xử lý"><Select value={ruleForm.violationLevel} onValueChange={(violationLevel) => setRuleForm({ ...ruleForm, violationLevel })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{[["nhac_nho","Nhắc nhở"],["khau_tru_coc","Khấu trừ cọc"],["boi_thuong","Bồi thường"]].map(([v,l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent></Select></Field>
        <Field label="Ngày hiệu lực"><Input type="date" value={ruleForm.effectiveFrom} onChange={e => setRuleForm({ ...ruleForm, effectiveFrom: e.target.value })}/></Field>
        <Field label="Ngày hết hiệu lực"><Input type="date" value={ruleForm.effectiveTo ?? ""} onChange={e => setRuleForm({ ...ruleForm, effectiveTo: e.target.value || null })}/></Field>
        <Field label="Mức phạt mặc định"><Input type="number" min={0} value={ruleForm.defaultPenaltyAmount ?? ""} onChange={e => setRuleForm({ ...ruleForm, defaultPenaltyAmount: e.target.value ? Number(e.target.value) : null })}/></Field>
        <Field label="Trạng thái"><Select value={ruleForm.status} onValueChange={(status) => setRuleForm({ ...ruleForm, status })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="hieu_luc">Hiệu lực</SelectItem><SelectItem value="het_hieu_luc">Hết hiệu lực</SelectItem></SelectContent></Select></Field>
        <div className="md:col-span-2 xl:col-span-4"><Field label="Nội dung"><Textarea value={ruleForm.content} onChange={e => setRuleForm({ ...ruleForm, content: e.target.value })}/></Field></div>
        <div className="flex gap-2 md:col-span-2 xl:col-span-4"><Button disabled={saving} onClick={saveRule}><Save className="h-4 w-4"/>Lưu nội quy</Button>{ruleId && <Button variant="outline" onClick={() => { setRuleId(null); setRuleForm(emptyRule(branches[0]?.branchId)); }}>Hủy sửa</Button>}</div>
      </CardContent></Card><div className="grid gap-4 lg:grid-cols-2">{rules.map(x => <Card key={x.residenceRuleId}><CardContent className="pt-6"><div className="flex justify-between gap-3"><div><Badge variant="outline">{x.branchName}</Badge><h3 className="mt-3 font-semibold">{x.title}</h3></div><Button size="icon" variant="outline" onClick={() => editRule(x)}><Pencil className="h-4 w-4"/></Button></div><p className="mt-3 text-sm text-slate-600">{x.content}</p><p className="mt-3 text-xs text-slate-500">{x.status === "hieu_luc" ? "Đang hiệu lực" : "Hết hiệu lực"} · từ {new Date(x.effectiveFrom).toLocaleDateString("vi-VN")}</p></CardContent></Card>)}</div></TabsContent>

      <TabsContent value="amenities" className="space-y-5"><div className="grid gap-5 xl:grid-cols-2"><Card><CardHeader><CardTitle>Danh mục tiện nghi</CardTitle></CardHeader><CardContent className="space-y-4"><Field label="Tên tiện nghi"><Input value={amenityForm.amenityName} onChange={e => setAmenityForm({ ...amenityForm, amenityName: e.target.value })}/></Field><Field label="Mô tả"><Textarea value={amenityForm.description} onChange={e => setAmenityForm({ ...amenityForm, description: e.target.value })}/></Field><Check label="Đang sử dụng" checked={amenityForm.isActive} onChange={isActive => setAmenityForm({ ...amenityForm, isActive })}/><Button disabled={saving} onClick={saveAmenity}><Save className="h-4 w-4"/>Lưu tiện nghi</Button><div className="divide-y">{amenities.map(x => <div key={x.amenityId} className="flex items-center justify-between py-3"><div><p className="font-medium">{x.amenityName}</p><p className="text-xs text-slate-500">{x.roomCount} phòng · {x.isActive ? "Đang dùng" : "Ngừng dùng"}</p></div><Button size="icon" variant="outline" onClick={() => editAmenity(x)}><Pencil className="h-4 w-4"/></Button></div>)}</div></CardContent></Card>
        <Card><CardHeader><CardTitle>Tiện nghi của phòng</CardTitle></CardHeader><CardContent className="space-y-4"><RoomSelect rooms={rooms} value={selectedRoomId} onChange={reloadRoomAmenities}/><Field label="Tiện nghi"><Select value={roomAmenityForm.amenityId} onValueChange={amenityId => setRoomAmenityForm({ ...roomAmenityForm, amenityId })}><SelectTrigger><SelectValue placeholder="Chọn tiện nghi"/></SelectTrigger><SelectContent>{amenities.filter(x => x.isActive).map(x => <SelectItem key={x.amenityId} value={x.amenityId}>{x.amenityName}</SelectItem>)}</SelectContent></Select></Field><div className="grid grid-cols-2 gap-3"><Field label="Số lượng"><Input type="number" min={1} value={roomAmenityForm.quantity} onChange={e => setRoomAmenityForm({ ...roomAmenityForm, quantity: Number(e.target.value) })}/></Field><Field label="Ghi chú"><Input value={roomAmenityForm.note} onChange={e => setRoomAmenityForm({ ...roomAmenityForm, note: e.target.value })}/></Field></div><Button disabled={saving} onClick={saveRoomAmenity}><Plus className="h-4 w-4"/>Gán tiện nghi</Button><div className="divide-y">{roomAmenities.map(x => <div key={x.amenityId} className="flex items-center justify-between py-3"><div><p className="font-medium">{x.amenityName} × {x.quantity}</p><p className="text-xs text-slate-500">{x.note || "Không có ghi chú"}</p></div><Button size="icon" variant="outline" onClick={async () => { await systemAdminService.removeRoomAmenity(selectedRoomId, x.amenityId); await reloadRoomAmenities(selectedRoomId); }}><Trash2 className="h-4 w-4"/></Button></div>)}</div></CardContent></Card></div></TabsContent>

      <TabsContent value="images" className="space-y-5"><Card><CardHeader><CardTitle>{imageId ? "Sửa ảnh phòng" : "Thêm ảnh phòng"}</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-2"><RoomSelect rooms={rooms} value={selectedRoomId} onChange={setSelectedRoomId}/><Field label="Đường dẫn ảnh"><Input value={imageForm.imageUrl} onChange={e => setImageForm({ ...imageForm, imageUrl: e.target.value })}/></Field><Field label="Mô tả"><Input value={imageForm.description} onChange={e => setImageForm({ ...imageForm, description: e.target.value })}/></Field><Field label="Thứ tự"><Input type="number" min={0} value={imageForm.displayOrder} onChange={e => setImageForm({ ...imageForm, displayOrder: Number(e.target.value) })}/></Field><Check label="Ảnh đại diện" checked={imageForm.isPrimary} onChange={isPrimary => setImageForm({ ...imageForm, isPrimary })}/><div><Button disabled={saving} onClick={saveImage}><Image className="h-4 w-4"/>Lưu ảnh</Button></div></CardContent></Card><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{images.map(x => <Card key={x.roomImageId} className="overflow-hidden"><img src={x.imageUrl} alt={x.description || x.roomName} className="h-44 w-full bg-slate-100 object-cover"/><CardContent className="pt-4"><div className="flex justify-between"><div><p className="font-medium">{x.roomName}</p><p className="text-xs text-slate-500">{x.isPrimary ? "Ảnh đại diện" : `Thứ tự ${x.displayOrder}`}</p></div><div className="flex gap-2"><Button size="icon" variant="outline" onClick={() => editImage(x)}><Pencil className="h-4 w-4"/></Button><Button size="icon" variant="outline" onClick={() => runSave(() => systemAdminService.deleteRoomImage(x.roomImageId), "Đã xóa ảnh phòng.")}><Trash2 className="h-4 w-4"/></Button></div></div></CardContent></Card>)}</div></TabsContent>

      <TabsContent value="rates" className="space-y-5"><Card><CardHeader><CardTitle>{rateId ? "Sửa giá áp dụng" : "Thêm giá áp dụng"}</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-5"><Field label="Dịch vụ"><Select value={rateForm.serviceId} onValueChange={serviceId => setRateForm({ ...rateForm, serviceId })}><SelectTrigger><SelectValue placeholder="Chọn dịch vụ"/></SelectTrigger><SelectContent>{services.map(x => <SelectItem key={x.serviceId} value={x.serviceId}>{x.serviceName}</SelectItem>)}</SelectContent></Select></Field><Field label="Phạm vi"><Select value={rateForm.scopeType} onValueChange={scopeType => setRateForm({ ...rateForm, scopeType, targetId: "" })}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="chi_nhanh">Chi nhánh</SelectItem><SelectItem value="phong">Phòng</SelectItem></SelectContent></Select></Field><Field label={rateForm.scopeType === "phong" ? "Phòng" : "Chi nhánh"}><Select value={rateForm.targetId} onValueChange={targetId => setRateForm({ ...rateForm, targetId })}><SelectTrigger><SelectValue placeholder="Chọn nơi áp dụng"/></SelectTrigger><SelectContent>{(rateForm.scopeType === "phong" ? rooms.map(x => [x.roomId,x.roomName]) : branches.map(x => [x.branchId,x.branchName])).map(([id,name]) => <SelectItem key={id} value={id}>{name}</SelectItem>)}</SelectContent></Select></Field><Field label="Đơn giá"><Input type="number" min={0} value={rateForm.unitPrice} onChange={e => setRateForm({ ...rateForm, unitPrice: Number(e.target.value) })}/></Field><div className="space-y-3"><Check label="Đang áp dụng" checked={rateForm.isActive} onChange={isActive => setRateForm({ ...rateForm, isActive })}/><Button disabled={saving} onClick={saveRate}><Save className="h-4 w-4"/>Lưu giá</Button></div></CardContent></Card><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{rates.map(x => <Card key={x.serviceRateId}><CardContent className="pt-6"><div className="flex justify-between"><div><Sparkles className="h-5 w-5 text-amber-600"/><p className="mt-3 font-semibold">{x.serviceName}</p><p className="text-sm text-slate-600">{x.scopeType === "phong" ? "Phòng" : "Chi nhánh"}: {x.targetName}</p><p className="mt-2 text-lg font-bold">{x.unitPrice.toLocaleString("vi-VN")} đ</p></div><div className="flex gap-2"><Button size="icon" variant="outline" onClick={() => editRate(x)}><Pencil className="h-4 w-4"/></Button><Button size="icon" variant="outline" onClick={() => runSave(() => systemAdminService.deleteServiceRate(x.serviceRateId), "Đã xóa giá áp dụng.")}><Trash2 className="h-4 w-4"/></Button></div></div></CardContent></Card>)}</div></TabsContent>
    </Tabs>
  </div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div className="space-y-2"><Label>{label}</Label>{children}</div>; }
function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) { return <label className="flex items-center gap-2"><Checkbox checked={checked} onCheckedChange={value => onChange(value === true)}/><span className="text-sm">{label}</span></label>; }
function RoomSelect({ rooms, value, onChange }: { rooms: Room[]; value: string; onChange: (value: string) => void }) { return <Field label="Phòng"><Select value={value} onValueChange={onChange}><SelectTrigger><SelectValue placeholder="Chọn phòng"/></SelectTrigger><SelectContent>{rooms.map(x => <SelectItem key={x.roomId} value={x.roomId}>{x.roomName} · {x.branchName}</SelectItem>)}</SelectContent></Select></Field>; }
