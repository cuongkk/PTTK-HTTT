import { useState, useEffect } from "react";
import { ArrowUpRight, Search, Building2 } from "lucide-react";

// 1. Khai báo interface chuẩn theo nghiệp vụ bắt buộc
interface Deposit {
  id: string;
  depositCode: string;       
  customer: string;     
  roomId: string;    
  room: string;        
  bed: string
  branch: string;            
  depositAmount: string;     
  status: string;            
  isValid: boolean;        
  confirmedBy: string;      
  confirmedAt: string;     
  expectedCheckIn: string;  
  date: string;             
}

export function DepositConfirmation() {
// Quản lý state chọn phiếu theo ID để đồng bộ với cách tìm kiếm
  const [selectedDeposit, setSelectedDeposit] = useState<any | null>(null);
  const [search, setSearch] = useState("");

  // State quản lý dữ liệu nhận về từ Backend API
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 2. Gọi API lấy danh sách xác nhận cọc khi load trang
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setError("Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn!");
      setLoading(false);
      return;
    }

    // Thay đổi đường dẫn URL phù hợp với API thực tế của backend của bạn
    fetch("http://localhost:5157/api/manager/deposit-confirmation", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    })
      .then((res) => {
        if (res.status === 401 || res.status === 403) {
          throw new Error("Bạn không có quyền truy cập chức năng này!");
        }
        if (!res.ok) {
          throw new Error("Không thể lấy dữ liệu đặt cọc từ hệ thống!");
        }
        return res.json();
      })
      .then((data) => {
        setDeposits(data); // Đổ dữ liệu từ API vào state
        console.log("Dữ liệu đặt cọc nhận về:", data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);


  


  const [isReviewing, setIsReviewing] = useState(false);

  const handleReviewDeposit = async (depositId: string, isApproved: boolean) => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      alert("Phiên làm việc đã hết hạn, vui lòng đăng nhập lại!");
      return;
    }

    setIsReviewing(true);
    try {
      const res = await fetch(
        `http://localhost:5157/api/manager/deposit-confirmation/review/${depositId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({ isApproved }),
        }
      );

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(errText || "Cập nhật trạng thái thất bại!");
      }
      alert(
        isApproved
          ? `Duyệt thành công chứng từ mã: ${depositId}`
          : `Từ chối chứng từ mã: ${depositId}`
      );
      setSelectedDeposit(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setIsReviewing(false);
    }
  };


  // 3. Logic lọc tìm kiếm dữ liệu cọc khách hàng
  const filteredDeposits = deposits.filter((deposit) => {
    const query = search.toLowerCase().trim();
    if (!query) return true;
    return (
      deposit.depositCode.toLowerCase().includes(query) ||
      deposit.customer.toLowerCase().includes(query) ||
      deposit.room.toLowerCase().includes(query)
    );
  });

  // 4. Tìm kiếm thông tin phiếu cọc đang được click chọn xem chi tiết
  // Sửa lỗi logic: So sánh trực tiếp với biến selectedDepositId chứ không bọc trong dấu ""
  const currentSelectedDeposit = deposits.find((d) => d.id === selectedDeposit);

  // Giao diện khi đang tải hoặc lỗi hệ thống
  if (loading) return <div className="text-center py-10 text-gray-600">Đang tải dữ liệu đặt cọc...</div>;
  if (error) return <div className="text-center py-10 text-red-600">Lỗi: {error}</div>;
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
                <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{deposit.room}</h3>
                      <p className="text-sm text-gray-600">{deposit.branch}</p>
                    </div>
                  </div>
                {/* 
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                  {deposit.status}
                </span> */}
              </div>

              <div className="space-y-2 mb-4 text-sm">
                <p>
                  <span className="text-gray-600">Khách hàng:</span>{" "}
                    {deposit.customer}
                </p>

                <p>
                  <span className="text-gray-600">Phòng:</span>{" "}
                  {deposit.room}
                </p>

                <p>
                  <span className="text-gray-600">Ngày:</span>{" "}
                  {deposit.date}
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
                  Mã đặt cọc
                </label>
                <input
                  value={selectedDeposit.depositCode}
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
                  Giường
                </label>
                <input
                  value={selectedDeposit.bed}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chi nhánh
                </label>
                <input
                  value={selectedDeposit.branch}
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
                  Nhân viên thực hiện
                </label>
                <input
                  value={selectedDeposit.confirmedBy}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 outline-none"
                />
              </div>

              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày thực hiện
                </label>
                <input
                  value={selectedDeposit.confirmedAt}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày checkin dự kiến
                </label>
                <input
                  value={selectedDeposit.expectedCheckIn}
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
                onClick={() => handleReviewDeposit(selectedDeposit.id, false)}
                disabled={isReviewing}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
              >
                Không hợp lệ
              </button>

              <button
                onClick={() => handleReviewDeposit(selectedDeposit.id, true)}
                disabled={isReviewing}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
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