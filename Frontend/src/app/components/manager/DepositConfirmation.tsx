import { useState } from "react";
import { ArrowUpRight, Search } from "lucide-react";

export function DepositConfirmation() {
  // Thay đổi cách quản lý: Thay vì lưu id hoặc boolean, ta lưu cả object deposit đang được chọn
  const [selectedDeposit, setSelectedDeposit] = useState<any | null>(null);
  const [search, setSearch] = useState("");

  const deposits = [
    {
      id: 1,
      contractCode: "DC001",
      customer: "Nguyễn Văn A",
      room: "Room 501",
      depositAmount: "2.000.000 VNĐ",
      status: "Chờ xác nhận",
      date: "25/6/2026",
    },
    {
      id: 2,
      contractCode: "DC002",
      customer: "Trần Văn B",
      room: "Room 203",
      depositAmount: "2.500.000 VNĐ", // Sửa nhẹ dữ liệu mẫu để thấy rõ sự thay đổi khi click
      status: "Chờ xác nhận",
      date: "26/6/2026",
    },
    {
      id: 3,
      contractCode: "DC003",
      customer: "Lê Văn C",
      room: "Room 404",
      depositAmount: "3.000.000 VNĐ", // Sửa nhẹ dữ liệu mẫu để thấy rõ sự thay đổi khi click
      status: "Chờ xác nhận",
      date: "27/6/2026",
    },
  ];

  // Logic lọc tìm kiếm dữ liệu phòng
  const filteredDeposits = deposits.filter((deposit) => {
    const query = search.toLowerCase();
    return (
      deposit.contractCode.toLowerCase().includes(query) ||
      deposit.customer.toLowerCase().includes(query) ||
      deposit.room.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Xác nhận tiền cọc</h1>
        <p className="text-gray-600">Xác nhận thông tin tiền cọc của khách hàng</p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input 
          type="text" 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          placeholder="Tìm theo mã hợp đồng, tên khách, số phòng..." 
          className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white" 
        />
      </div>

      {/* Room List */}
      {filteredDeposits.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredDeposits.map((deposit) => (
            <div
              key={deposit.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {deposit.contractCode}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {deposit.customer}
                  </p>
                </div>

                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                  {deposit.status}
                </span>
              </div>

              <div className="space-y-2 mb-4 text-sm">
                <p>
                  <span className="text-gray-600">Phòng:</span>{" "}
                  {deposit.room}
                </p>

                <p>
                  <span className="text-gray-600">Tiền cọc:</span>{" "}
                  {deposit.depositAmount}
                </p>
              </div>

              <button
                onClick={() => setSelectedDeposit(deposit)} // Truyền thẳng dữ liệu thẻ hiện tại vào state
                className="inline-flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-sm hover:shadow transition-all group"
              >   
                Xem chi tiết <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 bg-white rounded-xl border border-gray-200">
          Không tìm thấy kết quả nào phù hợp với từ khóa "{search}"
        </div>
      )}

      {/* Inspection Form Modal */}
      {selectedDeposit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">

            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Thông tin đặt cọc
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mã hợp đồng
                </label>
                <input
                  value={selectedDeposit.contractCode}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Khách hàng
                </label>
                <input
                  value={selectedDeposit.customer}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phòng
                </label>
                <input
                  value={selectedDeposit.room}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiền cọc
                </label>
                <input
                  value={selectedDeposit.depositAmount}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày lập
                </label>
                <input
                  value={selectedDeposit.date}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chứng từ thanh toán
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500 bg-gray-50">
                  Hình ảnh chứng từ thanh toán của {selectedDeposit.customer}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-6">
              <button
                onClick={() => setSelectedDeposit(null)} // Đóng modal bằng cách set về null
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors font-medium"
              >
                Đóng
              </button>

              <button
                onClick={() => {
                  alert(`Từ chối chứng từ mã: ${selectedDeposit.contractCode}`);
                  setSelectedDeposit(null);
                }}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
              >
                Không hợp lệ
              </button>

              <button
                onClick={() => {
                  alert(`Duyệt thành công chứng từ mã: ${selectedDeposit.contractCode}`);
                  setSelectedDeposit(null);
                }}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
              >
                Xác nhận hợp lệ
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}