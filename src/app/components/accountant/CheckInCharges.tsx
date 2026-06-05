import { useState } from "react";
import { Calculator, Save, User, Home, CheckCircle, Search } from "lucide-react";

export function CheckInCharges() {
  const [selectedContract, setSelectedContract] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [chargesData, setChargesData] = useState({
    firstMonthRent: "",
    otherFees: "",
    notes: "",
  });

  const pendingContracts = [
    {
      id: 1,
      contractId: "CT-2026-0501",
      customer: "Nguyễn Thị A",
      room: "Phòng 101 - Tòa A",
      moveInDate: "20 Thg 5, 2026",
      endDate: "20 Thg 11, 2026",
      bedCount: 1,
      rentPrice: 2500000,
      paymentCycle: "Hàng tháng",
      depositAmount: 5000000,
      firstMonthRent: 2500000,
      serviceFee: 200000,
      isComplete: true,
    },
    {
      id: 2,
      contractId: "CT-2026-0502",
      customer: "Trần Văn B",
      room: "Phòng 205 - Tòa B",
      moveInDate: "22 Thg 5, 2026",
      endDate: "",
      bedCount: 0,
      rentPrice: 0,
      paymentCycle: "",
      depositAmount: 0,
      firstMonthRent: 0,
      serviceFee: 0,
      isComplete: false,
    },
  ];

  const handleSelectContract = (contract: any) => {
    setSelectedContract(contract.id);
    setChargesData({
      firstMonthRent: contract.firstMonthRent?.toString() || "",
      otherFees: "",
      notes: "",
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Check-in charges saved successfully for contract ${selectedContract}!`);
    setSelectedContract(null);
    setChargesData({
      firstMonthRent: "",
      otherFees: "",
      notes: "",
    });
  };

  const totalAmount = 
    (parseFloat(chargesData.firstMonthRent) || 0) + 
    (parseFloat(chargesData.otherFees) || 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Khoản thu nhận phòng</h1>
        <p className="text-gray-600">Tính toán và nhập các khoản phí ban đầu cho khách thuê mới</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Contracts List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Hợp đồng chờ xử lý</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, phòng hoặc mã hợp đồng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="space-y-3">
            {pendingContracts
              .filter(
                (c) =>
                  c.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  c.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  c.contractId.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((contract) => (
              <div
                key={contract.id}
                onClick={() => handleSelectContract(contract)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedContract === contract.id
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
                  {contract.customer}
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <Home className="w-4 h-4 text-gray-500" />
                  {contract.room}
                </div>
              </div>
            ))}
            {pendingContracts.length === 0 && (
              <div className="p-8 text-center bg-gray-50 rounded-xl border border-gray-200 border-dashed">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-gray-600">Không có hợp đồng chờ nhận phòng.</p>
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
                  <h2 className="text-xl font-bold text-gray-900">Nhập phí</h2>
                  <p className="text-sm text-gray-600">
                    Cho {pendingContracts.find((c) => c.id === selectedContract)?.customer} (
                    {pendingContracts.find((c) => c.id === selectedContract)?.contractId})
                  </p>
                </div>
              </div>

              {!pendingContracts.find((c) => c.id === selectedContract)?.isComplete && (
                <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-orange-900 mb-1">Thông tin hợp đồng chưa đầy đủ!</p>
                      <p className="text-sm text-orange-700">
                        Hệ thống không thể trích xuất đủ các khoản thu. Vui lòng yêu cầu Sale cập nhật hợp đồng.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        alert("Đã gửi yêu cầu cập nhật hợp đồng đến bộ phận Sale!");
                        setSelectedContract(null);
                      }}
                      className="whitespace-nowrap px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Yêu cầu Sale cập nhật
                    </button>
                  </div>
                </div>
              )}

              {/* Chi tiết hợp đồng */}
              <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase">Thông tin chi tiết hợp đồng {pendingContracts.find((c) => c.id === selectedContract)?.contractId}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 block mb-1">Khách hàng:</span>
                    <span className="font-medium text-gray-900">{pendingContracts.find((c) => c.id === selectedContract)?.customer}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-1">Phòng:</span>
                    <span className="font-medium text-gray-900">{pendingContracts.find((c) => c.id === selectedContract)?.room}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-1">Số giường thuê:</span>
                    <span className="font-medium text-gray-900">{pendingContracts.find((c) => c.id === selectedContract)?.bedCount || "-"}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-1">Giá thuê tháng:</span>
                    <span className="font-medium text-gray-900">{pendingContracts.find((c) => c.id === selectedContract)?.rentPrice?.toLocaleString() || "0"} VNĐ</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-1">Kỳ thanh toán:</span>
                    <span className="font-medium text-gray-900">{pendingContracts.find((c) => c.id === selectedContract)?.paymentCycle || "-"}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-1">Ngày bắt đầu:</span>
                    <span className="font-medium text-gray-900">{pendingContracts.find((c) => c.id === selectedContract)?.moveInDate}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-1">Ngày kết thúc hợp đồng:</span>
                    <span className="font-medium text-gray-900">{pendingContracts.find((c) => c.id === selectedContract)?.endDate || "-"}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-1">Trạng thái thông tin:</span>
                    <span className={`font-medium ${pendingContracts.find((c) => c.id === selectedContract)?.isComplete ? "text-green-600" : "text-orange-600"}`}>
                      {pendingContracts.find((c) => c.id === selectedContract)?.isComplete ? "Đầy đủ" : "Chưa đầy đủ"}
                    </span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tiền phòng tháng đầu (VNĐ)
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={chargesData.firstMonthRent}
                      onChange={(e) => setChargesData({ ...chargesData, firstMonthRent: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="VD: 5000000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phí khác (VNĐ)
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
                      Ghi chú
                    </label>
                    <textarea
                      value={chargesData.notes}
                      onChange={(e) => setChargesData({ ...chargesData, notes: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                      placeholder="Ghi chú tùy chọn..."
                    />
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                  <span className="text-gray-700 font-medium">Tổng tiền cần thu:</span>
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
                    disabled={!pendingContracts.find((c) => c.id === selectedContract)?.isComplete}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      pendingContracts.find((c) => c.id === selectedContract)?.isComplete
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    <Save className="w-4 h-4" />
                    Lưu & Xác nhận
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-gray-200 border-dashed text-gray-500 p-8">
              <Calculator className="w-12 h-12 mb-4 text-gray-400" />
              <p className="text-lg font-medium text-gray-900 mb-1">Chưa chọn hợp đồng</p>
              <p className="text-center max-w-sm">
                Chọn một hợp đồng chờ xử lý từ danh sách để tính toán và nhập phí nhận phòng.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
