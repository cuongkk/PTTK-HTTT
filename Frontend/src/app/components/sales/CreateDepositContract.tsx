import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { AlertCircle, ArrowLeft, CheckCircle, FileText, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { salesApi, type SalesApplication } from "../../services/sales/salesApi";
import { roomService, type Room } from "../../services/system-admin/roomService";

export function CreateDepositContract() {
  const navigate = useNavigate();
  const location = useLocation();
  const [depositForm, setDepositForm] = useState({
    regRef: "",
    customer: "",
    phone: "",
    room: "",
    roomId: "",
    area: "",
    depositAmount: "",
    holdUntil: "",
  });
  const [showPreview, setShowPreview] = useState(false);

  const df = (key: string, value: string) => setDepositForm((prev) => ({ ...prev, [key]: value }));
  const backToTransactions = () => navigate("/sales/registrations?tab=deposits");
  const holdUntilTomorrow = () => new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const findSelectedRoom = async (application: SalesApplication) => {
    if (!application.roomId) return undefined;
    const rooms = await roomService.getAll().catch(() => [] as Room[]);
    return rooms.find((room) => room.roomId === application.roomId);
  };

  const calculateDepositAmount = (application: SalesApplication, room?: Room) => {
    if (room?.roomPrice) return String(room.roomPrice * 2);
    const normalizedPrice = application.priceRange.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    if (normalizedPrice.includes("duoi") && normalizedPrice.includes("1.5")) return "1200000";
    if (normalizedPrice.includes("1.5") && normalizedPrice.includes("2")) return "1800000";
    return "2400000";
  };

  const fillFromApplication = async (application: SalesApplication) => {
    const selectedRoom = await findSelectedRoom(application);
    setDepositForm((prev) => ({
      ...prev,
      regRef: application.applicationId,
      customer: application.customerName,
      phone: application.phoneNumber,
      area: selectedRoom?.area ?? application.area ?? "",
      room: selectedRoom?.roomName ?? (application.roomId ? application.roomName : ""),
      roomId: application.roomId ?? selectedRoom?.roomId ?? "",
      depositAmount: calculateDepositAmount(application, selectedRoom),
      holdUntil: holdUntilTomorrow(),
    }));
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const regRef = params.get("regRef");
    if (!regRef) return;

    df("regRef", regRef);
    salesApi
      .getApplications()
      .then((applications) => applications.find((item) => item.applicationId.toLowerCase() === regRef.toLowerCase()))
      .then((found) => {
        if (found) fillFromApplication(found);
      })
      .catch(console.error);
  }, [location.search]);

  const handleCreateDeposit = async () => {
    const { regRef, roomId, depositAmount, holdUntil } = depositForm;
    if (!regRef || !roomId || !depositAmount || !holdUntil) {
      toast.warning("Vui lòng điền đủ thông tin bắt buộc.");
      return;
    }

    try {
      const result = await salesApi.createDepositSlip({
        applicationId: regRef,
        roomId,
        depositAmount: parseInt(depositAmount),
        holdUntil: new Date(holdUntil).toISOString(),
      });

      toast.success(`Đã lập phiếu đặt cọc thành công. Mã phiếu cọc: ${result.depositId}`);
      backToTransactions();
    } catch (err) {
      toast.error("Lập phiếu đặt cọc thất bại.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={backToTransactions}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại Xử lý giao dịch
        </button>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-50 rounded-full text-purple-700 text-xs font-semibold border border-purple-100">
          <Sparkles className="w-3.5 h-3.5" />
          Màn hình lập phiếu đặt cọc
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            Lập phiếu đặt cọc
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Ghi nhận thông tin giữ chỗ và đặt cọc phòng/giường từ phiếu đăng ký đã được quản lý xác nhận còn trống.
          </p>
        </div>

        {showPreview ? (
          <div className="p-6 space-y-4">
            <div className="bg-yellow-50/60 p-5 border border-yellow-200 rounded-xl space-y-4">
              <h3 className="font-bold text-center text-gray-850 text-sm tracking-wider uppercase">
                PHIẾU ĐẶT CỌC GIỮ CHỖ (BẢN NHÁP)
              </h3>
              <div className="space-y-2.5 text-xs text-gray-700 leading-relaxed">
                <p><strong>Bên nhận đặt cọc:</strong> Hệ thống RoomManager</p>
                <p><strong>Bên đặt cọc:</strong> {depositForm.customer}</p>
                <p><strong>Số điện thoại:</strong> {depositForm.phone}</p>
                <p><strong>Phiếu đăng ký tham chiếu:</strong> {depositForm.regRef || "Không có"}</p>
                <p><strong>Phòng/giường đặt giữ:</strong> {depositForm.room} {depositForm.area ? `(${depositForm.area})` : ""}</p>
                <p><strong>Số tiền đặt cọc:</strong> {Number(depositForm.depositAmount || 0).toLocaleString("vi-VN")} đ</p>
                <p><strong>Thời hạn giữ chỗ đến ngày:</strong> {depositForm.holdUntil ? new Date(depositForm.holdUntil).toLocaleDateString("vi-VN") : ""}</p>
                <div className="pt-3 border-t border-yellow-200 text-[10px] text-gray-500 italic">
                  * Phiếu đặt giữ chỗ có giá trị tạm thời. Khách hàng cần hoàn tất thanh toán cọc trong thời hạn giữ chỗ.
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowPreview(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-medium text-gray-700 transition-colors"
              >
                Quay lại chỉnh sửa
              </button>
              <button
                onClick={handleCreateDeposit}
                className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" /> Xác nhận lưu phiếu cọc
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wide border-b pb-1">
              Đăng ký tham chiếu
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mã yêu cầu đăng ký <span className="text-red-500">*</span>
              </label>
              <input
                value={depositForm.regRef}
                onChange={(event) => df("regRef", event.target.value)}
                placeholder="Tự lấy từ hồ sơ đã chọn"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
                disabled
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Hệ thống tự tải thông tin khách hàng và phòng/giường từ dữ liệu thực tế.
              </p>
            </div>

            <p className="text-xs text-gray-500 font-bold uppercase tracking-wide border-b pb-1 pt-2">
              Thông tin khách hàng
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ tên khách hàng <span className="text-red-500">*</span>
                </label>
                <input
                  value={depositForm.customer}
                  onChange={(event) => df("customer", event.target.value)}
                  placeholder="Nhập họ tên hoặc tìm kiếm ở trên"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  value={depositForm.phone}
                  onChange={(event) => df("phone", event.target.value)}
                  placeholder="09xxxxxxxx"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Khu vực</label>
                <input
                  value={depositForm.area}
                  onChange={(event) => df("area", event.target.value)}
                  placeholder="Tự lấy từ phòng/hồ sơ thực tế"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
                  disabled
                />
              </div>
            </div>

            <p className="text-xs text-gray-500 font-bold uppercase tracking-wide border-b pb-1 pt-2">
              Thông tin đặt cọc
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phòng/giường đặt giữ chỗ <span className="text-red-500">*</span>
                </label>
                <input
                  value={depositForm.room}
                  onChange={(event) => df("room", event.target.value)}
                  placeholder="Tự lấy theo phòng đã được xác nhận"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số tiền cọc (VNĐ) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={depositForm.depositAmount}
                  onChange={(event) => df("depositAmount", event.target.value)}
                  placeholder="Tự tính theo phòng thực tế"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giữ chỗ đến ngày <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={depositForm.holdUntil}
                  onChange={(event) => df("holdUntil", event.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="p-3.5 bg-purple-50 rounded-xl text-xs text-purple-700 border border-purple-100 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-purple-650 flex-shrink-0 mt-0.5" />
              <span>
                Sau khi lập, trạng thái phòng/giường sẽ được cập nhật thành <strong>"Chờ thanh toán cọc"</strong>.
              </span>
            </div>

            <div className="flex gap-3 pt-3 border-t">
              <button
                type="button"
                onClick={backToTransactions}
                className="flex-1 px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-medium text-gray-700 transition-colors"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  const { customer, phone, room, depositAmount, holdUntil } = depositForm;
                  if (!customer || !phone || !room || !depositAmount || !holdUntil) {
                    toast.warning("Vui lòng điền đủ thông tin bắt buộc.");
                    return;
                  }
                  setShowPreview(true);
                }}
                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                Xem trước bản nháp →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
