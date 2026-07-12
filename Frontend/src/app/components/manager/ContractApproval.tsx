import { useState } from "react";
import { FileCheck, CheckCircle, XCircle, Eye, MessageSquare, Building2, User, Phone, CreditCard } from "lucide-react";

export function ContractApproval() {
  const pendingContracts = [
    {
      id: 1,
      contractId: "HDDC-2026-0002",
      type: "Hợp đồng đặt cọc",
      customer: "Sarah Johnson",
      phone: "0901 234 567",
      cccd: "001096001234",
      room: "Phòng 305 - Tòa B",
      amount: 600,
      depositAmount: 600,
      startDate: "20/05/2026",
      duration: "6 tháng",
      createdBy: "Nhân viên kinh doanh - Alice",
      submittedDate: "13/05/2026",
      status: "Chờ duyệt",
    },
    {
      id: 2,
      contractId: "HDT-2026-0014",
      type: "Hợp đồng thuê phòng",
      customer: "Michael Chen",
      phone: "0912 345 678",
      cccd: "002095005678",
      room: "Phòng 404 - Tòa A",
      amount: 250,
      depositAmount: 500,
      startDate: "01/06/2026",
      endDate: "01/06/2027",
      duration: "12 tháng",
      createdBy: "Nhân viên kinh doanh - Bob",
      submittedDate: "14/05/2026",
      status: "Chờ duyệt",
    },
  ];

  // Lưu object contract đang chọn thay vì chỉ lưu ID để dễ dàng lấy dữ liệu ra modal
  const [selectedContract, setSelectedContract] = useState<any | null>(null);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisionNote, setRevisionNote] = useState("");

  const handleApprove = (id: number, code: string) => {
    alert(`Đã phê duyệt hợp đồng số ${code} (ID: ${id})!`);
  };

  const handleReject = (id: number, code: string) => {
    const reason = prompt("Lý do từ chối phê duyệt:");
    if (reason) {
      alert(`Đã từ chối hợp đồng số ${code}. Lý do: ${reason}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Phê duyệt hợp đồng</h1>
        <p className="text-gray-600">Xem xét và phê duyệt các hợp đồng thuê phòng</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Chờ duyệt</p>
          <p className="text-2xl font-bold text-gray-900">{pendingContracts.length}</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Đã duyệt tháng này</p>
          <p className="text-2xl font-bold text-gray-900">12</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Bị từ chối / Yêu cầu sửa</p>
          <p className="text-2xl font-bold text-gray-900">2</p>
        </div>
      </div>

      {/* Pending Contracts List */}
      <div className="space-y-6">
        {pendingContracts.map((contract) => (
          <div
            key={contract.id}
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
          >
            {/* Card Header */}
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{contract.contractId}</h3>
                    <p className="text-sm text-gray-600">{contract.type}</p>
                  </div>
                </div>

                <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm font-medium rounded-full">
                  {contract.status}
                </span>
              </div>
            </div>

            {/* Card Body (Hiển thị thông tin chắt lọc ở ngoài) */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Thông tin tổng quan</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Khách hàng:</span>
                      <span className="font-medium text-gray-900">{contract.customer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phòng:</span>
                      <span className="font-medium text-gray-900">{contract.room}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tiền thuê / Cọc:</span>
                      <span className="font-medium text-gray-900">${contract.amount} / ${contract.depositAmount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Thời hạn thuê:</span>
                      <span className="font-medium text-gray-900">{contract.duration}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Thông tin khởi tạo</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Người tạo:</span>
                      <span className="font-medium text-gray-900">{contract.createdBy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ngày gửi duyệt:</span>
                      <span className="font-medium text-gray-900">{contract.submittedDate}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleApprove(contract.id, contract.contractId)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors text-sm"
                >
                  <CheckCircle className="w-4 h-4" />
                  Phê duyệt
                </button>

                <button
                  onClick={() => {
                    setSelectedContract(contract);
                    setShowRevisionModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  Yêu cầu sửa đổi
                </button>

                <button
                  onClick={() => handleReject(contract.id, contract.contractId)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors text-sm"
                >
                  <XCircle className="w-4 h-4" />
                  Từ chối
                </button>

                <button 
                  onClick={() => setSelectedContract(contract)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors ml-auto text-sm"
                >
                  <Eye className="w-4 h-4" />
                  Xem chi tiết hợp đồng
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Xem toàn bộ thông tin chi tiết (Bao gồm CCCD + SĐT) */}
      {selectedContract && !showRevisionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Chi tiết hồ sơ phê duyệt</h2>
                <p className="text-sm text-gray-500 mt-1">Mã: {selectedContract.contractId}</p>
              </div>
              <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                {selectedContract.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-b border-gray-100 py-4 my-4">
              {/* Cụm thông tin khách hàng bổ sung */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-sm border-b pb-1">
                  <User className="w-4 h-4 text-gray-500" /> Thông tin pháp lý khách hàng
                </h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-500">Họ và tên:</span> <span className="font-medium text-gray-900">{selectedContract.customer}</span></p>
                  <p className="flex items-center gap-1"><span className="text-gray-500">Số điện thoại:</span> <span className="font-medium text-gray-900">{selectedContract.phone}</span></p>
                  <p className="flex items-center gap-1"><span className="text-gray-500">Số CCCD/Hộ chiếu:</span> <span className="font-medium text-gray-900">{selectedContract.cccd}</span></p>
                </div>
              </div>

              {/* Cụm thông tin phòng ốc & Tài chính */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-sm border-b pb-1">
                  <Building2 className="w-4 h-4 text-gray-500" /> Chi tiết thuê phòng
                </h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-500">Vị trí căn hộ:</span> <span className="font-medium text-gray-900">{selectedContract.room}</span></p>
                  <p><span className="text-gray-500">Thời hạn:</span> <span className="font-medium text-gray-900">{selectedContract.duration} ({selectedContract.startDate} {selectedContract.endDate ? `đến ${selectedContract.endDate}` : ""})</span></p>
                  <p><span className="text-gray-500">Đơn giá thuê:</span> <span className="font-medium text-green-600">${selectedContract.amount}/tháng</span></p>
                  <p><span className="text-gray-500">Tiền đặt cọc:</span> <span className="font-medium text-blue-600">${selectedContract.depositAmount}</span></p>
                </div>
              </div>
            </div>

            {/* Chân Modal */}
            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setSelectedContract(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors"
              >
                Đóng lại
              </button>
              <button
                onClick={() => handleApprove(selectedContract.id, selectedContract.contractId)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Phê duyệt ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Gửi yêu cầu chỉnh sửa */}
      {showRevisionModal && selectedContract && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-2 text-gray-900">
              Yêu cầu chỉnh sửa hợp đồng
            </h2>
            <p className="text-sm text-gray-500 mb-4">Áp dụng cho mã: <span className="font-semibold">{selectedContract.contractId}</span></p>

            <textarea
              value={revisionNote}
              onChange={(e) => setRevisionNote(e.target.value)}
              rows={5}
              placeholder="Nhập chi tiết nội dung sai sót cần bộ phận kinh doanh sửa đổi (Ví dụ: Sai số điện thoại khách, thiếu ngày kết thúc...)"
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
            />

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setShowRevisionModal(false);
                  setRevisionNote("");
                  setSelectedContract(null);
                }}
                className="flex-1 border border-gray-300 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Hủy bỏ
              </button>

              <button
                onClick={() => {
                  if (!revisionNote.trim()) {
                    alert("Vui lòng nhập lý do chỉnh sửa!");
                    return;
                  }
                  alert(`Đã gửi yêu cầu sửa đổi hợp đồng ${selectedContract.contractId}\n\nNội dung: ${revisionNote}`);
                  setShowRevisionModal(false);
                  setRevisionNote("");
                  setSelectedContract(null);
                }}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg text-sm font-medium"
              >
                Gửi yêu cầu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}