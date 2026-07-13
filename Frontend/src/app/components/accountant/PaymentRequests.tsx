import { useState, useEffect } from "react";
import { Send, User, Home, DollarSign, Search, Clock, Calculator } from "lucide-react";
import { accountantService, ContractInvoiceInfo, Invoice } from "../../services/accountantService";

function GetInvoiceTypeName(type: string) {
  switch (type) {
    case "tien_coc":
      return "Tiền cọc phòng";
    case "tien_thue":
      return "Tiền thuê phòng";
    case "dich_vu":
      return "Phí dịch vụ";
    case "hoan_coc":
      return "Hoàn tiền cọc";
    case "thu_them":
      return "Thu thêm đối soát";
    default:
      return type;
  }
}

export function PaymentRequests() {
  const [selectedContract, setSelectedContract] = useState<ContractInvoiceInfo | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [pendingContracts, setPendingContracts] = useState<ContractInvoiceInfo[]>([]);
  const [sentRequests, setSentRequests] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sentSearchTerm, setSentSearchTerm] = useState("");
  const [sentStatusFilter, setSentStatusFilter] = useState("all");

  const [formData, setFormData] = useState({
    paymentType: "tien_coc",
    amount: "",
    dueDate: "",
    billingCycle: "",
    notes: "",
  });

  const [depositCalc, setDepositCalc] = useState({
    rentPrice: 0,
    bedCount: 1,
  });

  useEffect(() => {
    if (formData.paymentType === "tien_coc" && selectedContract) {
      const calculatedAmount = depositCalc.rentPrice * 2 * depositCalc.bedCount;
      setFormData(prev => ({ ...prev, amount: calculatedAmount.toString() }));
    }
  }, [depositCalc.rentPrice, depositCalc.bedCount, formData.paymentType, selectedContract]);

  async function loadData() {
    try {
      const [pending, sent] = await Promise.all([
        accountantService.getPendingContractsForInvoice(),
        accountantService.getSentRequests(),
      ]);
      setPendingContracts(pending);
      setSentRequests(sent);
    } catch (err) {
      console.error("Lỗi khi tải danh sách yêu cầu thanh toán:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContract) return;

    if (!window.confirm(`Bạn có chắc chắn muốn gửi yêu cầu thanh toán trị giá ${Number(formData.amount).toLocaleString()} VNĐ cho khách hàng ${selectedContract.customerName} không?`)) {
      return;
    }

    setSubmitting(true);
    try {
      const isDeposit = formData.paymentType === "tien_coc";
      const isRent = formData.paymentType === "tien_thue";

      await accountantService.createInvoiceRequest({
        customerId: selectedContract.customerId,
        depositId: isDeposit ? selectedContract.contractId : undefined,
        contractId: !isDeposit ? selectedContract.contractId : undefined,
        invoiceType: formData.paymentType,
        totalAmount: Number(formData.amount),
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
        billingCycle: formData.billingCycle ? `${formData.billingCycle}-01` : undefined,
        notes: formData.notes,
      });

      alert("Đã gửi yêu cầu thanh toán thành công!");
      setSelectedContract(null);
      setFormData({
        paymentType: "tien_coc",
        amount: "",
        dueDate: "",
        billingCycle: "",
        notes: "",
      });
      loadData();
    } catch (err) {
      console.error("Lỗi khi tạo yêu cầu thanh toán:", err);
      alert("Đã xảy ra lỗi khi tạo yêu cầu thanh toán.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectContract = (contract: ContractInvoiceInfo) => {
    setSelectedContract(contract);
    // Tự động gán mặc định loại dựa trên mã
    const isDeposit = contract.contractId.startsWith("DC") || contract.id.startsWith("DC") || !contract.contractId.includes("HD");
    
    const initialRentPrice = contract.monthlyRent || 0;
    const initialBedCount = contract.bedCount || 1;
    const calculatedAmount = isDeposit ? initialRentPrice * 2 * initialBedCount : "";

    setDepositCalc({
      rentPrice: initialRentPrice,
      bedCount: initialBedCount,
    });

    setFormData({
      paymentType: isDeposit ? "tien_coc" : "tien_thue",
      amount: calculatedAmount.toString(),
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0], // Hạn thanh toán mặc định 24h sau
      billingCycle: new Date().toISOString().substring(0, 7), // Tháng hiện tại
      notes: "",
    });
  };

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
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Yêu cầu thanh toán</h1>
        </div>
      </div>

      {/* Create Form Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Contracts List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 font-sans">Hồ sơ chờ lập hóa đơn</h2>
          </div>

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
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedContract?.id === contract.id
                    ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                    : "border-gray-200 bg-white hover:border-blue-300"
                    }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-bold text-blue-600">
                      Mã: {contract.contractId}
                    </span>
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
              <div className="p-8 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
                Không có hồ sơ nào chờ lập hóa đơn.
              </div>
            )}
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          {selectedContract ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Tạo yêu cầu thanh toán</h2>
                    <p className="text-sm text-gray-600">
                      Gửi cho khách hàng: <span className="font-semibold text-gray-900">{selectedContract.customerName}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                  <Clock className="w-3.5 h-3.5" />
                  Tạo lúc: {new Date().toLocaleString("vi-VN")}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Loại thanh toán</label>
                    <select
                      required
                      value={formData.paymentType}
                      onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                      <option value="tien_coc">Tiền cọc phòng</option>
                      <option value="tien_thue">Tiền thuê phòng tháng</option>
                      <option value="dich_vu">Phí dịch vụ sinh hoạt</option>
                      <option value="thu_them">Thu thêm đối soát</option>
                    </select>
                  </div>

                  {formData.paymentType === "tien_coc" ? (
                    <div className="md:col-span-2">
                      <div className="flex items-center gap-2 mb-3">
                        <Calculator className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-semibold text-gray-700">Công thức tính cọc</span>
                        <span className="text-xs text-gray-400 ml-auto">= (Tiền thuê 2 tháng) × (Số giường thuê)</span>
                      </div>
                      <div className="flex items-end gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-gray-600 mb-1.5">Đơn giá (VNĐ/tháng)</label>
                          <input
                            type="number"
                            required
                            min="0"
                            value={depositCalc.rentPrice}
                            onChange={(e) => setDepositCalc({ ...depositCalc, rentPrice: Number(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                          />
                        </div>
                        <span className="text-gray-400 font-bold pb-2.5">×</span>
                        <div className="w-20">
                          <label className="block text-xs font-medium text-gray-600 mb-1.5">Số tháng</label>
                          <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-center font-semibold text-gray-700">
                            2
                          </div>
                        </div>
                        <span className="text-gray-400 font-bold pb-2.5">×</span>
                        <div className="w-24">
                          <label className="block text-xs font-medium text-gray-600 mb-1.5">Số giường</label>
                          <input
                            type="number"
                            required
                            min="1"
                            value={depositCalc.bedCount}
                            onChange={(e) => setDepositCalc({ ...depositCalc, bedCount: Number(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                          />
                        </div>
                        <span className="text-gray-400 font-bold pb-2.5">=</span>
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-blue-700 mb-1.5">Tổng tiền cọc</label>
                          <div className="px-3 py-2 bg-white rounded-lg border-2 border-blue-300 text-blue-700 font-bold text-sm">
                            {(depositCalc.rentPrice * 2 * depositCalc.bedCount).toLocaleString()} VNĐ
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Số tiền (VNĐ)</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Nhập số tiền"
                      />
                    </div>
                  )}

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hạn chót thanh toán</label>
                    <input
                      type="date"
                      required
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>

                  {(formData.paymentType === "tien_thue" || formData.paymentType === "dich_vu") && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Kỳ thanh toán (Tháng/Năm)</label>
                      <input
                        type="month"
                        required
                        value={formData.billingCycle}
                        onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                  )}

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ghi chú / Nội dung hướng dẫn
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                      placeholder="Nhập thông tin hướng dẫn thanh toán cho khách..."
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-6">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    {submitting ? "Đang xử lý..." : "Gửi yêu cầu thanh toán"}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-gray-200 border-dashed text-gray-500 p-8">
              <Send className="w-12 h-12 mb-4 text-gray-400" />
              <p className="text-lg font-medium text-gray-900 mb-1">Chưa chọn hồ sơ</p>
              <p className="text-center max-w-sm">
                Hãy chọn một hồ sơ cọc hoặc hợp đồng thuê ở cột bên trái để bắt đầu lập yêu cầu thanh toán.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Sent Requests List */}
      {(() => {
        const filteredSentRequests = sentRequests.filter((request) => {
          // 1. Search term filter
          const matchesSearch = 
            request.invoiceId.toLowerCase().includes(sentSearchTerm.toLowerCase()) ||
            request.customerName.toLowerCase().includes(sentSearchTerm.toLowerCase()) ||
            (request.roomName && request.roomName.toLowerCase().includes(sentSearchTerm.toLowerCase()));

          if (!matchesSearch) return false;
          if (sentStatusFilter === "all") return true;

          const isExpired = (request.dueDate && new Date(request.dueDate) < new Date() && request.status === "cho_thanh_toan") || request.status === "huy";

          if (sentStatusFilter === "da_thanh_toan") {
            return request.status === "da_thanh_toan";
          }
          if (sentStatusFilter === "cho_thanh_toan") {
            return request.status === "cho_thanh_toan" && !isExpired;
          }
          if (sentStatusFilter === "huy") {
            return isExpired;
          }

          return true;
        });

        return (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-8">
            <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Danh sách yêu cầu thanh toán đã phát hành</h2>
                <p className="text-sm text-gray-500">Quản lý và theo dõi các yêu cầu thanh toán đã gửi</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm mã hóa đơn, tên khách..."
                    value={sentSearchTerm}
                    onChange={(e) => setSentSearchTerm(e.target.value)}
                    className="w-full sm:w-64 pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                <select
                  value={sentStatusFilter}
                  onChange={(e) => setSentStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="cho_thanh_toan">Chờ thanh toán</option>
                  <option value="da_thanh_toan">Đã thanh toán</option>
                  <option value="huy">Đã hủy / Quá hạn</option>
                </select>
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {filteredSentRequests.map((request) => (
                <div key={request.invoiceId} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <DollarSign className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 mb-1">
                            <span className="font-mono mr-2">{request.invoiceId}</span> — {request.customerName}
                          </h3>
                          <p className="text-sm text-gray-600">{request.roomName}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm ml-0 lg:ml-15 mt-2 lg:mt-0">
                        <div>
                          <p className="text-gray-600">Loại khoản thu</p>
                          <p className="font-medium text-gray-900">{GetInvoiceTypeName(request.invoiceType)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Số tiền</p>
                          <p className="font-medium text-gray-900">{request.totalAmount.toLocaleString()} VNĐ</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Thời điểm tạo</p>
                          <p className="font-medium text-gray-900">{new Date(request.createdAt).toLocaleString("vi-VN")}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Hạn thanh toán</p>
                          <p className="font-medium text-gray-900">{request.dueDate ? new Date(request.dueDate).toLocaleString("vi-VN") : "—"}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Trạng thái</p>
                          <span className={`px-2 py-0.5 inline-block text-xs font-semibold rounded-full ${
                            request.status === "da_thanh_toan" ? "bg-green-100 text-green-800"
                            : (request.status === "huy" || (request.dueDate && new Date(request.dueDate) < new Date())) ? "bg-red-100 text-red-800"
                            : "bg-orange-100 text-orange-800"
                          }`}>
                            {request.status === "da_thanh_toan" ? "Đã thanh toán"
                            : (request.status === "huy" || (request.dueDate && new Date(request.dueDate) < new Date())) ? "Đã hủy / Quá hạn"
                            : "Chờ thanh toán"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {filteredSentRequests.length === 0 && (
                <div className="p-8 text-center text-gray-500">Không tìm thấy yêu cầu thanh toán nào phù hợp với bộ lọc.</div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
