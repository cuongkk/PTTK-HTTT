import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { FileText, ArrowLeft, CheckCircle, AlertCircle, Sparkles, Search } from "lucide-react";
import { salesApi, type SalesApplication } from "../../services/sales/salesApi";
import { toast } from "sonner";

export function CreateDepositContract() {
  const navigate = useNavigate();
  const location = useLocation();
  const [depositForm, setDepositForm] = useState({
    regRef: "",
    customer: "",
    phone: "",
    room: "",
    roomId: "",
    area: "Khu A",
    depositAmount: "",
    holdUntil: "",
  });
  const [showPreview, setShowPreview] = useState(false);

  const df = (k: string, v: string) => setDepositForm((p) => ({ ...p, [k]: v }));

  // Auto-fill from query parameter or auto-load when regRef is provided
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const regRef = params.get("regRef");
    if (regRef) {
      df("regRef", regRef);
      salesApi.getApplications()
        .then((applications) => {
          const found = applications.find(
            (r) => r.applicationId.toLowerCase() === regRef.toLowerCase()
          );
          if (found) {
            setDepositForm((prev) => ({
              ...prev,
              regRef: found.applicationId,
              customer: found.customerName,
              phone: found.phoneNumber,
              area: found.area,
              room: found.roomName !== "Chưa phân phòng" ? found.roomName : "",
              roomId: found.roomId ?? "",
              depositAmount: found.priceRange === "Dưới 1.5 triệu" ? "1200000" : found.priceRange === "1.5 – 2 triệu" ? "1800000" : "2400000",
              holdUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0] // default 24h
            }));
          }
        })
        .catch(console.error);
    }
  }, [location.search]);

  // Search registration manually
  const handleSearchReg = async () => {
    if (!depositForm.regRef.trim()) {
      toast.warning("Vui lòng nhập mã yêu cầu đăng ký để tra cứu.");
      return;
    }
    try {
      const applications = await salesApi.getApplications();
      const found = applications.find(
        (r) => r.applicationId.toLowerCase() === depositForm.regRef.trim().toLowerCase()
      );

      if (found) {
        setDepositForm((prev) => ({
          ...prev,
          customer: found.customerName,
          phone: found.phoneNumber,
          area: found.area,
          room: found.roomName !== "Chưa phân phòng" ? found.roomName : "",
          roomId: found.roomId ?? "",
          depositAmount: found.priceRange === "Dưới 1.5 triệu" ? "1200000" : found.priceRange === "1.5 – 2 triệu" ? "1800000" : "2400000",
          holdUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0]
        }));
        toast.success(`Đã tìm thấy đăng ký ${found.applicationId} và tự động điền thông tin!`);
      } else {
        toast.error("Không tìm thấy yêu cầu đăng ký thuê tương ứng. Vui lòng kiểm tra lại mã.");
      }
    } catch (err) {
      toast.error("Lỗi khi tra cứu đăng ký.");
    }
  };

  const handleCreateDeposit = async () => {
    const { regRef, roomId, depositAmount, holdUntil } = depositForm;
    if (!regRef || !roomId || !depositAmount || !holdUntil) {
      toast.warning("Vui lòng điền đủ thông tin bắt buộc.");
      return;
    }

    try {
      const result = await salesApi.createDepositSlip({
        applicationId: regRef,
        roomId: roomId,
        depositAmount: parseInt(depositAmount),
        holdUntil: new Date(holdUntil).toISOString(),
      });

      toast.success(`Đã lập phiếu đặt cọc thành công!\nMã phiếu cọc: ${result.depositId}\nTrạng thái phòng/giường cập nhật: "Chờ thanh toán cọc" / "Đang giữ chỗ".`);
      navigate("/sales/contracts");
    } catch (err) {
      toast.error("Lập phiếu đặt cọc thất bại.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Breadcrumb / Back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/sales/contracts")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại Tra cứu hợp đồng
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
            Ghi nhận thông tin giữ chỗ và đặt cọc phòng/giường của khách hàng từ phiếu đăng ký.
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
                <p><strong>Phòng/giường đặt giữ:</strong> {depositForm.room} ({depositForm.area})</p>
                <p><strong>Số tiền đặt cọc:</strong> {parseInt(depositForm.depositAmount).toLocaleString("vi-VN")} đ</p>
                <p><strong>Thời hạn giữ chỗ đến ngày:</strong> {new Date(depositForm.holdUntil).toLocaleDateString("vi-VN")}</p>
                <div className="pt-3 border-t border-yellow-200 text-[10px] text-gray-500 italic">
                  * Hợp đồng đặt giữ chỗ này có giá trị tạm thời. Khách hàng cam kết hoàn tất thanh toán cọc trong vòng 24h để cập nhật trạng thái giữ chỗ chính thức.
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
                <CheckCircle className="w-4 h-4" /> Xác nhận lưu hợp đồng
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wide border-b pb-1">
              Đăng ký tham chiếu (Include Relationship)
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mã yêu cầu đăng ký <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  value={depositForm.regRef}
                  onChange={(e) => df("regRef", e.target.value)}
                  placeholder="Nhập mã đăng ký (Vd: HSxxxxxxxxxx)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button
                  type="button"
                  onClick={handleSearchReg}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Search className="w-4 h-4" /> Tìm đăng ký
                </button>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                Nhập mã đăng ký và bấm "Tìm đăng ký" để tự động tải thông tin khách hàng và phòng/giường trống.
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
                  onChange={(e) => df("customer", e.target.value)}
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
                  onChange={(e) => df("phone", e.target.value)}
                  placeholder="09xxxxxxxx"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Khu vực</label>
                <select
                  value={depositForm.area}
                  onChange={(e) => df("area", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option>Khu A</option>
                  <option>Khu B</option>
                  <option>Khu C</option>
                </select>
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
                  onChange={(e) => df("room", e.target.value)}
                  placeholder="Vd: Phòng 201 – Tòa A"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
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
                  onChange={(e) => df("depositAmount", e.target.value)}
                  placeholder="1800000"
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
                  onChange={(e) => df("holdUntil", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="p-3.5 bg-purple-50 rounded-xl text-xs text-purple-700 border border-purple-100 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-purple-650 flex-shrink-0 mt-0.5" />
              <span>
                Sau khi lập, trạng thái phòng/giường sẽ được cập nhật thành{" "}
                <strong>"Chờ thanh toán cọc"</strong>. Dữ liệu sẽ tự động chuyển sang Kế toán.
              </span>
            </div>

            <div className="flex gap-3 pt-3 border-t">
              <button
                type="button"
                onClick={() => navigate("/sales/contracts")}
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
