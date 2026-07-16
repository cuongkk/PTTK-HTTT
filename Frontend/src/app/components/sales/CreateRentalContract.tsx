import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { CheckCircle, FileText, UserRound } from "lucide-react";
import { toast } from "sonner";
import { salesApi, type SalesApplication } from "../../services/sales/salesApi";
import { roomService, type Room } from "../../services/system-admin/roomService";

export function CreateRentalContract() {
  const navigate = useNavigate();
  const location = useLocation();
  const backToTransactions = () => navigate("/sales/registrations?tab=contracts");
  const [application, setApplication] = useState<SalesApplication | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [rentalForm, setRentalForm] = useState({
    depositRef: "",
    customer: "",
    phone: "",
    room: "",
    roomId: "",
    moveInDate: "",
    duration: "12",
    monthlyRent: "",
    paymentCycle: "Hàng tháng",
    services: "Điện, Nước, Internet",
  });

  const rf = (key: string, value: string) => setRentalForm((previous) => ({ ...previous, [key]: value }));

  useEffect(() => {
    const depositRef = new URLSearchParams(location.search).get("depositRef");
    if (!depositRef) return;

    Promise.all([salesApi.getDepositSlips(), salesApi.getApplications().catch(() => [] as SalesApplication[]), roomService.getAll().catch(() => [] as Room[])])
      .then(([slips, applications, rooms]) => {
        const deposit = slips.find((item) => item.depositId.toLowerCase() === depositRef.toLowerCase());
        if (!deposit) {
          toast.error("Không tìm thấy phiếu đặt cọc.");
          return;
        }

        const selectedApplication = applications.find((item) => item.applicationId === deposit.applicationId) ?? null;
        const room = selectedApplication?.roomId ? rooms.find((item) => item.roomId === selectedApplication.roomId) : rooms.find((item) => item.roomName === deposit.roomName);
        setApplication(selectedApplication);
        setRentalForm((previous) => ({
          ...previous,
          depositRef: deposit.depositId,
          customer: deposit.customerName,
          phone: deposit.phoneNumber,
          room: deposit.roomName,
          roomId: selectedApplication?.roomId ?? room?.roomId ?? "",
          monthlyRent: room?.roomPrice ? String(room.roomPrice) : String(Math.round(deposit.depositAmount / 2)),
          moveInDate: selectedApplication?.expectedMoveInDate ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          duration: selectedApplication?.expectedRentalMonths ? String(selectedApplication.expectedRentalMonths) : "12",
        }));
      })
      .catch(() => toast.error("Không tải được thông tin lập hợp đồng thuê."));
  }, [location.search]);

  const handleConfirm = async () => {
    const { depositRef, roomId, moveInDate, duration, monthlyRent, paymentCycle, services } = rentalForm;
    if (!depositRef || !roomId || !moveInDate || !duration || !monthlyRent) {
      toast.warning("Vui lòng điền đủ thông tin bắt buộc.");
      return;
    }

    try {
      setSubmitting(true);
      const result = await salesApi.createRentalContract({
        depositId: depositRef,
        roomId,
        moveInDate: new Date(moveInDate).toISOString(),
        durationMonths: Number(duration),
        monthlyRent: Number(monthlyRent),
        paymentCycle,
        services: services
          .split(",")
          .map((service) => service.trim())
          .filter(Boolean),
      });
      toast.success(`Đã lập hợp đồng thuê ${result.contractId}.`);
      backToTransactions();
    } catch {
      toast.error("Lập hợp đồng thuê thất bại.");
    } finally {
      setSubmitting(false);
    }
  };

  const tenants = application?.tenants?.length
    ? application.tenants
    : rentalForm.customer
      ? [
          {
            fullName: rentalForm.customer,
            gender: application?.gender ?? null,
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
            <FileText className="h-5 w-5 text-blue-600" /> Lập hợp đồng thuê
          </h2>
        </div>

        <div className="space-y-6 p-6">
          <section className="rounded-xl border border-gray-200 p-5">
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
              <UserRound className="h-4 w-4 text-blue-600" /> Thông tin người thuê
            </h3>
            <div className="mb-4 grid gap-3 text-sm sm:grid-cols-3">
              <Info label="Phiếu cọc tham chiếu" value={rentalForm.depositRef} />
              <Info label="Khách hàng đại diện" value={rentalForm.customer} />
              <Info label="Số điện thoại" value={rentalForm.phone} />
              <Info label="Phòng thuê" value={rentalForm.room} />
              <Info label="Mã hồ sơ" value={application?.applicationId} />
              <Info label="Số người ở" value={application ? String(application.capacity) : String(tenants.length)} />
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

          <section className="rounded-xl border border-blue-200 bg-blue-50/30 p-6">
            <h3 className="text-center text-base font-bold uppercase tracking-wide text-gray-900">Hợp đồng thuê phòng</h3>
            <div className="mt-5 space-y-3 text-sm leading-6 text-gray-700">
              <p>
                <strong>Bên cho thuê:</strong> Hệ thống quản lý nhà trọ.
              </p>
              <p>
                <strong>Bên thuê:</strong> {rentalForm.customer || "Chưa có thông tin"} — {rentalForm.phone || "Chưa có số điện thoại"}.
              </p>
              <p>
                <strong>Phòng/giường thuê:</strong> {rentalForm.room || "Chưa xác định"}.
              </p>
              <p>
                <strong>Phiếu cọc tham chiếu:</strong> {rentalForm.depositRef || "Chưa xác định"}.
              </p>
              <p>
                <strong>Dịch vụ đi kèm:</strong> {rentalForm.services || "Không có"}.
              </p>
            </div>

            <div className="mt-5 grid gap-4 border-t border-blue-200 pt-5 sm:grid-cols-2">
              <Field label="Ngày bắt đầu nhận phòng" required>
                <input type="date" value={rentalForm.moveInDate} onChange={(event) => rf("moveInDate", event.target.value)} className="form-input" />
              </Field>
              <Field label="Thời hạn hợp đồng" required>
                <select value={rentalForm.duration} onChange={(event) => rf("duration", event.target.value)} className="form-input">
                  <option value="6">6 tháng</option>
                  <option value="12">12 tháng</option>
                  <option value="24">24 tháng</option>
                </select>
              </Field>
              <Field label="Giá thuê hàng tháng (VNĐ)" required>
                <input type="number" min="1" value={rentalForm.monthlyRent} onChange={(event) => rf("monthlyRent", event.target.value)} className="form-input" />
              </Field>
              <Field label="Kỳ thanh toán">
                <select value={rentalForm.paymentCycle} onChange={(event) => rf("paymentCycle", event.target.value)} className="form-input">
                  <option>Hàng tháng</option>
                  <option>Mỗi 3 tháng</option>
                  <option>Mỗi 6 tháng</option>
                </select>
              </Field>
              <div className="sm:col-span-2">
                <Field label="Các dịch vụ đi kèm">
                  <input value={rentalForm.services} onChange={(event) => rf("services", event.target.value)} className="form-input" />
                </Field>
              </div>
            </div>
          </section>

          <div className="flex gap-3 border-t pt-4">
            <button type="button" onClick={backToTransactions} className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Quay lại
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={submitting || !rentalForm.depositRef}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <CheckCircle className="h-4 w-4" /> {submitting ? "Đang xác nhận..." : "Xác nhận lập hợp đồng thuê"}
            </button>
          </div>
        </div>
      </div>
      <style>{`.form-input{margin-top:.25rem;width:100%;border:1px solid #d1d5db;border-radius:.5rem;background:#fff;padding:.5rem .75rem;outline:none}.form-input:focus{box-shadow:0 0 0 2px #3b82f6}`}</style>
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

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
      {children}
    </label>
  );
}
