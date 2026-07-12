import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { roomService, type Room } from "../../services/system-admin/roomService";

export function RentalRegistration() {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const moveInDate = searchParams.get("moveInDate") ?? "";
  const [submitted, setSubmitted] = useState(false);
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    roomService.getAll().then((items) => setRoom(items.find((item) => item.roomId === roomId) ?? null)).finally(() => setLoading(false));
  }, [roomId]);

  const submit = (event: FormEvent) => { event.preventDefault(); setSubmitted(true); };
  if (loading) return <p className="text-gray-600">Đang tải thông tin phòng...</p>;
  if (!room) return <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">Không tìm thấy phòng/giường đã chọn.</div>;
  if (submitted) return <div className="mx-auto max-w-xl rounded-xl border border-gray-200 bg-white p-8 text-center"><CheckCircle2 className="mx-auto h-14 w-14 text-green-500" /><h1 className="mt-4 text-2xl font-bold">Đăng ký đã được tiếp nhận</h1><p className="mt-2 text-gray-600">Hệ thống sẽ thông báo khi lịch xem phòng được sắp xếp.</p><button onClick={() => navigate("/customer/my-rooms?tab=viewed")} className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white">Xem phòng đã xem</button></div>;

  return <div className="space-y-6">
    <div className="flex w-full items-start gap-4">
      <div><h1 className="text-3xl font-bold">Đăng ký thuê và xem phòng</h1><p className="mt-1 text-gray-600">Nhập thông tin cơ bản để gửi nhu cầu thuê.</p></div>
      <button type="button" onClick={() => navigate("/customer/rooms")} className="ml-auto flex shrink-0 items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50">
        <ArrowLeft className="h-5 w-5" /> Quay lại
      </button>
    </div>
    <form onSubmit={submit} className="space-y-6 rounded-xl border border-gray-200 bg-white p-5"><h2 className="font-bold">Thông tin đăng ký ban đầu</h2><div className="grid gap-4 md:grid-cols-2">
      {["Họ và tên", "Số điện thoại", "Email"].map((label) => <label key={label} className="text-sm font-medium">{label}<input required={label !== "Email"} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5" /></label>)}
      <label className="text-sm font-medium">Số người dự kiến ở<input required type="number" min="1" className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5" /></label>
      <label className="text-sm font-medium">Giới tính<select className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5"><option>Nam</option><option>Nữ</option><option>Nhóm hỗn hợp</option></select></label>
      <label className="text-sm font-medium">Quốc tịch<input required defaultValue="Việt Nam" className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5" /></label>
      <label className="text-sm font-medium">Loại giấy tờ<select required className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5"><option>CCCD</option><option>Hộ chiếu</option></select></label>
      <label className="text-sm font-medium">Ngày sinh<input required type="date" className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5" /></label>
      <label className="text-sm font-medium">Địa chỉ thường trú<input required className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5" /></label>
      <label className="text-sm font-medium md:col-span-2">Tài liệu tài chính (nếu áp dụng)<input type="file" className="mt-2 block w-full text-sm" /></label>
      <label className="text-sm font-medium">Ngày dự kiến vào<input required type="date" defaultValue={moveInDate} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5" /></label>
      <label className="text-sm font-medium">Thời hạn thuê<select className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5"><option>6 tháng</option><option>12 tháng</option><option>Trên 12 tháng</option></select></label>
      <label className="text-sm font-medium">Giờ giấc sinh hoạt<input placeholder="Ví dụ: về trước 23:00" className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5" /></label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" />Ưu tiên yên tĩnh</label><label className="flex items-center gap-2 text-sm"><input type="checkbox" />Có nhu cầu gửi xe</label><label className="flex items-center gap-2 text-sm"><input type="checkbox" />Cần điều hòa</label>
      <label className="text-sm font-medium md:col-span-2">Yêu cầu khác<textarea rows={3} className="mt-2 w-full rounded-lg border border-gray-300 p-3" /></label>
    </div><div className="flex justify-end gap-3"><button type="button" onClick={() => navigate("/customer/rooms")} className="rounded-lg border border-gray-300 px-4 py-2.5">Quay lại</button><button type="submit" className="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white">Đăng ký thuê</button></div></form>
  </div>;
}
