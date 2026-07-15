import { useState, useEffect } from "react";
import { ClipboardList, Building2, Camera, Search, X } from "lucide-react";

interface RoomCondition {
  roomID: string;
  roomName: string;
  building: string;
  status: string;
  tenant: string;
  contractId?: string; 
}

export function RoomInspectionConditions() {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [showInspectionForm, setShowInspectionForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [rooms, setRooms] = useState<RoomCondition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contractId, setContractId] = useState<string | null>(null); // State lưu trữ hợp đồng của phòng đang chọn

  // ---- State cho form kiểm tra ----
  const [overallCondition, setOverallCondition] = useState("Rất tốt (Excellent)");
  const [cleanliness, setCleanliness] = useState("Sạch sẽ");
  const [damageNotes, setDamageNotes] = useState("");
  const [estimatedCost, setEstimatedCost] = useState<number | "">("");
  const [needMaintenance, setNeedMaintenance] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

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
        setRooms(data);
        console.log("Fetched rooms:", data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const filteredRooms = rooms.filter((room) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      room.roomName.toLowerCase().includes(query) ||
      room.building.toLowerCase().includes(query) ||
      (room.tenant && room.tenant.toLowerCase().includes(query))
    );
  });

  const currentSelectedRoom = rooms.find((r) => r.roomID === selectedRoomId);

  // Reset form và lấy đúng thông tin phòng được chọn
  const openInspectionForm = (roomId: string) => {
    const targetRoom = rooms.find((r) => r.roomID === roomId);
    
    setSelectedRoomId(roomId);
    // Lấy contractId từ phòng được chọn (nếu không có thì để null)
    setContractId(targetRoom?.contractId ?? null); 
    
    setOverallCondition("Rất tốt (Excellent)");
    setCleanliness("Sạch sẽ");
    setDamageNotes("");
    setEstimatedCost("");
    setNeedMaintenance(false);
    setSaveError(null);
    setShowInspectionForm(true);
  };

  const handleSubmitInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSelectedRoom) return;

    const token = localStorage.getItem("auth_token");
    if (!token) {
      setSaveError("Phiên làm việc đã hết hạn, vui lòng đăng nhập lại!");
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const response = await fetch(
        "http://localhost:5157/api/manager/checkout-report",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            roomId: currentSelectedRoom.roomID,
            contractId, // Gửi contractId đang được lưu trong state
            overallCondition,
            cleanliness,
            damageNotes,
            estimatedCost: estimatedCost === "" ? 0 : Number(estimatedCost),
            needMaintenance,
          }),
        }
      );

      if (response.status === 401 || response.status === 403) {
        throw new Error("Bạn không có quyền thực hiện chức năng này!");
      }
      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.message ?? "Lưu biên bản kiểm tra thất bại!");
      }

      alert(`Đã lưu kết quả kiểm tra cho ${currentSelectedRoom.roomName}!`);
      setShowInspectionForm(false);

      setRooms((prev) =>
        prev.map((r) =>
          r.roomID === currentSelectedRoom.roomID
            ? { ...r, status: overallCondition === "Kém (Poor)" ? "Cần bảo trì" : "Tình trạng tốt" }
            : r
        )
      );
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="text-center py-10 text-gray-600">Đang tải dữ liệu...</div>;
  if (error) return <div className="text-center py-10 text-red-600">Lỗi: {error}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Kiểm tra tình trạng phòng</h1>
      </div>

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

      <div className="text-sm text-gray-500">
        Hiển thị <span className="font-semibold text-gray-900">{filteredRooms.length}</span> phòng phù hợp
      </div>

      {filteredRooms.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredRooms.map((room) => (
            <div key={room.roomID} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
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
                      <p className="text-gray-600">Khách thuê hiện tại</p>
                      <p className="font-medium text-gray-900">{room.tenant}</p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => openInspectionForm(room.roomID)}
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
              {saveError && (
                <p className="text-sm text-red-600 mt-2 font-medium">{saveError}</p>
              )}
            </div>

            <form className="space-y-4" onSubmit={handleSubmitInspection}>
              {/* PHẦN SỬA LỖI: Hiển thị Hợp đồng thuê */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hợp đồng thuê
                </label>
                <input
                  type="text"
                  disabled
                  value={contractId ?? "Không có thông tin hợp đồng"} // Đã sửa lỗi gán null và vô hiệu hóa sửa tay vì đây là thông tin đi theo phòng
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tình trạng tổng thể
                </label>
                <select
                  value={overallCondition}
                  onChange={(e) => setOverallCondition(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
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
                <select
                  value={cleanliness}
                  onChange={(e) => setCleanliness(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
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
                  value={damageNotes}
                  onChange={(e) => setDamageNotes(e.target.value)}
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
                  value={estimatedCost}
                  onChange={(e) =>
                    setEstimatedCost(e.target.value === "" ? "" : Number(e.target.value))
                  }
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
                    checked={needMaintenance}
                    onChange={(e) => setNeedMaintenance(e.target.checked)}
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
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {isSaving ? "Đang lưu..." : "Chuyển biên bản cho kế toán"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}