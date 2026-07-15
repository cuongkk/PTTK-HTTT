import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { FileText, ArrowLeft, CheckCircle, AlertCircle, Sparkles, Search, DoorOpen } from "lucide-react";
import { salesApi, type SalesRentalContract } from "../../services/sales/salesApi";
import { toast } from "sonner";

export function CheckoutContract() {
  const navigate = useNavigate();
  const location = useLocation();

  const [searchContractId, setSearchContractId] = useState("");
  const [foundContract, setFoundContract] = useState<SalesRentalContract | null>(null);
  const [checkoutForm, setCheckoutForm] = useState({ expectedDate: "", note: "" });
  const [validationError, setValidationError] = useState("");

  // Read query parameter and auto-load contract details
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const contractId = params.get("contractId");
    if (contractId) {
      setSearchContractId(contractId);
      salesApi.getContracts()
        .then((contracts) => {
          const found = contracts.find(
            (r) => r.contractId.toLowerCase() === contractId.toLowerCase()
          );
          if (found) {
            setFoundContract(found);
            setCheckoutForm({
              expectedDate: new Date().toISOString().split("T")[0],
              note: ""
            });
          }
        })
        .catch(console.error);
    }
  }, [location.search]);

  const handleSearchContract = async () => {
    if (!searchContractId.trim()) {
      toast.warning("Vui lòng nhập mã hợp đồng thuê.");
      return;
    }
    try {
      const contracts = await salesApi.getContracts();
      const found = contracts.find(
        (r) => r.contractId.toLowerCase() === searchContractId.trim().toLowerCase()
      );

      if (found) {
        setFoundContract(found);
        setValidationError("");
        setCheckoutForm({
          expectedDate: new Date().toISOString().split("T")[0],
          note: ""
        });
        toast.success(`Đã tìm thấy hợp đồng ${found.contractId} và tải thông tin!`);
      } else {
        setFoundContract(null);
        toast.error("Không tìm thấy hợp đồng thuê tương ứng. Vui lòng kiểm tra lại mã.");
      }
    } catch (err) {
      toast.error("Lỗi khi tải danh sách hợp đồng.");
    }
  };

  const handleCheckoutSubmit = async () => {
    if (!foundContract) return;

    if (!checkoutForm.expectedDate) {
      setValidationError("Lỗi (A7): Thời gian trả phòng dự kiến không được để trống!");
      return;
    }

    const today = new Date();
    const selectedDate = new Date(checkoutForm.expectedDate);
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      setValidationError("Lỗi (A7): Thời gian trả phòng dự kiến không được ở trong quá khứ! Vui lòng chọn ngày ở hiện tại hoặc tương lai.");
      return;
    }

    setValidationError("");

    try {
      await salesApi.checkoutContract(foundContract.contractId, {
        expectedDate: new Date(checkoutForm.expectedDate).toISOString(),
        note: checkoutForm.note,
      });

      toast.success("Hệ thống đã ghi nhận yêu cầu trả phòng thành công!\nTrạng thái lưu: \"Chờ kiểm tra hiện trạng\" (Quản lý sẽ kiểm tra tài sản).\nĐã tự động gửi thông báo lịch hẹn trả phòng cho khách hàng.");
      navigate("/sales/registrations?tab=checkout");
    } catch (err) {
      toast.error("Gửi yêu cầu trả phòng thất bại.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Breadcrumb / Back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/sales/registrations?tab=checkout")}
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
                placeholder="Nhập mã hợp đồng thuê (Vd: HDxxxxxxxxxx)"
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
                  <p><strong>Khách hàng:</strong> {foundContract.customerName}</p>
                  <p><strong>Số điện thoại:</strong> {foundContract.phoneNumber}</p>
                  <p><strong>Phòng thuê:</strong> {foundContract.roomName}</p>
                  <p><strong>Ngày vào ở:</strong> {new Date(foundContract.moveInDate).toLocaleDateString("vi-VN")}</p>
                  <p><strong>Giá thuê/tháng:</strong> {foundContract.monthlyRent.toLocaleString("vi-VN")} đ</p>
                  <p className="col-span-2">
                    <strong>Trạng thái:</strong>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${foundContract.status === "hieu_luc"
                      ? "bg-green-100 text-green-700"
                      : foundContract.status === "cho_tra_phong"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-gray-100 text-gray-700"}`}>
                      {foundContract.status === "hieu_luc" ? "Hiệu lực"
                        : foundContract.status === "cho_tra_phong" ? "Chờ trả phòng"
                        : foundContract.status}
                    </span>
                  </p>
                </div>
              </div>

              {foundContract.status === "cho_tra_phong" ? (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-xs text-yellow-800 space-y-1">
                  <p className="font-bold flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> Hợp đồng này đã gửi yêu cầu trả phòng trước đó!
                  </p>
                  <p>Ngày rời đi dự kiến: {foundContract.checkoutRequest ? new Date(foundContract.checkoutRequest.expectedDate).toLocaleDateString("vi-VN") : ""}</p>
                  <p>Lý do: {foundContract.checkoutRequest?.note}</p>
                </div>
              ) : (
                <div className="space-y-4 pt-2 border-t">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wide border-b pb-1">
                    Nhập thông tin trả phòng
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ngày rời đi dự kiến <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={checkoutForm.expectedDate}
                        onChange={(e) => setCheckoutForm({ ...checkoutForm, expectedDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lý do rời đi / Ghi chú
                    </label>
                    <textarea
                      rows={3}
                      value={checkoutForm.note}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, note: e.target.value })}
                      placeholder="Lý do kết thúc hợp đồng, bàn giao chìa khóa, hiện trạng tài sản sơ bộ..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-white"
                    />
                  </div>

                  {validationError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-1.5">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
                      <span>{validationError}</span>
                    </div>
                  )}

                  <div className="flex gap-3 pt-3 border-t">
                    <button
                      type="button"
                      onClick={() => setFoundContract(null)}
                      className="flex-1 px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                    >
                      Hủy & Chọn Hợp đồng khác
                    </button>
                    <button
                      type="button"
                      onClick={handleCheckoutSubmit}
                      className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" /> Xác nhận yêu cầu trả phòng
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400 bg-gray-50 border rounded-xl">
              <DoorOpen className="w-12 h-12 mx-auto mb-2 opacity-35 text-orange-500" />
              <p className="text-xs">Vui lòng tra cứu hợp đồng ở trên để bắt đầu tiếp nhận trả phòng.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
