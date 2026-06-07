import { useState } from "react";
import { UserCheck, CheckCircle, XCircle, FileText, AlertCircle, Building2, Users } from "lucide-react";

export function TenantVerification() {
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);

  

  const contracts = [
    {
      id: 1,
      contractCode: "HD001",
      room: "Phòng 501",
      building: "Tòa C",
      checkInDate: "01/06/2026",
      checkOutDate: "01/06/2027",

      tenants: [
        {
          name: "Nguyễn Văn A",
          idNumber: "079xxx",
          phone: "090xxxx",
          creditScore: 720,
        },
        {
          name: "Trần Văn B",
          idNumber: "079xxx",
          phone: "091xxxx",
          creditScore: 680,
        },
      ],
    },
  ];

  

  const handleApprove = (id: number) => {
    alert(`Đã phê duyệt khách thuê số ${id}!`);
  };

  const handleReject = (id: number) => {
    const reason = prompt("Lý do từ chối hồ sơ:");
    if (reason) {
      alert(`Đã từ chối khách thuê số ${id}. Lý do: ${reason}`);
    }
  };

  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Xác nhận thuê phòng
        </h1>

        <p className="text-gray-600">
          Kiểm tra điều kiện lưu trú và ký hợp đồng thuê
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border shadow-sm">
          <p className="text-sm text-gray-600">Chờ ký hợp đồng</p>
          <p className="text-2xl font-bold">{contracts.length}</p>
        </div>

        <div className="bg-white rounded-xl p-6 border shadow-sm">
          <p className="text-sm text-gray-600">Đã ký tháng này</p>
          <p className="text-2xl font-bold">12</p>
        </div>

        <div className="bg-white rounded-xl p-6 border shadow-sm">
          <p className="text-sm text-gray-600">Đã từ chối</p>
          <p className="text-2xl font-bold">2</p>
        </div>
      </div>

      {/* Contract List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {contracts.map((contract) => (
          <div
            key={contract.id}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg">
                  {contract.contractCode}
                </h3>

                <p className="text-gray-600">
                  {contract.room} - {contract.building}
                </p>
              </div>

              <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                Chờ ký
              </span>
            </div>

            <div className="space-y-2 text-sm mb-4">
              <p>
                <span className="text-gray-600">Khách thuê:</span>{" "}
                {contract.tenants.map((t) => t.name).join(", ")}
              </p>

              <p>
                <span className="text-gray-600">Ngày thuê:</span>{" "}
                {contract.checkInDate}
              </p>

              <p>
                <span className="text-gray-600">Ngày trả:</span>{" "}
                {contract.checkOutDate}
              </p>
            </div>

            <button
              onClick={() => {
                setSelectedContract(contract);
                setShowDetail(true);
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
            >
              Xem chi tiết
            </button>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {showDetail && selectedContract && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl w-full max-w-4xl p-6">
            <div className="flex justify-between mb-6">
              <h2 className="text-2xl font-bold">
                Chi tiết hợp đồng {selectedContract.contractCode}
              </h2>

              <button
                onClick={() => setShowDetail(false)}
                className="text-xl"
              >
                ✕
              </button>
            </div>

            {/* Room Information */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-lg">Thông tin phòng</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <p>
                  <b>Phòng:</b> {selectedContract.room}
                </p>

                <p>
                  <b>Tòa:</b> {selectedContract.building}
                </p>

                <p>
                  <b>Ngày thuê:</b> {selectedContract.checkInDate}
                </p>

                <p>
                  <b>Ngày trả:</b> {selectedContract.checkOutDate}
                </p>

                <p>
                  <b>Loại phòng:</b> 4 người
                </p>

                <p>
                  <b>Giá thuê:</b> 3.000.000 VNĐ/tháng
                </p>
              </div>
            </div>

            {/* Tenant Information */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-green-600" />
                <h3 className="font-bold text-lg">Điều kiện lưu trú</h3>
              </div>

              <div className="space-y-4">
                {selectedContract.tenants.map(
                  (tenant: any, index: number) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4"
                    >
                      <h4 className="font-semibold mb-3">
                        Khách thuê {index + 1}
                      </h4>

                      <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                        <p>
                          <b>Họ tên:</b> {tenant.name}
                        </p>

                        <p>
                          <b>CCCD:</b> {tenant.idNumber}
                        </p>

                        <p>
                          <b>SĐT:</b> {tenant.phone}
                        </p>

                        <p>
                          <b>Điểm tín dụng:</b> {tenant.creditScore}
                        </p>
                      </div>

                      {/* Ảnh đính kèm */}
                      <div>
                        <h5 className="font-medium mb-3">
                          Tài liệu đính kèm
                        </h5>

                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <img
                              src="https://via.placeholder.com/400x250?text=CCCD+Front"
                              className="w-full h-48 object-cover rounded-lg border"
                            />
                            <p className="text-xs text-center mt-2 text-gray-600">
                              CCCD mặt trước
                            </p>
                          </div>

                          <div>
                            <img
                              src="https://via.placeholder.com/400x250?text=CCCD+Back"
                              className="w-full h-48 object-cover rounded-lg border"
                            />
                            <p className="text-xs text-center mt-2 text-gray-600">
                              CCCD mặt sau
                            </p>
                          </div>

                          <div>
                            <img
                              src="https://via.placeholder.com/400x250?text=Portrait"
                              className="w-full h-48 object-cover rounded-lg border"
                            />
                            <p className="text-xs text-center mt-2 text-gray-600">
                              Ảnh chân dung
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() =>
                  handleApprove(selectedContract.id)
                }
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg"
              >
                <CheckCircle className="w-4 h-4" />
                Ký hợp đồng
              </button>

              <button
                onClick={() =>
                  handleReject(selectedContract.id)
                }
                className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg"
              >
                <XCircle className="w-4 h-4" />
                Từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}