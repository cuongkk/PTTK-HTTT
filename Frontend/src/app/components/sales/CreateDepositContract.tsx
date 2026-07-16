import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { CheckCircle, FileText, UserRound } from "lucide-react";
import { toast } from "sonner";
import { salesApi, type SalesApplication } from "../../services/sales/salesApi";
import { roomService, type Room } from "../../services/system-admin/roomService";

export function CreateDepositContract() {
  const navigate = useNavigate();
  const location = useLocation();
  const [application, setApplication] = useState<SalesApplication | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [depositForm, setDepositForm] = useState({
    regRef: "",
    room: "",
    roomId: "",
    area: "",
    depositAmount: "",
    holdUntil: "",
  });

  const backToTransactions = () => navigate("/sales/registrations?tab=deposits");
  const holdUntilTomorrow = () => new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const calculateDepositAmount = (selectedApplication: SalesApplication, room?: Room) => {
    if (room?.roomPrice) return String(room.roomPrice * 2);
    const normalizedPrice = selectedApplication.priceRange
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
    if (normalizedPrice.includes("duoi") && normalizedPrice.includes("1.5")) return "1200000";
    if (normalizedPrice.includes("1.5") && normalizedPrice.includes("2")) return "1800000";
    return "2400000";
  };

  useEffect(() => {
    const regRef = new URLSearchParams(location.search).get("regRef");
    if (!regRef) return;

    Promise.all([salesApi.getApplications(), roomService.getAll().catch(() => [] as Room[])])
      .then(([applications, rooms]) => {
        const found = applications.find((item) => item.applicationId.toLowerCase() === regRef.toLowerCase());
        if (!found) {
          toast.error("Không tìm thấy hồ sơ đăng ký.");
          return;
        }

        const selectedRoom = rooms.find((room) => room.roomId === found.roomId);
        setApplication(found);
        setDepositForm({
          regRef: found.applicationId,
          room: selectedRoom?.roomName ?? found.roomName ?? "",
          roomId: found.roomId ?? selectedRoom?.roomId ?? "",
          area: selectedRoom?.area ?? found.area ?? "",
          depositAmount: calculateDepositAmount(found, selectedRoom),
          holdUntil: holdUntilTomorrow(),
        });
      })
      .catch(() => toast.error("Không tải được thông tin hồ sơ đặt cọc."));
  }, [location.search]);

  const handleConfirm = async () => {
    const { regRef, roomId, depositAmount, holdUntil } = depositForm;
    if (!application || !regRef || !roomId || !depositAmount || !holdUntil) {
      toast.warning("Vui lòng điền đủ số tiền cọc và hạn thanh toán.");
      return;
    }

    try {
      setSubmitting(true);
      const result = await salesApi.createDepositSlip({
        applicationId: regRef,
        roomId,
        depositAmount: Number(depositAmount),
        holdUntil: new Date(holdUntil).toISOString(),
      });
      toast.success(`Đã lập phiếu đặt cọc ${result.depositId}.`);
      backToTransactions();
    } catch {
      toast.error("Lập phiếu đặt cọc thất bại.");
    } finally {
      setSubmitting(false);
    }
  };

  const tenants = application?.tenants?.length
    ? application.tenants
    : application
      ? [
          {
            fullName: application.customerName,
            gender: application.gender,
            nationality: null,
            dateOfBirth: null,
            nationalId: null,
            documentType: null,
            documentImageUrl: null,
            permanentAddress: null,
            occupationOrSchool: null,
            isPrimaryTenant: true,
            isEligible: true,
            note: null,
          },
        ]
      : [];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 bg-gray-50/70 p-6">
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <FileText className="h-5 w-5 text-purple-600" />
            Lập phiếu đặt cọc
          </h2>
        </div>

        <div className="space-y-6 p-6">
          <section className="rounded-xl border border-gray-200 p-5">
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
              <UserRound className="h-4 w-4 text-purple-600" /> Thông tin người thuê
            </h3>
            <div className="mb-4 grid gap-3 text-sm sm:grid-cols-3">
              <Info label="Mã hồ sơ" value={depositForm.regRef} />
              <Info label="Khách hàng đại diện" value={application?.customerName} />
              <Info label="Số điện thoại" value={application?.phoneNumber} />
              <Info label="Email" value={application?.email} />
              <Info label="Số người ở" value={application ? String(application.capacity) : ""} />
              <Info label="Phòng đăng ký" value={depositForm.room} />
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Họ tên</th>
                    <th className="px-4 py-3">Vai trò</th>
                    <th className="px-4 py-3">Giới tính</th>
                    <th className="px-4 py-3">CCCD/Giấy tờ</th>
                    <th className="px-4 py-3">Địa chỉ thường trú</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tenants.map((tenant, index) => (
                    <tr key={`${tenant.fullName}-${index}`}>
                      <td className="px-4 py-3 font-medium text-gray-900">{tenant.fullName}</td>
                      <td className="px-4 py-3">{tenant.isPrimaryTenant ? "Người thuê chính" : "Người ở cùng"}</td>
                      <td className="px-4 py-3">{tenant.gender || "Chưa cập nhật"}</td>
                      <td className="px-4 py-3">{tenant.nationalId || "Chưa cập nhật"}</td>
                      <td className="px-4 py-3">{tenant.permanentAddress || "Chưa cập nhật"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-xl border border-purple-200 bg-purple-50/30 p-6">
            <h3 className="text-center text-base font-bold uppercase tracking-wide text-gray-900">Hợp đồng đặt cọc giữ chỗ</h3>
            <div className="mt-5 space-y-3 text-sm leading-6 text-gray-700">
              <p>
                <strong>Bên nhận đặt cọc:</strong> Hệ thống quản lý nhà trọ.
              </p>
              <p>
                <strong>Bên đặt cọc:</strong> {application?.customerName || "Chưa có thông tin"} — {application?.phoneNumber || "Chưa có số điện thoại"}.
              </p>
              <p>
                <strong>Phòng/giường đặt giữ:</strong> {depositForm.room || "Chưa xác định"}
                {depositForm.area ? `, ${depositForm.area}` : ""}.
              </p>
              <p>
                <strong>Mục đích đặt cọc:</strong> Giữ chỗ thuê phòng theo hồ sơ {depositForm.regRef || "chưa xác định"}.
              </p>
              <p>
                <strong>Thời hạn:</strong> Khách thuê phải hoàn tất thanh toán tiền cọc trước hạn bên dưới. Quá hạn, phiếu có thể hết hiệu lực.
              </p>
            </div>

            <div className="mt-5 grid gap-4 border-t border-purple-200 pt-5 sm:grid-cols-2">
              <label className="text-sm font-medium text-gray-700">
                Số tiền cọc (VNĐ) <span className="text-red-500">*</span>
                <input
                  type="number"
                  min="1"
                  value={depositForm.depositAmount}
                  onChange={(event) => setDepositForm((prev) => ({ ...prev, depositAmount: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500"
                />
              </label>
              <label className="text-sm font-medium text-gray-700">
                Hạn thanh toán <span className="text-red-500">*</span>
                <input
                  type="date"
                  value={depositForm.holdUntil}
                  onChange={(event) => setDepositForm((prev) => ({ ...prev, holdUntil: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500"
                />
              </label>
            </div>
          </section>

          <div className="flex gap-3 border-t pt-4">
            <button type="button" onClick={backToTransactions} className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Quay lại
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={submitting || !application}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <CheckCircle className="h-4 w-4" /> {submitting ? "Đang xác nhận..." : "Xác nhận lập phiếu đặt cọc"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-0.5 font-medium text-gray-900">{value || "Chưa cập nhật"}</p>
    </div>
  );
}
