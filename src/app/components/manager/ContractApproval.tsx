import { useState } from "react";
import { FileCheck, CheckCircle, XCircle, Eye, MessageSquare, Building2 } from "lucide-react";

export function ContractApproval() {
  const pendingContracts = [
    {
      id: 1,
      contractId: "HDDC-2026-0002",
      type: "Hợp đồng đặt cọc",
      customer: "Sarah Johnson",
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

  const [selectedContract, setSelectedContract] = useState<number | null>(null);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisionNote, setRevisionNote] = useState("");
  const [revisionContractId, setRevisionContractId] = useState<number | null>(null);

  const handleApprove = (id: number) => {
    alert(`Đã phê duyệt hợp đồng số ${id}!`);
  };

  const handleReject = (id: number) => {
    const reason = prompt("Lý do từ chối phê duyệt:");
    if (reason) {
      alert(`Đã từ chối hợp đồng số ${id}. Lý do: ${reason}`);
    }
  };

  const handleRequestRevision = (id: number) => {
    const revision = prompt("Nội dung yêu cầu chỉnh sửa:");
    if (revision) {
      alert(`Đã gửi yêu cầu chỉnh sửa cho hợp đồng số ${id}: ${revision}`);
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

      {/* Pending Contracts */}
      <div className="space-y-6">
        {pendingContracts.map((contract) => (
          <div
            key={contract.id}
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                
                {/* Bọc cụm Logo + Nội dung vào đây để chúng đi liền nhau */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{contract.contractId}</h3>
                    <p className="text-sm text-gray-600">{contract.type}</p>
                  </div>
                </div>

                {/* Trạng thái vẫn sẽ được đẩy về góc phải cùng nhờ justify-between ở cha */}
                <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm font-medium rounded-full">
                  {contract.status}
                </span>

              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Thông tin hợp đồng</h4>
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
                      <span className="text-gray-600">Tiền thuê hàng tháng:</span>
                      <span className="font-medium text-gray-900">${contract.amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tiền đặt cọc:</span>
                      <span className="font-medium text-gray-900">${contract.depositAmount}</span>
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
                      <span className="text-gray-600">Ngày bắt đầu:</span>
                      <span className="font-medium text-gray-900">{contract.startDate}</span>
                    </div>
                    {contract.endDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ngày kết thúc:</span>
                        <span className="font-medium text-gray-900">{contract.endDate}</span>
                      </div>
                    )}
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

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleApprove(contract.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Phê duyệt hợp đồng
                </button>

                <button
                  onClick={() => {
                    setSelectedContract(contract.id);
                    setShowRevisionModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg"
                >
                  <MessageSquare className="w-4 h-4" />
                  Yêu cầu sửa đổi
                </button>

                <button
                  onClick={() => handleReject(contract.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Từ chối duyệt
                </button>

                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors ml-auto">
                  <Eye className="w-4 h-4" />
                  Xem toàn bộ hợp đồng
                </button>
              </div>


            </div>
          </div>
        ))}
        

      </div>

      {/* Request To Change*/}
      {showRevisionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg p-6">
            <h2 className="text-xl font-bold mb-4">
              Yêu cầu chỉnh sửa hợp đồng
            </h2>

            <textarea
              value={revisionNote}
              onChange={(e) => setRevisionNote(e.target.value)}
              rows={5}
              placeholder="Nhập nội dung cần chỉnh sửa..."
              className="w-full border border-gray-300 rounded-lg p-3"
            />

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setShowRevisionModal(false);
                  setRevisionNote("");
                }}
                className="flex-1 border border-gray-300 py-2 rounded-lg"
              >
                Hủy
              </button>

              <button
                onClick={() => {
                  alert(
                    `Đã gửi yêu cầu sửa đổi hợp đồng ${revisionContractId}\n\n${revisionNote}`
                  );

                  setShowRevisionModal(false);
                  setRevisionNote("");
                }}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg"
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