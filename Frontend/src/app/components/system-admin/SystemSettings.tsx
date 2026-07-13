import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Toggle } from "../ui/toggle";
import { Slider } from "../ui/slider";
import { Settings, Clock3, Percent, ShieldCheck, BellRing, Save, Loader2 } from "lucide-react";
import { ApiError } from "../../services/apiClient";
import { systemParameterService, type SystemParameter } from "../../services/system-admin/systemParameterService";
import { ConfirmDialog } from "../ui/ConfirmDialog";

const OPERATIONAL_SWITCH_IDS = ["canh_bao_qua_han", "audit_trail_phong", "khoa_bao_tri"];

export function SystemSettings() {
  const [parameters, setParameters] = useState<SystemParameter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; title: string; message: string; onConfirm: () => void }>({ open: false, title: "", message: "", onConfirm: () => {} });

  const load = async () => {
    setIsLoading(true);
    try {
      const data = await systemParameterService.getAll();
      setParameters(data);
      setDraft(Object.fromEntries(data.map((p) => [p.parameterId, p.value])));
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
  const depositRateParam = findParam("ty_le_hoan_coc");
  const paymentGraceParam = findParam("thoi_gian_mien_phi_tt");
  const slaParam = findParam("sla_phe_duyet_tk");

  const policies = [
    { param: depositRateParam, suffix: "%", icon: Percent },
    { param: paymentGraceParam, suffix: " giờ", icon: Clock3 },
    { param: slaParam, suffix: " giờ", icon: ShieldCheck },
  ].filter((p) => p.param);

  const hasChanges =
    depositRateParam && draft[depositRateParam.parameterId] !== depositRateParam.value
      ? true
      : paymentGraceParam && draft[paymentGraceParam.parameterId] !== paymentGraceParam.value
        ? true
        : slaParam && draft[slaParam.parameterId] !== slaParam.value
          ? true
          : false;

  const handleSaveChanges = () => {
    const changed = [depositRateParam, paymentGraceParam, slaParam].filter(
      (p): p is SystemParameter => !!p && draft[p.parameterId] !== p.value
    );
    if (changed.length === 0) {
      toast.info("Không có thay đổi nào để lưu.");
      return;
    }
    setConfirmDialog({
      open: true,
      title: "Lưu chính sách",
      message: `Xác nhận lưu ${changed.length} thay đổi chính sách?`,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, open: false }));
        setIsSaving(true);
        try {
          for (const p of changed) {
            await systemParameterService.update(p.parameterId, draft[p.parameterId]);
          }
          toast.success("Đã lưu thay đổi chính sách.");
          await load();
        } catch (err) {
          toast.error(err instanceof ApiError ? err.message : "Lưu thay đổi thất bại.");
        } finally {
          setIsSaving(false);
        }
      }
    });
  };

  const handleToggle = (param: SystemParameter) => {
    const nextValue = param.value === "true" ? "false" : "true";
    setConfirmDialog({
      open: true,
      title: nextValue === "true" ? "Bật tính năng" : "Tắt tính năng",
      message: `Xác nhận ${nextValue === "true" ? "bật" : "tắt"} "${param.parameterName}"?`,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, open: false }));
        try {
          await systemParameterService.update(param.parameterId, nextValue);
          toast.success(`Đã cập nhật "${param.parameterName}".`);
          await load();
        } catch (err) {
          toast.error(err instanceof ApiError ? err.message : "Cập nhật thất bại.");
        }
      }
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
            Duy trì các cài đặt toàn cầu ảnh hưởng đến vận hành, bao gồm tỷ lệ hoàn cọc, cửa sổ thanh toán, và SLA phê duyệt.
          </p>
        </div>
        <Button className="w-fit" disabled={isSaving || !hasChanges} onClick={handleSaveChanges}>
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Lưu thay đổi
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {policies.map(({ param, suffix, icon: Icon }) => (
          <Card key={param!.parameterId} className="shadow-sm border-slate-200/80">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="rounded-2xl bg-purple-50 p-3 text-purple-700">
                  <Icon className="h-6 w-6" />
                </div>
                <Badge variant="outline">{param!.isActive ? "Hoạt động" : "Tắt"}</Badge>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">{param!.parameterName}</h3>
              <p className="mt-2 text-sm text-slate-600">{param!.description}</p>
              <p className="mt-4 text-2xl font-bold text-slate-900">
                {param!.value}
                {suffix}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card className="shadow-sm border-slate-200/80">
          <CardHeader>
            <CardTitle className="text-slate-900">Trình chỉnh sửa chính sách</CardTitle>
            <CardDescription>Điều chỉnh các thông số toàn cầu được thay đổi thường xuyên.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {depositRateParam && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700">Tỷ lệ hoàn cọc</label>
                  <span className="text-sm text-slate-500">{draft[depositRateParam.parameterId]}%</span>
                </div>
                <Slider
                  value={[Number(draft[depositRateParam.parameterId] ?? 0)]}
                  max={100}
                  step={10}
                  onValueChange={([value]) =>
                    setDraft((d) => ({ ...d, [depositRateParam.parameterId]: String(value) }))
                  }
                />
                <p className="text-xs text-slate-500">{depositRateParam.description}</p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {paymentGraceParam && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Thời gian chờ thanh toán (giờ)</label>
                  <Input
                    type="number"
                    value={draft[paymentGraceParam.parameterId] ?? ""}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, [paymentGraceParam.parameterId]: e.target.value }))
                    }
                  />
                </div>
              )}
              {slaParam && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Thời gian tự động nâng cấp (giờ)</label>
                  <Input
                    type="number"
                    value={draft[slaParam.parameterId] ?? ""}
                    onChange={(e) => setDraft((d) => ({ ...d, [slaParam.parameterId]: e.target.value }))}
                  />
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button disabled={isSaving || !hasChanges} onClick={handleSaveChanges}>
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                Cam kết chính sách
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200/80">
          <CardHeader>
            <CardTitle className="text-slate-900">Công tắc vận hành</CardTitle>
            <CardDescription>Bật hoặc tắt các tính năng xuyên module mà không cần triển khai lại.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {OPERATIONAL_SWITCH_IDS.map((id) => {
              const param = findParam(id);
              if (!param) return null;
              return (
                <div key={id} className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-slate-500" />
                      <h4 className="font-medium text-slate-900">{param.parameterName}</h4>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{param.description}</p>
                  </div>
                  <Toggle
                    pressed={param.value === "true"}
                    onPressedChange={() => handleToggle(param)}
                    aria-label={param.parameterName}
                  />
                </div>
              );
            })}

            <div className="rounded-2xl bg-blue-50 p-4 text-sm text-blue-900">
              <div className="flex items-center gap-2 font-medium">
                <BellRing className="h-4 w-4" />
                Nhắc nhở xem xét thay đổi
              </div>
              <p className="mt-1 text-blue-800">
                Mọi cập nhật chính sách đều được ghi lại để kiểm toán và có thể được xem xét bởi quản trị viên hệ thống.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant="warning"
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
      />
    </div>
  );
}
