import { useState, useEffect } from "react";
import { Calculator, Save, User, Home, CheckCircle, Search } from "lucide-react";
import { accountantService, CheckInContract } from "../../services/accountantService";

export function CheckInCharges() {
  const [selectedContract, setSelectedContract] = useState<CheckInContract | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [pendingContracts, setPendingContracts] = useState<CheckInContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [chargesData, setChargesData] = useState({
    firstMonthRent: "",
    otherFees: "",
    notes: "",
  });

  async function loadPendingContracts() {
    try {
      const list = await accountantService.getPendingCheckInContracts();
      setPendingContracts(list);
    } catch (err) {
      console.error("Lỗi khi tải danh sách hợp đồng nhận phòng:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPendingContracts();
  }, []);

  const handleSelectContract = (contract: CheckInContract) => {
    setSelectedContract(contract);
    setChargesData({
      firstMonthRent: contract.firstMonthRent?.toString() || "",
      otherFees: contract.serviceFee?.toString() || "",
      notes: "",
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContract) return;

    if (!window.confirm(`Bạn có chắc chắn muốn lưu và phát hành hóa đơn nhận phòng trị giá ${totalAmount.toLocaleString()} VNĐ cho hợp đồng ${selectedContract.contractId} không?`)) {
      return;
    }

    setSubmitting(true);
    try {
      await accountantService.saveCheckInCharges({
        contractId: selectedContract.contractId,
        firstMonthRent: Number(chargesData.firstMonthRent),
        otherFees: Number(chargesData.otherFees),
        notes: chargesData.notes,
      });

      alert(`Khoản thu nhận phòng của hợp đồng ${selectedContract.contractId} đã được lưu thành công!`);
      setSelectedContract(null);
      setChargesData({
        firstMonthRent: "",
        otherFees: "",
        notes: "",
      });
      loadPendingContracts();
    } catch (err) {
      console.error("Lỗi khi lưu khoản thu nhận phòng:", err);
      alert("Đã xảy ra lỗi khi lưu khoản thu nhận phòng.");
    } finally {
      setSubmitting(false);
    }
  };

  const totalAmount = 
    (parseFloat(chargesData.firstMonthRent) || 0) + 
    (parseFloat(chargesData.otherFees) || 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-gray-900">Khoản thu nhận phòng</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Contracts List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Hợp đồng chờ nhận phòng</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo tên hoặc số phòng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {pendingContracts
              .filter(
                (c) =>
                  c.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  c.roomName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  c.contractId.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((contract) => (
                <div
                  key={contract.id}
                  onClick={() => handleSelectContract(contract)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedContract?.id === contract.id
                      ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                      : "border-gray-200 bg-white hover:border-blue-300"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-bold text-blue-600">{contract.contractId}</span>
                    <span className="text-xs text-gray-500">{contract.moveInDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-900 font-medium mb-1">
                    <User className="w-4 h-4 text-gray-500" />
                    {contract.customerName}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <Home className="w-4 h-4 text-gray-500" />
                    {contract.roomName}
                  </div>
                </div>
              ))}
            {pendingContracts.length === 0 && (
              <div className="p-8 text-center bg-gray-50 rounded-xl border border-gray-200 border-dashed">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-gray-600">Không có hợp đồng nào chờ nhận phòng.</p>
              </div>
            )}
          </div>
        </div>

        {/* Input Form */}
        <div className="lg:col-span-2">
          {selectedContract ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calculator className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900">Tính toán khoản thu nhận phòng</h2>
                  <p className="text-sm text-gray-600">
                    Khách thuê: <span className="font-semibold text-gray-950">{selectedContract.customerName}</span> ({selectedContract.contractId})
                  </p>
                </div>
              </div>

              {!selectedContract.isComplete && (
                <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-orange-900 mb-1">Thông tin hợp đồng chưa đầy đủ!</p>
                      <p className="text-sm text-orange-700">
                        Hợp đồng này thiếu thông tin giá thuê hoặc số giường. Vui lòng liên hệ bộ phận Sale để cập nhật trước khi tính toán.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        alert("Đã gửi yêu cầu phản hồi cập nhật hợp đồng tới bộ phận Sale!");
                        setSelectedContract(null);
                      }}
                      className="whitespace-nowrap px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Gửi yêu cầu chỉnh sửa
                    </button>
                  </div>
                </div>
              )}

              {/* Chi tiết hợp đồng */}
              <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Chi tiết hợp đồng</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 block mb-1">Khách thuê chính:</span>
                    <span className="font-medium text-gray-900">{selectedContract.customerName}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-1">Phòng xếp:</span>
                    <span className="font-medium text-gray-900">{selectedContract.roomName}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-1">Số giường thuê:</span>
                    <span className="font-medium text-gray-900">{selectedContract.bedCount} giường</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-1">Đơn giá thuê tháng:</span>
                    <span className="font-medium text-gray-950 font-semibold">{selectedContract.rentPrice.toLocaleString()} VNĐ</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-1">Chu kỳ thanh toán:</span>
                    <span className="font-medium text-gray-900">{selectedContract.paymentCycle}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-1">Ngày dự kiến nhận phòng:</span>
                    <span className="font-medium text-gray-900">{selectedContract.moveInDate}</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tiền thuê phòng tháng đầu (VNĐ)
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={chargesData.firstMonthRent}
                      onChange={(e) => setChargesData({ ...chargesData, firstMonthRent: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="VD: 2500000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phí dịch vụ & Khác (VNĐ)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={chargesData.otherFees}
                      onChange={(e) => setChargesData({ ...chargesData, otherFees: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="VD: 200000"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ghi chú phát sinh
                    </label>
                    <textarea
                      value={chargesData.notes}
                      onChange={(e) => setChargesData({ ...chargesData, notes: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                      placeholder="Nhập thông tin ghi chú..."
                    />
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                  <span className="text-gray-700 font-medium">Tổng số tiền cần thu đầu kỳ:</span>
                  <span className="text-2xl font-bold text-blue-600">{totalAmount.toLocaleString()} VNĐ</span>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-6">
                  <button
                    type="button"
                    onClick={() => setSelectedContract(null)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !selectedContract.isComplete}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedContract.isComplete && !submitting
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    <Save className="w-4 h-4" />
                    {submitting ? "Đang xử lý..." : "Lưu & Phát hành thông báo khoản thu"}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-gray-200 border-dashed text-gray-500 p-8">
              <Calculator className="w-12 h-12 mb-4 text-gray-400" />
              <p className="text-lg font-medium text-gray-900 mb-1">Chưa chọn hợp đồng</p>
              <p className="text-center max-w-sm">
                Hãy chọn một hợp đồng chờ nhận phòng từ cột bên trái để nhập và thiết lập các khoản phí ban đầu.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
