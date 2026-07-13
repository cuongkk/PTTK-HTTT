import { useState, useEffect } from "react";
import { ClipboardList, Building2, Camera, Search, X } from "lucide-react";

interface RoomCondition {
  roomID: string;
  roomName: string;
  building: string;
  status: string;
  tenant: string;
}

export function RoomInspectionConditions() {
   const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [showInspectionForm, setShowInspectionForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // State dữ liệu từ backend
  const [rooms, setRooms] = useState<RoomCondition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Gọi API khi load trang
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setError("Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn!");
      setLoading(false);
      return;
    }

    fetch("http://localhost:5157/api/manager/room-inspection-condition", {
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
          throw new Error("Không thể lấy dữ liệu từ hệ thống!");
        }
        return res.json();
      })
      .then((data) => {
        setRooms(data); // giả sử backend trả về mảng trực tiếp
        console.log(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Lọc dữ liệu theo từ khóa
  const filteredRooms = rooms.filter((room) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      room.roomName.toLowerCase().includes(query) ||
      room.building.toLowerCase().includes(query) ||
      (room.tenant && room.tenant.toLowerCase().includes(query))
    );
  });

  // Phòng đang chọn
  const currentSelectedRoom = rooms.find((r) => r.roomID == "selectedRoomId");

  if (loading) return <div className="text-center py-10 text-gray-600">Đang tải dữ liệu...</div>;
  if (error) return <div className="text-center py-10 text-red-600">Lỗi: {error}</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Kiểm tra trạng thái phòng</h1>
        <p className="text-gray-600">Kiểm tra trạng thái phòng và lịch sử thuê</p>
      </div>

      {/* Thanh Tìm Kiếm Đa Năng */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo phòng hoặc tên khách..."
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Số lượng phòng tìm thấy */}
      <div className="text-sm text-gray-500">
        Hiển thị <span className="font-semibold text-gray-900">{filteredRooms.length}</span> phòng phù hợp
      </div>

      {/* Room List */}
      {filteredRooms.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredRooms.map((room) => (
            <div
              key={room.roomID}
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{room.roomName}</h3>
                      <p className="text-sm text-gray-600">{room.building}</p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      room.status === "Tình trạng tốt"
                        ? "bg-green-100 text-green-700"
                        : room.status === "Cần bảo trì"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {room.status}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  {room.tenant && (
                    <div className="text-sm">
                      <p className="text-gray-600">Khách  thuê hiện tại</p>
                      <p className="font-medium text-gray-900">{room.tenant}</p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    setSelectedRoomId(room.roomID);
                    setShowInspectionForm(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  <ClipboardList className="w-4 h-4" />
                  {room.status === "Cần kiểm tra" ? "Tiến hành kiểm tra" : "Cập nhật kiểm tra"}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
          <p className="text-gray-500">Không tìm thấy phòng nào khớp với từ khóa "{searchQuery}".</p>
        </div>
      )}

      {/* Inspection Form Modal */}
      {showInspectionForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 my-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">Phiếu kiểm tra tình trạng phòng</h2>
              {currentSelectedRoom && (
                <p className="text-sm text-blue-600 mt-1 font-medium">
                  Đang thực hiện cho: {currentSelectedRoom.roomName} ({currentSelectedRoom.building})
                </p>
              )}
            </div>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tình trạng tổng thể
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                  <option>Rất tốt (Excellent)</option>
                  <option>Tốt (Good)</option>
                  <option>Trung bình (Fair)</option>
                  <option>Kém (Poor)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mức độ sạch sẽ
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                  <option>Sạch sẽ</option>
                  <option>Cần dọn dẹp</option>
                  <option>Bẩn</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hư hại ghi nhận
                </label>
                <textarea
                  rows={3}
                  placeholder="Mô tả các chi tiết bị hư hại hoặc có lỗi..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chi phí sửa chữa dự kiến ($)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hình ảnh minh chứng (Không bắt buộc)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                  <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Tải lên hình ảnh kiểm tra phòng</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Yêu cầu bảo trì
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="maintenance"
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="maintenance" className="text-sm text-gray-700">
                    Yêu cầu sửa chữa/bảo trì trước khi cho khách mới dọn vào
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowInspectionForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  onClick={(e) => {
                    e.preventDefault();
                    alert(`Đã lưu kết quả kiểm tra cho ${currentSelectedRoom?.roomName}!`);
                    setShowInspectionForm(false);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Lưu kết quả
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}