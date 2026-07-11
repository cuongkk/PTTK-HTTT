import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { FileText, ArrowLeft, CheckCircle, AlertCircle, Sparkles, Search } from "lucide-react";

interface DepositContract {
  id: number;
  contractId: string;
  type: "deposit";
  customer: string;
  phone: string;
  room: string;
  area: string;
  depositAmount: number;
  holdUntil: string;
  status: "Chờ thanh toán cọc" | "Đã đặt cọc" | "Hủy";
  createdDate: string;
}

interface RentalContract {
  id: number;
  contractId: string;
  type: "rental";
  customer: string;
  phone: string;
  room: string;
  moveInDate: string;
  duration: number;
  monthlyRent: number;
  services: string[];
  paymentCycle: string;
  depositRef: string;
  status: "Hiệu lực" | "Chờ nhận phòng" | "Đã kết thúc" | "Chờ trả phòng";
  createdDate: string;
}

const INITIAL_DEPOSITS: DepositContract[] = [
  { id: 1, contractId: "HDC-2026-001", type: "deposit", customer: "Nguyễn Văn B", phone: "0901234567", room: "Phòng 201 – Tòa A", area: "Khu A", depositAmount: 1800000, holdUntil: "30/05/2026", status: "Đã đặt cọc", createdDate: "14/05/2026" },
  { id: 2, contractId: "HDC-2026-002", type: "deposit", customer: "Trần Thị C", phone: "0912345678", room: "Phòng 305 – Tòa B", area: "Khu B", depositAmount: 2400000, holdUntil: "01/06/2026", status: "Chờ thanh toán cọc", createdDate: "15/05/2026" },
];

const INITIAL_RENTALS: RentalContract[] = [
  { id: 1, contractId: "HDT-2026-001", type: "rental", customer: "Nguyễn Văn A", phone: "0934567890", room: "Phòng 102 – Tòa C", moveInDate: "15/01/2026", duration: 12, monthlyRent: 2000000, services: ["Điện", "Nước", "Internet"], paymentCycle: "Hàng tháng", depositRef: "HDC-2025-011", status: "Hiệu lực", createdDate: "10/01/2026" },
];

