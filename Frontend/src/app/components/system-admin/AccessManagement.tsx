import { useEffect, useState } from "react";
import { KeyRound, Loader2, Save, ShieldCheck, Users } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { ApiError } from "../../services/apiClient";
import { systemAdminService, type AccessMatrix } from "../../services/system-admin/systemAdminService";

export function AccessManagement() {
  const [matrix, setMatrix] = useState<AccessMatrix | null>(null);
  const [draft, setDraft] = useState<Record<string, string[]>>({});
  const [savingRole, setSavingRole] = useState<string | null>(null);

  const load = async () => {
    try {
      const data = await systemAdminService.getAccessMatrix();
      setMatrix(data);
      setDraft(Object.fromEntries(data.roles.map((role) => [role.roleId, role.permissionIds])));
    } catch (error) { toast.error(error instanceof ApiError ? error.message : "Không thể tải ma trận phân quyền."); }
  };
  useEffect(() => { load(); }, []);

  const toggle = (roleId: string, permissionId: string, checked: boolean) => setDraft((current) => ({
    ...current,
    [roleId]: checked ? [...new Set([...(current[roleId] ?? []), permissionId])] : (current[roleId] ?? []).filter((id) => id !== permissionId),
  }));
  const save = async (roleId: string) => {
    setSavingRole(roleId);
    try { await systemAdminService.updateRolePermissions(roleId, draft[roleId] ?? []); toast.success("Đã cập nhật quyền của vai trò."); await load(); }
    catch (error) { toast.error(error instanceof ApiError ? error.message : "Cập nhật phân quyền thất bại."); }
    finally { setSavingRole(null); }
  };

  if (!matrix) return <div className="flex justify-center py-20"><Loader2 className="h-7 w-7 animate-spin" /></div>;
  return <div className="space-y-7">
    <div><Badge className="mb-3">Vai trò và quyền</Badge><h1 className="text-3xl font-bold text-slate-900">Phân quyền hệ thống</h1>
      <p className="mt-2 text-slate-600">Chọn các nghiệp vụ được phép thực hiện cho từng vai trò. Tài khoản nhận quyền thông qua vai trò đang được gán.</p></div>
    <div className="grid gap-4 md:grid-cols-3">
      <Card><CardContent className="pt-6"><ShieldCheck className="h-6 w-6 text-violet-600"/><p className="mt-3 text-sm text-slate-500">Vai trò</p><p className="text-3xl font-bold">{matrix.roles.length}</p></CardContent></Card>
      <Card><CardContent className="pt-6"><KeyRound className="h-6 w-6 text-blue-600"/><p className="mt-3 text-sm text-slate-500">Quyền nghiệp vụ</p><p className="text-3xl font-bold">{matrix.permissions.length}</p></CardContent></Card>
      <Card><CardContent className="pt-6"><Users className="h-6 w-6 text-emerald-600"/><p className="mt-3 text-sm text-slate-500">Tài khoản đã gán vai trò</p><p className="text-3xl font-bold">{matrix.roles.reduce((sum, role) => sum + role.accountCount, 0)}</p></CardContent></Card>
    </div>
    <div className="space-y-5">{matrix.roles.map((role) => {
      const original = [...role.permissionIds].sort().join("|");
      const changed = [...(draft[role.roleId] ?? [])].sort().join("|") !== original;
      return <Card key={role.roleId}><CardHeader className="flex-row items-start justify-between gap-4"><div><CardTitle>{role.roleName}</CardTitle>
        <p className="mt-1 text-sm text-slate-500">{role.description || "Không có mô tả"} · {role.accountCount} tài khoản</p></div>
        <Button disabled={!changed || savingRole === role.roleId} onClick={() => save(role.roleId)}>{savingRole === role.roleId ? <Loader2 className="h-4 w-4 animate-spin"/> : <Save className="h-4 w-4"/>}Lưu quyền</Button>
      </CardHeader><CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">{matrix.permissions.map((permission) => {
        const id = `${role.roleId}-${permission.permissionId}`;
        return <label key={permission.permissionId} htmlFor={id} className="flex cursor-pointer items-start gap-3 rounded-xl border p-4 hover:bg-slate-50">
          <Checkbox id={id} checked={(draft[role.roleId] ?? []).includes(permission.permissionId)} onCheckedChange={(value) => toggle(role.roleId, permission.permissionId, value === true)} />
          <span><span className="block font-medium text-slate-900">{permission.permissionName}</span><span className="mt-1 block text-xs text-slate-500">{permission.description || permission.permissionId}</span></span>
        </label>;
      })}</CardContent></Card>;
    })}</div>
  </div>;
}
