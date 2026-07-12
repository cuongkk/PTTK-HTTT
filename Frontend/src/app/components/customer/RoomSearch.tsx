import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { BedDouble, MapPin, Users, Wind, ParkingCircle, Ruler, Clock3, Volume2 } from "lucide-react";
import { roomService, type Branch, type Room } from "../../services/system-admin/roomService";

const roomTypeLabel = (value: string) => (value === "ghep" ? "Ở ghép" : value === "nguyen_can" ? "Nguyên phòng" : value);
const genderLabel = (value: string | null) => (value === "nam" ? "Nam" : value === "nu" ? "Nữ" : "Không giới hạn");

const getAvailableBeds = (room: Room) => room.beds.filter((bed) => bed.status === "trong");
const getDisplayPrice = (room: Room) => (room.roomType === "ghep" ? Math.min(...getAvailableBeds(room).map((bed) => bed.monthlyRent)) : (room.roomPrice ?? 0));

export function RoomSearch() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [branchId, setBranchId] = useState("all");
  const [roomType, setRoomType] = useState("all");
  const [gender, setGender] = useState("all");
  const [maxPrice, setMaxPrice] = useState("");
  const [people, setPeople] = useState(1);
  const [moveInDate, setMoveInDate] = useState("");
  const [requiresAirConditioner, setRequiresAirConditioner] = useState(false);
  const [requiresParking, setRequiresParking] = useState(false);
  const [requiresQuiet, setRequiresQuiet] = useState(false);

  useEffect(() => {
    Promise.all([roomService.getAll(), roomService.getBranches()])
      .then(([roomData, branchData]) => {
        setRooms(roomData);
        setBranches(branchData);
      })
      .catch(() => setError("Không thể tải danh sách phòng/giường từ Backend."))
      .finally(() => setLoading(false));
  }, []);

  const roomTypes = useMemo(() => [...new Set(rooms.map((room) => room.roomType))], [rooms]);
  const genders = useMemo(() => [...new Set(rooms.map((room) => room.allowedGender).filter(Boolean))] as string[], [rooms]);

  const filtered = useMemo(
    () =>
      rooms.filter((room) => {
        const availableBeds = getAvailableBeds(room);
        const availablePlaces = room.roomType === "ghep" ? availableBeds.length : room.status === "trong" ? room.capacity : 0;
        const price = getDisplayPrice(room);
        return (
          availablePlaces >= people &&
          (branchId === "all" || room.branchId === branchId) &&
          (roomType === "all" || room.roomType === roomType) &&
          (gender === "all" || room.allowedGender === gender || room.allowedGender === "khong_gioi_han") &&
          (!maxPrice || price <= Number(maxPrice)) &&
          (!requiresAirConditioner || room.hasAirConditioner) &&
          (!requiresParking || room.hasParking) &&
          (!requiresQuiet || room.requiresQuietLifestyle)
        );
      }),
    [rooms, people, branchId, roomType, gender, maxPrice, requiresAirConditioner, requiresParking, requiresQuiet],
  );

  if (loading) return <p className="text-gray-600">Đang tải phòng/giường...</p>;
  if (error) return <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tìm phòng/giường</h1>
      </div>
      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          <label className="text-sm font-medium">
            Chi nhánh
            <select value={branchId} onChange={(e) => setBranchId(e.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5">
              <option value="all">Tất cả</option>
              {branches.map((item) => (
                <option key={item.branchId} value={item.branchId}>
                  {item.branchName}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium">
            Hình thức thuê
            <select value={roomType} onChange={(e) => setRoomType(e.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5">
              <option value="all">Tất cả</option>
              {roomTypes.map((item) => (
                <option key={item} value={item}>
                  {roomTypeLabel(item)}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium">
            Giới tính khu ở
            <select value={gender} onChange={(e) => setGender(e.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5">
              <option value="all">Tất cả</option>
              {genders.map((item) => (
                <option key={item} value={item}>
                  {genderLabel(item)}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium">
            Ngày dự kiến vào
            <input type="date" value={moveInDate} onChange={(e) => setMoveInDate(e.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5" />
          </label>
          <label className="text-sm font-medium">
            Số người
            <input type="number" min="1" value={people} onChange={(e) => setPeople(Math.max(1, Number(e.target.value)))} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5" />
          </label>
          <label className="text-sm font-medium">
            Giá tối đa
            <input
              type="number"
              min="0"
              step="100000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Nhập số tiền"
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5"
            />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap gap-5 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={requiresAirConditioner} onChange={(e) => setRequiresAirConditioner(e.target.checked)} />
            Có điều hòa
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={requiresParking} onChange={(e) => setRequiresParking(e.target.checked)} />
            Có gửi xe
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={requiresQuiet} onChange={(e) => setRequiresQuiet(e.target.checked)} />
            Ưu tiên yên tĩnh
          </label>
        </div>
      </section>
      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((room) => {
          const availablePlaces = room.roomType === "ghep" ? getAvailableBeds(room).length : room.capacity;
          const price = getDisplayPrice(room);
          return (
            <article key={room.roomId} className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex items-start justify-between">
                <div className="flex gap-3">
                  <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
                    <BedDouble />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900">{room.roomName}</h2>
                  </div>
                </div>
                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">Còn {availablePlaces} chỗ</span>
              </div>
              {room.description && <p className="mt-4 text-sm text-gray-600">{room.description}</p>}
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-gray-600">
                <span className="flex gap-2">
                  <MapPin className="h-4 w-4" />
                  {room.branchName}
                </span>
                <span className="flex gap-2">
                  <Users className="h-4 w-4" />
                  {availablePlaces}/{room.capacity} chỗ
                </span>
                <span>
                  {roomTypeLabel(room.roomType)} · {room.area}
                </span>
                <span>Giới tính: {genderLabel(room.allowedGender)}</span>
                {room.floor != null && (
                  <span className="flex gap-2">
                    <Ruler className="h-4 w-4" />
                    Tầng {room.floor} · {room.areaSquareMeters ?? "-"} m²
                  </span>
                )}
                {room.curfewTime && (
                  <span className="flex gap-2">
                    <Clock3 className="h-4 w-4" />
                    Giới nghiêm {room.curfewTime.slice(0, 5)}
                  </span>
                )}
                {room.requiresQuietLifestyle && (
                  <span className="flex gap-2">
                    <Volume2 className="h-4 w-4" />
                    Ưu tiên yên tĩnh
                  </span>
                )}
                {room.hasAirConditioner && (
                  <span className="flex gap-2">
                    <Wind className="h-4 w-4" />
                    Điều hòa
                  </span>
                )}
                {room.hasParking && (
                  <span className="flex gap-2">
                    <ParkingCircle className="h-4 w-4" />
                    Gửi xe
                  </span>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {room.amenities.map((item) => (
                  <span key={item.amenityId} className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700">
                    {item.quantity > 1 ? `${item.quantity} ` : ""}
                    {item.amenityName}
                  </span>
                ))}
              </div>
              <div className="mt-auto flex items-center justify-between border-t pt-4">
                <strong className="text-blue-700">{price.toLocaleString("vi-VN")} đ/tháng</strong>
                <button
                  onClick={() => navigate(`/customer/rooms/${room.roomId}/register${moveInDate ? `?moveInDate=${moveInDate}` : ""}`)}
                  className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white"
                >
                  Đăng ký thuê
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
