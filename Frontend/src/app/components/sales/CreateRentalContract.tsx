import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { FileText, ArrowLeft, CheckCircle, AlertCircle, Sparkles, Search } from "lucide-react";
import { salesApi } from "../../services/sales/salesApi";
import { toast } from "sonner";

export function CreateRentalContract() {
  const navigate = useNavigate();
  const location = useLocation();

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
  const [showPreview, setShowPreview] = useState(false);

  const rf = (k: string, v: string) => setRentalForm((p) => ({ ...p, [k]: v }));

  // Auto-fill from query parameter or auto-load when depositRef changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const depositRef = params.get("depositRef");
    if (depositRef) {
      rf("depositRef", depositRef);
      salesApi.getDepositSlips()
        .then((slips) => {
          const found = slips.find(
            (d) => d.depositId.toLowerCase() === depositRef.toLowerCase()
          );
          if (found) {
            setRentalForm((prev) => ({
              ...prev,
              depositRef: found.depositId,
              customer: found.customerName,
              phone: found.phoneNumber,
              room: found.roomName,
              monthlyRent: found.depositAmount.toString(),
              moveInDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            }));
          }
        })
        .catch(console.error);
    }
  }, [location.search]);

  // Search deposit contract manually
  const handleSearchDeposit = async () => {
    if (!rentalForm.depositRef.trim()) {
      toast.warning("Vui lòng nhập mã hợp đồng cọc để tra cứu.");
      return;
    }
    try {
      const slips = await salesApi.getDepositSlips();
      const found = slips.find(
        (d) => d.depositId.toLowerCase() === rentalForm.depositRef.trim().toLowerCase()
      );

      if (found) {
        setRentalForm((prev) => ({
          ...prev,
          customer: found.customerName,
          phone: found.phoneNumber,
          room: found.roomName,
          monthlyRent: found.depositAmount.toString(),
          moveInDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        }));
        toast.success(`Đã tìm thấy hợp đồng cọc ${found.depositId} và tự động điền thông tin!`);
      } else {
        toast.error("Không tìm thấy hợp đồng đặt cọc tương ứng hoặc trạng thái chưa được kế toán xác nhận.");
      }
    } catch (err) {
      toast.error("Lỗi khi tra cứu hợp đồng cọc.");
    }
  };

  const handleCreateRental = async () => {
    const { depositRef, moveInDate, duration, monthlyRent, paymentCycle, services } = rentalForm;
    if (!depositRef || !moveInDate || !monthlyRent) {
      toast.warning("Vui lòng điền đủ thông tin bắt buộc.");
      return;
    }

    try {
      const result = await salesApi.createRentalContract({
        depositId: depositRef,
        roomId: "", // resolved by backend automatically
        moveInDate: new Date(moveInDate).toISOString(),
        durationMonths: parseInt(duration),
        monthlyRent: parseInt(monthlyRent),
        paymentCycle,
        services: services ? services.split(",").map((s) => s.trim()).filter(Boolean) : [],
      });

      toast.success(`Đã lập hợp đồng thuê ${result.contractId} thành công!\nThông tin đã được chuyển sang Kế toán để tính khoản thu nhận phòng đầu kỳ.`);
      navigate("/sales/contracts");
    } catch (err) {
      toast.error("Lập hợp đồng thuê thất bại.");
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
        <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 rounded-full text-blue-700 text-xs font-semibold border border-blue-100">
          <Sparkles className="w-3.5 h-3.5" />
          Màn hình lập hợp đồng thuê
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Lập hợp đồng thuê
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Chuyển từ hợp đồng cọc sang hợp đồng thuê chính thức và chuẩn bị thủ tục nhận phòng.
          </p>
        </div>

        {showPreview ? (
          <div className="p-6 space-y-4">
            <div className="bg-blue-50/60 p-5 border border-blue-200 rounded-xl space-y-4">
              <h3 className="font-bold text-center text-gray-850 text-sm tracking-wider uppercase">
                HỢP ĐỒNG THUÊ PHÒNG (BẢN NHÁP)
              </h3>
              <div className="space-y-2.5 text-xs text-gray-700 leading-relaxed">
                <p><strong>Bên cho thuê:</strong> Hệ thống RoomManager</p>
                <p><strong>Bên thuê phòng:</strong> {rentalForm.customer}</p>
                <p><strong>Số điện thoại:</strong> {rentalForm.phone}</p>
                <p><strong>Hợp đồng đặt cọc tham chiếu:</strong> {rentalForm.depositRef}</p>
                <p><strong>Phòng/giường thuê:</strong> {rentalForm.room}</p>
                <p><strong>Ngày bắt đầu vào ở:</strong> {rentalForm.moveInDate ? new Date(rentalForm.moveInDate).toLocaleDateString("vi-VN") : ""}</p>
                <p><strong>Thời hạn hợp đồng:</strong> {rentalForm.duration} tháng</p>
                <p><strong>Đơn giá thuê:</strong> {parseInt(rentalForm.monthlyRent).toLocaleString("vi-VN")} đ/tháng</p>
                <p><strong>Kỳ thanh toán:</strong> {rentalForm.paymentCycle}</p>
                <p><strong>Dịch vụ đi kèm:</strong> {rentalForm.services || "Không có"}</p>
                <div className="pt-3 border-t border-blue-200 text-[10px] text-gray-500 italic">
                  * Bản thảo hợp đồng này có giá trị tạm thời. Thông tin sẽ được tự động chuyển sang kế toán tính toán khoản thu nhận phòng đầu kỳ (gồm tiền thuê tháng đầu và cọc đảm bảo).
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
                onClick={handleCreateRental}
                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" /> Xác nhận ký hợp đồng
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wide border-b pb-1">
              Đặt cọc tham chiếu (Include Relationship)
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mã hợp đồng đặt cọc tham chiếu <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  value={rentalForm.depositRef}
                  onChange={(e) => rf("depositRef", e.target.value)}
                  placeholder="Nhập mã đặt cọc (Vd: DCxxxxxxxxxx)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button
                  type="button"
                  onClick={handleSearchDeposit}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Search className="w-4 h-4" /> Tìm cọc
                </button>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                Nhập mã hợp đồng cọc và bấm "Tìm cọc" để tự động tải thông tin khách hàng và phòng thuê.
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
                  value={rentalForm.customer}
                  onChange={(e) => rf("customer", e.target.value)}
                  placeholder="Họ tên khách thuê"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                <input
                  value={rentalForm.phone}
                  onChange={(e) => rf("phone", e.target.value)}
                  placeholder="Số điện thoại"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phòng thuê</label>
                <input
                  value={rentalForm.room}
                  onChange={(e) => rf("room", e.target.value)}
                  placeholder="Phòng thuê"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
                  disabled
                />
              </div>
            </div>

            <p className="text-xs text-gray-500 font-bold uppercase tracking-wide border-b pb-1 pt-2">
              Điều khoản thuê
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày bắt đầu nhận phòng <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={rentalForm.moveInDate}
                  onChange={(e) => rf("moveInDate", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thời hạn hợp đồng</label>
                <select
                  value={rentalForm.duration}
                  onChange={(e) => rf("duration", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="6">6 tháng</option>
                  <option value="12">12 tháng</option>
                  <option value="24">24 tháng</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giá thuê hàng tháng (VNĐ) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={rentalForm.monthlyRent}
                  onChange={(e) => rf("monthlyRent", e.target.value)}
                  placeholder="2000000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kỳ thanh toán</label>
                <select
                  value={rentalForm.paymentCycle}
                  onChange={(e) => rf("paymentCycle", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option>Hàng tháng</option>
                  <option>Mỗi 3 tháng</option>
                  <option>Mỗi 6 tháng</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Các dịch vụ đi kèm (cách nhau bằng dấu phẩy)</label>
                <input
                  value={rentalForm.services}
                  onChange={(e) => rf("services", e.target.value)}
                  placeholder="Điện, Nước, Internet, Giặt ủi"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
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
                  const { customer, phone, room, moveInDate, monthlyRent, depositRef } = rentalForm;
                  if (!customer || !phone || !room || !moveInDate || !monthlyRent || !depositRef) {
                    toast.warning("Vui lòng điền đủ thông tin bắt buộc.");
                    return;
                  }
                  setShowPreview(true);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
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
