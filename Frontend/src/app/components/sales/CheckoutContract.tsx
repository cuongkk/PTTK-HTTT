import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { FileText, ArrowLeft, CheckCircle, AlertCircle, Sparkles, Search, DoorOpen } from "lucide-react";

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
  checkoutRequest?: { requestDate: string; expectedDate: string; note: string };
}

const INITIAL_RENTALS: RentalContract[] = [
  { id: 1, contractId: "HDT-2026-001", type: "rental", customer: "Nguyễn Văn A", phone: "0934567890", room: "Phòng 102 – Tòa C", moveInDate: "15/01/2026", duration: 12, monthlyRent: 2000000, services: ["Điện", "Nước", "Internet"], paymentCycle: "Hàng tháng", depositRef: "HDC-2025-011", status: "Hiệu lực", createdDate: "10/01/2026" },
];

export function CheckoutContract() {
  const navigate = useNavigate();
  const location = useLocation();

  const [rentals, setRentals] = useState<RentalContract[]>(() => {
    const saved = localStorage.getItem("roommanager_rentals");
    return saved ? JSON.parse(saved) : INITIAL_RENTALS;
  });

  const [searchContractId, setSearchContractId] = useState("");
  const [foundContract, setFoundContract] = useState<RentalContract | null>(null);
  const [checkoutForm, setCheckoutForm] = useState({ expectedDate: "", note: "" });
  const [validationError, setValidationError] = useState("");

  // Synchronize component state with localStorage rentals array
  useEffect(() => {
    localStorage.setItem("roommanager_rentals", JSON.stringify(rentals));
  }, [rentals]);

  // Read query parameter and auto-load contract details
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const contractId = params.get("contractId");
    if (contractId) {
      setSearchContractId(contractId);
      const found = rentals.find(
        (r) => r.contractId.toLowerCase() === contractId.toLowerCase()
      );
      if (found) {
        setFoundContract(found);
      }
    }
  }, [location.search, rentals]);

  const handleSearchContract = () => {
    if (!searchContractId.trim()) {
      alert("Vui lòng nhập mã hợp đồng thuê.");
      return;
    }
    const found = rentals.find(
      (r) => r.contractId.toLowerCase() === searchContractId.trim().toLowerCase()
    );

    if (found) {
      setFoundContract(found);
      setValidationError("");
      alert(`Đã tìm thấy hợp đồng ${found.contractId} và tải thông tin!`);
    } else {
      setFoundContract(null);
      alert("Không tìm thấy hợp đồng thuê tương ứng. Vui lòng kiểm tra lại mã.");
    }
  };

  const handleCheckoutSubmit = () => {
    if (!foundContract) return;

    if (!checkoutForm.expectedDate) {
      setValidationError("Lỗi (A7): Thời gian trả phòng dự kiến không được để trống!");
      return;
    }

    const today = new Date("2026-06-06T00:00:00");
    const selectedDate = new Date(checkoutForm.expectedDate);
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      setValidationError("Lỗi (A7): Thời gian trả phòng dự kiến không được ở trong quá khứ! Vui lòng chọn ngày ở hiện tại hoặc tương lai.");
      return;
    }

    setValidationError("");

    const updatedRentals = rentals.map((r) =>
      r.contractId === foundContract.contractId
        ? {
            ...r,
            status: "Chờ trả phòng" as const,
            checkoutRequest: {
              requestDate: new Date().toLocaleDateString("vi-VN"),
              expectedDate: new Date(checkoutForm.expectedDate).toLocaleDateString("vi-VN"),
              note: checkoutForm.note,
            },
          }
        : r
    );

    setRentals(updatedRentals);
    // Write directly to local storage to ensure it updates immediately
    localStorage.setItem("roommanager_rentals", JSON.stringify(updatedRentals));

    alert("Hệ thống đã ghi nhận yêu cầu trả phòng thành công!\nTrạng thái lưu: \"Chờ kiểm tra hiện trạng\" (Quản lý sẽ kiểm tra tài sản).\nĐã tự động gửi thông báo lịch hẹn trả phòng cho khách hàng.");
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
        <div className="flex items-center gap-1.5 px-3 py-1 bg-orange-50 rounded-full text-orange-700 text-xs font-semibold border border-orange-100">
          <Sparkles className="w-3.5 h-3.5" />
          Màn hình Tiếp nhận trả phòng
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <DoorOpen className="w-5 h-5 text-orange-500" />
            Tiếp nhận yêu cầu trả phòng
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Ghi nhận ngày rời đi dự kiến và lý do trả phòng của khách thuê. Khởi động quy trình kiểm tra tài sản.
          </p>
        </div>

        <div className="p-6 space-y-5">
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wide border-b pb-1">
            Tra cứu thông tin hợp đồng (Include Relationship)
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mã hợp đồng thuê cần trả phòng <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                value={searchContractId}
                onChange={(e) => setSearchContractId(e.target.value)}
                placeholder="Nhập mã hợp đồng thuê (Vd: HDT-2026-001)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                type="button"
                onClick={handleSearchContract}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5"
              >
                <Search className="w-4 h-4" /> Tìm hợp đồng
              </button>
            </div>
          </div>

          {foundContract ? (
            <div className="space-y-5">
              <div className="bg-gray-50 p-4 border border-gray-150 rounded-xl space-y-2 text-xs text-gray-700">
                <h4 className="font-bold text-gray-900 uppercase tracking-wide text-[10px] mb-1">
                  Thông tin hợp đồng hiện tại
                </h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <p><strong>Mã hợp đồng:</strong> {foundContract.contractId}</p>
                  <p><strong>Khách hàng:</strong> {foundContract.customer}</p>
                  <p><strong>Số điện thoại:</strong> {foundContract.phone}</p>
                  <p><strong>Phòng thuê:</strong> {foundContract.room}</p>
                  <p><strong>Ngày vào ở:</strong> {foundContract.moveInDate}</p>
                  <p><strong>Giá thuê/tháng:</strong> {foundContract.monthlyRent.toLocaleString("vi-VN")} đ</p>
                  <p className="col-span-2">
                    <strong>Trạng thái:</strong>{" "}
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        foundContract.status === "Hiệu lực"
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {foundContract.status}
                    </span>
                  </p>
                </div>

                {foundContract.status !== "Hiệu lực" && foundContract.status !== "Chờ trả phòng" && (
                  <div className="mt-3 p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-center gap-1.5 text-xs text-red-800">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <span>Hợp đồng này hiện tại không có hiệu lực để tiếp nhận trả phòng.</span>
                  </div>
                )}
              </div>

              {(foundContract.status === "Hiệu lực" || foundContract.status === "Chờ trả phòng") && (
                <div className="space-y-4 pt-2 border-t">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wide border-b pb-1">
                    Thông tin trả phòng
                  </p>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày dự kiến rời đi <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={checkoutForm.expectedDate}
                      onChange={(e) => setCheckoutForm((prev) => ({ ...prev, expectedDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ghi chú / Lý do trả phòng
                    </label>
                    <textarea
                      value={checkoutForm.note}
                      onChange={(e) => setCheckoutForm((prev) => ({ ...prev, note: e.target.value }))}
                      rows={3}
                      placeholder="Nhập lý do trả phòng hoặc ghi chú thêm..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    />
                  </div>

                  {validationError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700">
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <span>{validationError}</span>
                    </div>
                  )}

                  <div className="p-3.5 bg-orange-50 rounded-xl text-xs text-orange-700 border border-orange-100 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                    <span>
                      Sau khi xác nhận, trạng thái sẽ cập nhật thành{" "}
                      <strong>"Chờ kiểm tra hiện trạng"</strong> và tự động gửi lịch hẹn kiểm tra tài sản đến khách thuê.
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
                      onClick={handleCheckoutSubmit}
                      className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" /> Xác nhận yêu cầu trả phòng
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-400 border border-dashed rounded-xl">
              <FileText className="w-10 h-10 mx-auto opacity-30 mb-2" />
              <p className="text-xs">
                Vui lòng nhập và tìm kiếm mã hợp đồng thuê để hiển thị biểu mẫu tiếp nhận trả phòng.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
