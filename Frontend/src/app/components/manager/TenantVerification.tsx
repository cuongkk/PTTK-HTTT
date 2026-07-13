import { useState, useEffect } from "react";
import { UserCheck, CheckCircle, XCircle, FileText, AlertCircle, Building2, Users, ArrowUpRight } from "lucide-react";

interface Tenant {
  name: string;
  idNumber?: string;
  phone?: string;
}

interface Contract {
  id: string;
  contractCode: string;
  room: string;
  building: string;
  checkInDate: string;
  checkOutDate: string;
  tenants: Tenant[];
}

export function TenantVerification() {
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // State for data from backend
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  

  // useEffect to fetch contracts awaiting verification
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setError("Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn!");
      setLoading(false);
      return;
    }

    fetch("http://localhost:5157/api/manager/tenant-verifications", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.status === 401 || res.status === 403) {
          throw new Error("Bạn không có quyền truy cập chức năng này!");
        }
        if (!res.ok) {
          throw new Error("Không thể lấy dữ liệu từ hệ thống!");
        }
        return res.json();
      })
      .then((data) => {
        setContracts(data);
        console.log("Fetched contracts:", data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  

  const handleApprove = (id: string) => {
    alert(`Đã phê duyệt khách thuê số ${id}!`);
  };

  const handleReject = (id: string) => {
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

      {/* Search / Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FileText className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo mã hợp đồng, phòng hoặc tên khách..."
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
          />
        </div>
      </div>

      {/* Contract List */}
      {loading ? (
        <div className="text-center py-10 text-gray-600">Đang tải dữ liệu...</div>
      ) : error ? (
        <div className="text-center py-10 text-red-600">Lỗi: {error}</div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {contracts
          .filter((contract) => {
            const q = searchQuery.toLowerCase().trim();
            if (!q) return true;
            const inTenants = (contract.tenants || []).some((t: any) => (t.name || "").toLowerCase().includes(q));
            return (
              (contract.contractCode || "").toLowerCase().includes(q) ||
              (contract.room || "").toLowerCase().includes(q) ||
              (contract.building || "").toLowerCase().includes(q) ||
              inTenants
            );
          })
          .map((contract) => (
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
              className="inline-flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-sm hover:shadow transition-all group"
            >
              Xem chi tiết <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        ))}
      </div>
      )}

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
                Đáp ứng
              </button>

              <button
                onClick={() =>
                  handleReject(selectedContract.id)
                }
                className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg"
              >
                <XCircle className="w-4 h-4" />
                Không đáp ứng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

