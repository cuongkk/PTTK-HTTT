import { useState, useEffect } from "react";
// Đã thêm import icon Search từ lucide-react ở đây
import { ClipboardList, Building2, CheckCircle, AlertTriangle, Camera, Plus, Search } from "lucide-react";

interface Room {
  id: string;
  name: string;
  building: string;
  status: string;
  availableBedsCount: number;
}

export function RoomInspectionStatus() {
  const [search, setSearch] = useState("");

  // 2. Tạo state chứa danh sách phòng lấy từ Backend và trạng thái loading/error
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 3. Sử dụng useEffect để gọi dữ liệu khi tải trang
  useEffect(() => {
    // 1. Lấy token đã lưu khi đăng nhập thành công
    const token = localStorage.getItem("auth_token"); 


    if (!token) {
      setError("Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn!");
      setLoading(false);
      return;
    }

    // 2. Gọi chính xác đường dẫn Route bạn cấu hình ở Backend
    fetch("http://localhost:5157/api/manager/room-inspections-status", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Đính kèm token vào Header để vượt qua cổng kiểm tra [Authorize] của Backend
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
        // Giả sử Backend trả về một mảng danh sách phòng trực tiếp, 
        // hoặc bạn hãy check cấu trúc object trả về của `RoomStatusFilterRequest` để map cho đúng (ví dụ: data.items hoặc data)
        setRooms(data); 
        console.log(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // 4. Logic lọc phòng linh hoạt dựa trên từ khóa (giữ nguyên từ code cũ)
  const filteredRooms = rooms.filter((room) => {
    const query = search.toLowerCase();
    return (
      room.name?.toLowerCase().includes(query) ||
      room.building?.toLowerCase().includes(query) ||
      room.status?.toLowerCase().includes(query)
    );
  });

  // 5. Thêm trạng thái hiển thị khi đang tải hoặc lỗi kết nối
  if (loading) return <div className="text-center py-10 text-gray-600">Đang tải danh sách phòng...</div>;
  if (error) return <div className="text-center py-10 text-red-600">Lỗi: {error}</div>;

  // Xử lý button xác nhận
  const handleConfirm = async (roomId: string) => {
  try {
    const token = localStorage.getItem("auth_token");
    
    // Gọi API cập nhật trạng thái phòng lên Backend
    const res = await fetch(`http://localhost:5157/api/room-inspections-status/confirm/${roomId}`, {
      method: "PUT", // Hoặc POST tùy theo Backend bạn viết
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    if (!res.ok) throw new Error("Cập nhật trạng thái thất bại!");

    // Nếu Backend cập nhật thành công, update lại State ở Frontend để giao diện đổi màu luôn
    setRooms(prevRooms => 
      prevRooms.map(room => 
        room.id === roomId ? { ...room, status: "Trống" } : room
      )
    );
    alert("Xác nhận phòng trống thành công!");

  } catch (err: any) {
    alert("Lỗi: " + err.message);
  }
};


  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Kiểm tra trạng thái phòng</h1>
        <p className="text-gray-600">Kiểm tra trạng thái và lịch sử thuê phòng</p>
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Còn khả năng nhận cọc</p>
          <p className="text-2xl font-bold text-gray-900">
            {rooms.filter(room=> room.status == "Trống").length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Đã được giữ chỗ</p>
          <p className="text-2xl font-bold text-gray-900">
            {rooms.filter(room=>room.status == "Đã được giữ chỗ").length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Đã được đặt cọc</p>
          <p className="text-2xl font-bold text-gray-900">
            {rooms.filter(room=>room.status == "Đã được đặt cọc").length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Đang bảo trì</p>
          <p className="text-2xl font-bold text-gray-900">
            {rooms.filter(room=>room.status == "Đang bảo trì").length}
          </p>
        </div>
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
                      room.status === "Available"
                        ? "bg-green-100 text-green-700"
                        : room.status === "Reserved"
                        ? "bg-yellow-100 text-yellow-700"
                        : room.status === "Deposited"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {room.status === "Available"
                      ? "Còn khả năng nhận đặt cọc"
                      : room.status === "Reserved"
                      ? "Đã được giữ chỗ"
                      : room.status === "Deposited"
                      ? "Đã được đặt cọc"
                      : room.status}
                  </span>
                </div>

                {/* Hiển thị chi nhánh */}
                <div className="text-sm mb-4">
                  <p className="text-gray-600">Chi nhánh:</p>
                  <p className="font-medium text-gray-900">{room.building}</p>
                </div>

                {/* Hiển thị thông tin khách thuê/ghi chú trạng thái */}
                <div className="text-sm mb-4">
                  <p className="text-gray-600">Trạng thái chi tiết</p>
                  <p className="font-medium text-gray-900">{room.status}</p>
                </div>

                <div className="flex gap-3">
                  <button
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Xác nhận
                  </button>

                  <button
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Từ chối
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