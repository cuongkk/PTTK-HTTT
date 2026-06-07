import { useState } from "react";
import { ClipboardList, Building2, CheckCircle, AlertTriangle, Camera, Plus } from "lucide-react";

export function RoomInspectionConditions() {
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [showInspectionForm, setShowInspectionForm] = useState(false);

  const rooms = [
    {
      id: 1,
      name: "Phòng 501",
      building: "Tòa C",
      status: "Cần kiểm tra",
      lastInspection: "Chưa có",
      moveOutDate: "10/05/2026",
      tenant: "Emma Wilson",
    },
    {
      id: 2,
      name: "Phòng 203",
      building: "Tòa A",
      status: "Tình trạng tốt",
      lastInspection: "10/01/2026",
      condition: "Rất tốt",
      tenant: "John Smith",
    },
    {
      id: 3,
      name: "Phòng 404",
      building: "Tòa A",
      status: "Cần bảo trì",
      lastInspection: "08/05/2026",
      condition: "Lỗi nhỏ",
      issues: "Cần thay tấm lọc điều hòa",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Kiểm tra trạng thái phòng</h1>
        <p className="text-gray-600">Kiểm tra trạng thái phòng và lịch sử thuê</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Cần kiểm tra</p>
          <p className="text-2xl font-bold text-gray-900">1</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Tình trạng tốt</p>
          <p className="text-2xl font-bold text-gray-900">1</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Cần bảo trì</p>
          <p className="text-2xl font-bold text-gray-900">1</p>
        </div>
      </div>

      {/* Room List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {rooms.map((room) => (
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
                    <p className="text-sm text-gray-600">{room.building}</p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${
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
                    <p className="text-gray-600">Khách thuê hiện tại</p>
                    <p className="font-medium text-gray-900">{room.tenant}</p>
                  </div>
                )}

                <div className="text-sm">
                  <p className="text-gray-600">Lần kiểm tra cuối</p>
                  <p className="font-medium text-gray-900">{room.lastInspection}</p>
                </div>

                {room.condition && (
                  <div className="text-sm">
                    <p className="text-gray-600">Tình trạng vật lý</p>
                    <p className="font-medium text-gray-900">{room.condition}</p>
                  </div>
                )}

                {room.moveOutDate && (
                  <div className="text-sm">
                    <p className="text-gray-600">Ngày dọn ra</p>
                    <p className="font-medium text-gray-900">{room.moveOutDate}</p>
                  </div>
                )}

                {room.issues && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-orange-900">{room.issues}</p>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  setSelectedRoom(room.id);
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

      {/* Inspection Form Modal */}
      {showInspectionForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 my-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Phiếu kiểm tra tình trạng phòng</h2>

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
                    alert("Đã lưu kết quả kiểm tra!");
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