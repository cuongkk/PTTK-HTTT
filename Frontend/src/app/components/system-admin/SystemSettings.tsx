import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import { Slider } from "../ui/slider";
import { Percent, Clock3, Layers3, Save, Loader2 } from "lucide-react";
import { ApiError } from "../../services/apiClient";
import { systemParameterService, type SystemParameter } from "../../services/system-admin/systemParameterService";
import { ConfirmDialog } from "../ui/ConfirmDialog";

interface ParamField {
  id: string;
  label: string;
  suffix: string;
  icon: typeof Percent;
}

const DEPOSIT_FIELDS: ParamField[] = [
  { id: "tien_coc_so_thang", label: "Số tháng dùng tính cọc", suffix: " tháng", icon: Layers3 },
  { id: "han_thanh_toan_coc", label: "Hạn thanh toán cọc", suffix: " giờ", icon: Clock3 },
];

const REFUND_FIELDS: ParamField[] = [
  { id: "hoan_coc_chua_ky", label: "Tỷ lệ hoàn trước khi ký", suffix: "%", icon: Percent },
  { id: "hoan_coc_duoi_6_thang", label: "Tỷ lệ hoàn dưới 6 tháng", suffix: "%", icon: Percent },
  { id: "hoan_coc_tren_6_thang", label: "Tỷ lệ hoàn trên 6 tháng", suffix: "%", icon: Percent },
  { id: "hoan_coc_dung_han", label: "Tỷ lệ hoàn khi hết hạn", suffix: "%", icon: Percent },
];

const ALL_FIELDS = [...DEPOSIT_FIELDS, ...REFUND_FIELDS];

export function SystemSettings() {
  const [parameters, setParameters] = useState<SystemParameter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [activeDraft, setActiveDraft] = useState<Record<string, boolean>>({});
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; title: string; message: string; onConfirm: () => void }>({ open: false, title: "", message: "", onConfirm: () => {} });

  const load = async () => {
    setIsLoading(true);
    try {
      const data = await systemParameterService.getAll();
      setParameters(data);
      setDraft(Object.fromEntries(data.map((p) => [p.parameterId, p.value])));
      setActiveDraft(Object.fromEntries(data.map((p) => [p.parameterId, p.isActive])));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Không thể tải thông số hệ thống.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const findParam = (id: string) => parameters.find((p) => p.parameterId === id);

  const changedParams = ALL_FIELDS
    .map((f) => findParam(f.id))
    .filter((p): p is SystemParameter =>
      !!p && (draft[p.parameterId] !== p.value || activeDraft[p.parameterId] !== p.isActive)
    );

  const hasChanges = changedParams.length > 0;

  const handleSaveChanges = () => {
    if (changedParams.length === 0) {
      toast.info("Không có thay đổi nào để lưu.");
      return;
    }
    setConfirmDialog({
      open: true,
      title: "Lưu chính sách",
      message: `Xác nhận lưu ${changedParams.length} thay đổi chính sách?`,
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, open: false }));
        setIsSaving(true);
        try {
          for (const p of changedParams) {
            await systemParameterService.update(
              p.parameterId,
              draft[p.parameterId],
              activeDraft[p.parameterId]
            );
          }
          toast.success("Đã lưu thay đổi chính sách.");
          await load();
        } catch (err) {
          toast.error(err instanceof ApiError ? err.message : "Lưu thay đổi thất bại.");
        } finally {
          setIsSaving(false);
        }
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge className="mb-3">Cấu hình thông số hệ thống</Badge>
          <h1 className="text-3xl font-bold text-slate-900">Thiết lập hệ thống</h1>
          <p className="mt-2 text-slate-600">
            Duy trì chính sách đặt cọc và hoàn cọc áp dụng cho toàn bộ hợp đồng thuê.
          </p>
        </div>
        <Button className="w-fit" disabled={isSaving || !hasChanges} onClick={handleSaveChanges}>
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Lưu thay đổi
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-6 md:grid-cols-3 xl:grid-cols-6">
        {ALL_FIELDS.map((field) => {
          const param = findParam(field.id);
          if (!param) return null;
          const Icon = field.icon;
          return (
            <Card key={field.id} className="shadow-sm border-slate-200/80">
              <CardContent className="pt-6">
                <div className="rounded-2xl bg-purple-50 p-3 text-purple-700 w-fit">
                  <Icon className="h-6 w-6" />
                </div>
                <p className="mt-4 text-sm text-slate-500">{field.label}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {param.value}
                  {field.suffix}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card className="shadow-sm border-slate-200/80">
          <CardHeader>
            <CardTitle className="text-slate-900">Chính sách đặt cọc</CardTitle>
            <CardDescription>Số tháng dùng để tính tiền cọc và thời hạn khách phải thanh toán.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {DEPOSIT_FIELDS.map((field) => {
              const param = findParam(field.id);
              if (!param) return null;
              return (
                <div key={field.id} className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">{field.label}</label>
                  <Input
                    type="number"
                    min={0}
                    value={draft[field.id] ?? ""}
                    onChange={(e) => setDraft((d) => ({ ...d, [field.id]: e.target.value }))}
                  />
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <Checkbox
                      checked={activeDraft[field.id] ?? false}
                      onCheckedChange={(checked) =>
                        setActiveDraft((current) => ({ ...current, [field.id]: checked === true }))
                      }
                    />
                    Đang áp dụng
                  </label>
                  {param.description && <p className="text-xs text-slate-500">{param.description}</p>}
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200/80">
          <CardHeader>
            <CardTitle className="text-slate-900">Chính sách hoàn cọc</CardTitle>
            <CardDescription>Tỷ lệ hoàn cọc áp dụng theo từng mốc thời gian chấm dứt hợp đồng.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {REFUND_FIELDS.map((field) => {
              const param = findParam(field.id);
              if (!param) return null;
              return (
                <div key={field.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-700">{field.label}</label>
                    <span className="text-sm text-slate-500">{draft[field.id] ?? 0}%</span>
                  </div>
                  <Slider
                    value={[Number(draft[field.id] ?? 0)]}
                    max={100}
                    step={5}
                    onValueChange={([value]) => setDraft((d) => ({ ...d, [field.id]: String(value) }))}
                  />
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <Checkbox
                      checked={activeDraft[field.id] ?? false}
                      onCheckedChange={(checked) =>
                        setActiveDraft((current) => ({ ...current, [field.id]: checked === true }))
                      }
                    />
                    Đang áp dụng
                  </label>
                  {param.description && <p className="text-xs text-slate-500">{param.description}</p>}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant="warning"
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}
