import { useState } from "react";
import { Send, User, Home, DollarSign, Calendar, CheckCircle, Search } from "lucide-react";

export function PaymentRequests() {
  const [selectedContract, setSelectedContract] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    paymentType: "deposit",
    amount: "",
    dueDate: "",
    billingCycle: "",
    notes: "",
  });

  const pendingContracts = [
    { id: 1, name: "Nguyễn Văn A", room: "Phòng 203 - Tòa A", contractId: "CT-2026-0601" },
    { id: 2, name: "Trần Thị B", room: "Phòng 102 - Tòa C", contractId: "CT-2026-0604" },
    { id: 3, name: "Lê Văn C", room: "Phòng 501 - Tòa A", contractId: "CT-2026-0605" },
  ];

  const sentRequests = [
    {
      id: 1,
      customer: "Phạm Thị D",
      room: "Phòng 305 - Tòa B",
      type: "Tiền cọc",
      amount: 8000000,
      dueDate: "14 Thg 5, 2026",
      sentDate: "13 Thg 5, 2026",
      status: "Chờ thanh toán",
    },
    {
      id: 2,
      customer: "Ngô Văn E",
      room: "Phòng 404 - Tòa A",
      type: "Tiền phòng tháng",
      amount: 2500000,
      dueDate: "15 Thg 5, 2026",
      sentDate: "14 Thg 5, 2026",
      status: "Chờ thanh toán",
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Đã gửi yêu cầu thanh toán thành công!");
    setSelectedContract(null);
    setFormData({
      paymentType: "deposit",
      amount: "",
      dueDate: "",
      billingCycle: "",
      notes: "",
    });
  };

  const handleSelectContract = (id: number) => {
    setSelectedContract(id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Yêu cầu thanh toán</h1>
          <p className="text-gray-600">Gửi yêu cầu thanh toán cho khách</p>
        </div>
      </div>

      {/* Create Form Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Contracts List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Hợp đồng chờ xử lý</h2>
          </div>

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
                  c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  c.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  c.contractId.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((contract) => (
                <div
                  key={contract.id}
                  onClick={() => handleSelectContract(contract.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedContract === contract.id
                    ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                    : "border-gray-200 bg-white hover:border-blue-300"
                    }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-bold text-blue-600">{contract.contractId}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-900 font-medium mb-1">
                    <User className="w-4 h-4 text-gray-500" />
                    {contract.name}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <Home className="w-4 h-4 text-gray-500" />
                    {contract.room}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          {selectedContract ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Tạo yêu cầu thanh toán</h2>
                  <p className="text-sm text-gray-600">
                    Cho {pendingContracts.find((c) => c.id === selectedContract)?.name}
                  </p>
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
                      <option value="deposit">Tiền cọc</option>
                      <option value="rent">Tiền phòng tháng</option>
                      <option value="service">Phí dịch vụ</option>
                      <option value="utilities">Tiền điện nước</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Số tiền (VNĐ)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="Nhập số tiền"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hạn chót</label>
                    <input
                      type="date"
                      required
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>

                  {(formData.paymentType === "rent" || formData.paymentType === "utilities") && (
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
                      Ghi chú (Không bắt buộc)
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                      placeholder="Thêm ghi chú bất kỳ..."
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-6">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    Gửi yêu cầu
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-gray-200 border-dashed text-gray-500 p-8">
              <Send className="w-12 h-12 mb-4 text-gray-400" />
              <p className="text-lg font-medium text-gray-900 mb-1">Chưa chọn hợp đồng</p>
              <p className="text-center max-w-sm">
                Chọn một hợp đồng chờ xử lý từ danh sách để tạo yêu cầu thanh toán.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Sent Requests */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-8">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Yêu cầu đã gửi</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {sentRequests.map((request) => (
            <div key={request.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">{request.customer}</h3>
                      <p className="text-sm text-gray-600">{request.room}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm ml-0 lg:ml-15 mt-2 lg:mt-0">
                    <div>
                      <p className="text-gray-600">Loại</p>
                      <p className="font-medium text-gray-900">{request.type}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Số tiền</p>
                      <p className="font-medium text-gray-900">{request.amount.toLocaleString()} VNĐ</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Hạn chót</p>
                      <p className="font-medium text-gray-900">{request.dueDate}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Ngày gửi</p>
                      <p className="font-medium text-gray-900">{request.sentDate}</p>
                    </div>
                  </div>
                </div>

                <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm font-medium rounded-full self-start lg:self-auto">
                  {request.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