export function CreateRentalContract() {
  const navigate = useNavigate();
  const location = useLocation();

  const [rentalForm, setRentalForm] = useState({
    depositRef: "",
    customer: "",
    phone: "",
    room: "",
    moveInDate: "",
    duration: "12",
    monthlyRent: "",
    paymentCycle: "Hàng tháng",
    services: "",
  });
  const [showPreview, setShowPreview] = useState(false);

  const rf = (k: string, v: string) => setRentalForm((p) => ({ ...p, [k]: v }));

  // Auto-fill from query parameter or auto-load when depositRef changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const depositRef = params.get("depositRef");
    if (depositRef) {
      rf("depositRef", depositRef);
      const saved = localStorage.getItem("roommanager_deposits");
      const currentDeposits: DepositContract[] = saved ? JSON.parse(saved) : INITIAL_DEPOSITS;
      const found = currentDeposits.find(
        (d) => d.contractId.toLowerCase() === depositRef.toLowerCase()
      );
      if (found) {
        setRentalForm((prev) => ({
          ...prev,
          depositRef: found.contractId,
          customer: found.customer,
          phone: found.phone,
          room: found.room,
          monthlyRent: found.depositAmount.toString(),
        }));
      }
    }
  }, [location.search]);

  // Search deposit contract manually
  const handleSearchDeposit = () => {
    if (!rentalForm.depositRef.trim()) {
      alert("Vui lòng nhập mã hợp đồng cọc để tra cứu.");
      return;
    }
    const saved = localStorage.getItem("roommanager_deposits");
    const currentDeposits: DepositContract[] = saved ? JSON.parse(saved) : INITIAL_DEPOSITS;
    const found = currentDeposits.find(
      (d) => d.contractId.toLowerCase() === rentalForm.depositRef.trim().toLowerCase()
    );

    if (found) {
      setRentalForm((prev) => ({
        ...prev,
        customer: found.customer,
        phone: found.phone,
        room: found.room,
        monthlyRent: found.depositAmount.toString(),
      }));
      alert(`Đã tìm thấy hợp đồng cọc ${found.contractId} và tự động điền thông tin!`);
    } else {
      alert("Không tìm thấy hợp đồng đặt cọc tương ứng. Vui lòng kiểm tra lại mã.");
    }
  };

  const handleCreateRental = () => {
    const { customer, phone, room, moveInDate, duration, monthlyRent, depositRef } = rentalForm;
    if (!customer || !phone || !room || !moveInDate || !monthlyRent || !depositRef) {
      alert("Vui lòng điền đủ thông tin bắt buộc.");
      return;
    }

    // Load existing rental contracts from localStorage
    const savedRentals = localStorage.getItem("roommanager_rentals");
    const currentRentals: RentalContract[] = savedRentals ? JSON.parse(savedRentals) : INITIAL_RENTALS;

    const newContract: RentalContract = {
      id: currentRentals.length + 1,
      contractId: `HDT-2026-${String(currentRentals.length + 1).padStart(3, "0")}`,
      type: "rental",
      customer,
      phone,
      room,
      moveInDate,
      duration: parseInt(duration),
      monthlyRent: parseInt(monthlyRent),
      services: rentalForm.services ? rentalForm.services.split(",").map((s) => s.trim()) : [],
      paymentCycle: rentalForm.paymentCycle,
      depositRef,
      status: "Chờ nhận phòng",
      createdDate: new Date().toLocaleDateString("vi-VN"),
    };

    const updatedRentals = [newContract, ...currentRentals];
    localStorage.setItem("roommanager_rentals", JSON.stringify(updatedRentals));

    alert(`Đã lập hợp đồng thuê ${newContract.contractId} thành công!\nThông tin đã được chuyển sang Kế toán để tính khoản thu nhận phòng đầu kỳ.`);
    navigate("/sales/contracts");
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
                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 animate-pulse"
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
                  placeholder="Nhập mã đặt cọc (Vd: HDC-2026-001)"
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
                  placeholder="Họ tên tự động hoặc tự nhập"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  value={rentalForm.phone}
                  onChange={(e) => rf("phone", e.target.value)}
                  placeholder="Số điện thoại"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <p className="text-xs text-gray-500 font-bold uppercase tracking-wide border-b pb-1 pt-2">
              Thông tin hợp đồng thuê
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phòng/giường <span className="text-red-500">*</span>
                </label>
                <input
                  value={rentalForm.room}
                  onChange={(e) => rf("room", e.target.value)}
                  placeholder="Vd: Phòng 201 – Tòa A"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày vào ở <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={rentalForm.moveInDate}
                  onChange={(e) => rf("moveInDate", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thời hạn thuê</label>
                <select
                  value={rentalForm.duration}
                  onChange={(e) => rf("duration", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="3">3 tháng</option>
                  <option value="6">6 tháng</option>
                  <option value="12">12 tháng</option>
                  <option value="24">24 tháng</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiền thuê/tháng (VNĐ) <span className="text-red-500">*</span>
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
                  <option>Hàng quý</option>
                  <option>6 tháng/lần</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dịch vụ đi kèm (phân cách bằng dấu phẩy)
                </label>
                <input
                  value={rentalForm.services}
                  onChange={(e) => rf("services", e.target.value)}
                  placeholder="Điện, Nước, Internet, Vệ sinh, Gửi xe..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="p-3.5 bg-blue-50 rounded-xl text-xs text-blue-700 border border-blue-100 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>
                Sau khi lập hợp đồng thuê, thông tin sẽ được{" "}
                <strong>tự động gửi sang Kế toán</strong> để tính toán khoản tiền thu nhận phòng đầu kỳ.
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
                  const { customer, phone, room, moveInDate, monthlyRent, depositRef } = rentalForm;
                  if (!customer || !phone || !room || !moveInDate || !monthlyRent || !depositRef) {
                    alert("Vui lòng điền đủ thông tin bắt buộc.");
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
