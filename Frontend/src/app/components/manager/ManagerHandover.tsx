import { useEffect, useState } from "react";
import { ClipboardCheck, Send } from "lucide-react";
import { managerHandoverService, type ManagerHandoverContract } from "../../services/managerHandoverService";

export function ManagerHandover() {
  const [contracts, setContracts] = useState<ManagerHandoverContract[]>([]);
  const [selected, setSelected] = useState<ManagerHandoverContract | null>(null);
  const [roomCondition, setRoomCondition] = useState("Phòng sạch, thiết bị hoạt động bình thường.");
  const [electricity, setElectricity] = useState("");
  const [water, setWater] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => managerHandoverService.getPending().then(setContracts).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const open = (contract: ManagerHandoverContract) => { setSelected(contract); setError(""); };
  const submit = async () => {
    if (!selected || !roomCondition.trim()) return;
    setSaving(true); setError("");
    try {
      await managerHandoverService.create({
        contractId: selected.contractId, roomCondition: roomCondition.trim(),
        initialElectricityReading: electricity ? Number(electricity) : undefined,
        initialWaterReading: water ? Number(water) : undefined, note: note.trim() || undefined,
        assets: selected.assets,
      });
      setSelected(null); await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Không thể lập biên bản bàn giao."); }
    finally { setSaving(false); }
  };

  return <div className="space-y-6">
    <div><h1 className="text-3xl font-bold text-gray-900">Bàn giao nhận phòng</h1><p className="mt-1 text-sm text-gray-500">Lập biên bản và gửi Khách hàng xác nhận.</p></div>
    {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
    <div className="space-y-3">
      {contracts.length === 0 ? <div className="rounded-xl border bg-white p-8 text-center text-gray-500">Không có hợp đồng chờ lập biên bản bàn giao.</div> : contracts.map((contract) => <div key={contract.contractId} className="flex items-center justify-between rounded-xl border bg-white p-5 shadow-sm">
        <div><p className="font-bold text-gray-900">{contract.roomName} — {contract.customerName}</p><p className="mt-1 text-sm text-gray-500">{contract.contractId} · Nhận phòng {new Date(contract.startDate).toLocaleDateString("vi-VN")}</p></div>
        <button onClick={() => open(contract)} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"><ClipboardCheck className="h-4 w-4" />Lập biên bản</button>
      </div>)}
    </div>
    {selected && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-2xl">
      <h2 className="text-xl font-bold">Biên bản bàn giao — {selected.roomName}</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium">Chỉ số điện đầu<input value={electricity} onChange={(e) => setElectricity(e.target.value)} type="number" min="0" className="mt-1 w-full rounded-lg border px-3 py-2" /></label>
        <label className="text-sm font-medium">Chỉ số nước đầu<input value={water} onChange={(e) => setWater(e.target.value)} type="number" min="0" className="mt-1 w-full rounded-lg border px-3 py-2" /></label>
      </div>
      <label className="mt-4 block text-sm font-medium">Hiện trạng phòng<textarea value={roomCondition} onChange={(e) => setRoomCondition(e.target.value)} className="mt-1 min-h-20 w-full rounded-lg border px-3 py-2" /></label>
      <div className="mt-4 rounded-lg border p-4"><p className="font-semibold">Tài sản bàn giao</p>{selected.assets.length ? selected.assets.map((asset) => <div key={asset.assetId} className="mt-2 flex items-center justify-between text-sm"><span>{asset.assetName}</span><span className="text-gray-500">SL {asset.quantity} · {asset.condition}</span></div>) : <p className="mt-2 text-sm text-gray-500">Chưa khai báo tài sản cho phòng.</p>}</div>
      <label className="mt-4 block text-sm font-medium">Ghi chú<textarea value={note} onChange={(e) => setNote(e.target.value)} className="mt-1 min-h-16 w-full rounded-lg border px-3 py-2" /></label>
      <div className="mt-6 flex justify-end gap-3"><button onClick={() => setSelected(null)} className="rounded-lg border px-4 py-2 font-semibold">Hủy</button><button disabled={saving || !roomCondition.trim()} onClick={submit} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white disabled:bg-blue-300"><Send className="h-4 w-4" />{saving ? "Đang lập..." : "Lập biên bản và gửi Khách xác nhận"}</button></div>
    </div></div>}
  </div>;
}
