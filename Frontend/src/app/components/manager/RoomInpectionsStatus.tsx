import { useState, useEffect } from "react";
// Đã thêm import icon Search từ lucide-react ở đây
import { ClipboardList, Building2, CheckCircle, AlertTriangle, Camera, Plus, Search } from "lucide-react";

interface Room {
  id: string;
  name: string;
  building: string;
  condition: string;
  availableBedsCount: number;
  customerName?: string;
  applicationId?: string;
  requestedBedsCount?: number;
}

export function RoomInspectionStatus() {
  const [search, setSearch] = useState("");

  // 2. Tạo state chứa danh sách phòng lấy từ Backend và trạng thái loading/error
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);

  const fetchRooms = () => {
    const token = localStorage.getItem("auth_token");

    if (!token) {
      setError("Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn!");
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch("http://localhost:5157/api/manager/room-inspections-status", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` 
      }
    }) 
      .then((res) => {
        if (res.status === 401 || res.status === 403) {
          throw new Error("Bạn không có quyền truy cập chức năng này (Yêu cầu tài khoản Quản lý)!");
        }
        if (!res.ok) {
          throw new Error("Không thể lấy dữ liệu từ hệ thống!");
        }
        return res.json();
      })
      .then((data) => {
        setRooms(data); 
        console.log("Fetched rooms:", data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  // 2. Chạy lần đầu tiên khi tải trang
  useEffect(() => {
    fetchRooms();
  }, []);

  // 3. Xử lý nút bấm Xác nhận / Từ chối (Nhận vào kiểu string | undefined để an toàn TypeScript)
  const handleReviewRoom = async (applicationId: string | undefined, isApproved: boolean) => {
    if (!applicationId) {
      alert("Hồ sơ đăng ký không hợp lệ!");
      return;
    }

    const token = localStorage.getItem("auth_token");
    if (!token) {
      alert("Phiên làm việc đã hết hạn, vui lòng đăng nhập lại!");
      return;
    }

    setIsReviewing(true);
    try {
      const res = await fetch(
        `http://localhost:5157/api/manager/room-inspections-status/review/${applicationId}`,
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
        const text = await res.text().catch(() => "");
        console.log("ApplicationId:", applicationId);
        console.log("Status:", res.status);
        console.log("Response:", text);
        throw new Error(text || "Cập nhật trạng thái thất bại!");
      }

      alert(isApproved ? "Xác nhận phòng thành công!" : "Đã từ chối yêu cầu!");
      
      // 🚀 Tải lại danh sách phòng mới nhất từ Server để đồng bộ lại toàn bộ UI
      fetchRooms(); 
    } catch (err: any) {
      alert("Lỗi: " + err.message);
    } finally {
      setIsReviewing(false);
    }
  };

  // 4. Logic lọc phòng linh hoạt dựa trên từ khóa
  const filteredRooms = rooms.filter((room) => {
    const query = search.toLowerCase();
    return (
      room.name?.toLowerCase().includes(query) ||
      room.building?.toLowerCase().includes(query) ||
      room.condition?.toLowerCase().includes(query)
    );
  });

  // 5. Thêm trạng thái hiển thị khi đang tải hoặc lỗi kết nối
  if (loading && rooms.length === 0) return <div className="text-center py-10 text-gray-600">Đang tải danh sách phòng...</div>;
  if (error) return <div className="text-center py-10 text-red-600">Lỗi: {error}</div>;


  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Kiểm tra trạng thái phòng</h1>
      </div>

      {/* Search - Tích hợp y hệt đoạn code mẫu của bạn */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input 
          type="text" 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          placeholder="Tìm theo mã hợp đồng, tên khách, số phòng..." 
          className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white" 
        />
      </div>

      {/* Room List - Render từ danh sách đã lọc filteredRooms */}
      {filteredRooms.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredRooms.map((room) => (
            <div
              key={room.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{room.name}</h3>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded-full ${
                      room.condition === "Trống"
                        ? "bg-green-100 text-green-700"
                        : room.condition === "Đã được giữ chỗ"
                        ? "bg-yellow-100 text-yellow-700"
                        : room.condition === "Đã được đặt cọc"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {room.condition === "Trống"
                      ? "Còn khả năng nhận đặt cọc"
                      : room.condition === "Đã được giữ chỗ"
                      ? "Đã được giữ chỗ"
                      : room.condition === "Đã được đặt cọc"
                      ? "Đã được đặt cọc"
                      : room.condition}
                  </span>
                </div>

                {/* Hiển thị chi nhánh */}
                <div className="text-sm mb-4">
                  <p className="text-gray-600">Chi nhánh:</p>
                  <p className="font-medium text-gray-900">{room.building}</p>
                  <p className="text-gray-600">Số giường khách yêu cầu:</p>
                  <p className="font-medium text-gray-900">{room.requestedBedsCount}</p>
                  <p className="text-gray-600">Số giường còn trống:</p>
                  <p className="font-medium text-gray-900">{room.availableBedsCount}</p>
                </div>

                {/* Hiển thị thông tin khách thuê/ghi chú trạng thái */}
                <div className="text-sm mb-4 space-y-1">
                  <p className="text-gray-600">Tình trạng chi tiết</p>
                  <p className="font-medium text-gray-900">{room.condition}</p>
                  {room.customerName ? (
                    <p className="text-sm text-blue-700">
                      <span className="font-semibold">Khách hàng:</span> {room.customerName}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500">Chưa có thông tin khách hàng</p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleReviewRoom(room.applicationId!, true)}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Xác nhận
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Giao diện hiển thị khi tìm kiếm không ra kết quả */
        <div className="text-center py-8 text-gray-500 bg-white rounded-xl border border-gray-200">
          Không tìm thấy kết quả nào phù hợp với từ khóa "{search}"
        </div>
      )}

    </div>
  );
}