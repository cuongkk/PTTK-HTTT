import { useState } from "react";
import { 
  ClipboardCheck, 
  Building2, 
  AlertCircle, 
  CheckCircle2, 
  Printer, 
  ArrowLeft, 
  Receipt, 
  Hammer, 
  Coins, 
  FileText,
  Calendar,
  User,
  Home,
  ShieldCheck,
  XCircle,
  ArrowUpRight,
  Info
} from "lucide-react";

// DỮ LIỆU MẪU CHUẨN ĐỂ SAU NÀY BẠN GÁN JSON TỪ BACKEND VÀO
const contractLiquidation = [
  {
    id: 1,
    contractId: "HD001",
    customer: "Nguyễn Văn A",
    room: "Phòng 501",
    building: "Tòa C",
    startDate: "01/01/2026",
    endDate: "01/06/2027",
    moveOutDate: "11/07/2026",
    status: "Chờ thanh lý",
    monthlyRent: 5000000,
    deposit: 5000000,
    debts: [
      { item: "Tiền thuê còn thiếu", amount: 2000000, isPaid: false },
      { item: "Tiền điện (Tháng này)", amount: 350000, isPaid: false },
      { item: "Tiền nước (Tháng này)", amount: 120000, isPaid: false },
      { item: "Tiền Internet", amount: 100000, isPaid: false },
      { item: "Phí giữ xe", amount: 50000, isPaid: false },
    ],
    inspection: {
      status: "Có hư hỏng",
      details: "Hỏng khóa cửa phòng và nứt ổ cắm điện",
      repairCost: 300000
    }
  },
  {
    id: 2,
    contractId: "HD002",
    customer: "Trần Thị B",
    room: "Phòng 202",
    building: "Tòa A",
    startDate: "10/12/2025",
    endDate: "10/06/2026",
    moveOutDate: "10/06/2026",
    status: "Chờ thanh lý",
    monthlyRent: 4000000,
    deposit: 4000000,
    debts: [
      { item: "Tiền thuê còn thiếu", amount: 0, isPaid: true },
      { item: "Tiền điện", amount: 0, isPaid: true },
      { item: "Tiền nước", amount: 0, isPaid: true },
    ],
    inspection: {
      status: "Phòng đạt",
      details: "Không có hư hỏng, bàn giao sạch sẽ",
      repairCost: 0
    }
  }
];

export function ContractLiquidation() {
  const [contracts, setContracts] = useState(contractLiquidation);
  const [selectedContractId, setSelectedContractId] = useState<number | null>(null);
  
  // State quản lý biên bản lập thêm
  const [customerFeedback, setCustomerFeedback] = useState("Khách đồng ý");
  const [liquidationDate, setLiquidationDate] = useState("2026-07-11");
  const [creator, setCreator] = useState("Nguyễn Văn Quản Lý");

  // Tìm hợp đồng khớp với ID đang chọn
  const currentContract = contracts.find(c => c.id === selectedContractId);

  // Hàm tính toán tài chính tự động (Dùng chung cho cả 2 màn hình)
  const calculateFinancials = (contract: any) => {
    if (!contract) return { totalDebt: 0, repairCost: 0, finalAmount: 0, unpaidCount: 0 };
    const totalDebt = contract.debts.reduce((sum: number, item: any) => sum + item.amount, 0);
    const unpaidCount = contract.debts.filter((item: any) => item.amount > 0).length;
    const repairCost = contract.inspection.repairCost;
    const finalAmount = contract.deposit - totalDebt - repairCost;
    return { totalDebt, repairCost, finalAmount, unpaidCount };
  };

  const handleCompleteLiquidation = (id: number) => {
    alert(`Đã hoàn tất thủ tục thanh lý hợp đồng. Phòng đã được cập nhật trạng thái trống.`);
    setContracts(contracts.filter(c => c.id !== id));
    setSelectedContractId(null);
  };

  // --- MÀN HÌNH 1: DANH SÁCH HỢP ĐỒNG (GIAO DIỆN MỚI GIÀU THÔNG TIN) ---
  if (!selectedContractId) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Thanh lý hợp đồng</h1>
            <p className="text-gray-600">Danh sách các phòng đã trả cần thực hiện đối chiếu công nợ và hoàn trả tất toán tiền cọc.</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3 max-w-sm">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <p className="text-xs text-blue-800 font-medium">
              Hệ thống ghi nhận đang có <strong className="text-blue-600 text-sm">{contracts.length}</strong> hồ sơ phòng đang xếp hàng chờ chốt thanh lý.
            </p>
          </div>
        </div>

        {/* Cấu trúc Grid Cards thay cho bảng cũ để hiển thị cực nhiều thông tin */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {contracts.map((c) => {
            const { totalDebt, repairCost, finalAmount, unpaidCount } = calculateFinancials(c);
            return (
              <div key={c.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all overflow-hidden flex flex-col justify-between">
                {/* Phần đầu Card: Thông tin cốt lõi phòng ốc */}
                <div className="p-6 pb-4 border-b border-gray-100">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-blue-50 text-blue-700 uppercase tracking-wider">
                        {c.contractId}
                      </span>
                      <h3 className="text-xl font-black text-gray-900 mt-2 flex items-center gap-1.5">
                        <Home className="w-5 h-5 text-gray-400" /> {c.room}
                        <span className="text-sm font-normal text-gray-500">({c.building})</span>
                      </h3>
                    </div>
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800 border border-orange-200 shadow-sm">
                      {c.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-y-2.5 gap-x-2 text-sm pt-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <User className="w-4 h-4 text-gray-400" />
                      <span>Khách: <strong className="text-gray-900 font-medium">{c.customer}</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>Trả phòng: <span className="text-gray-900 font-medium">{c.moveOutDate}</span></span>
                    </div>
                  </div>
                </div>

                {/* Phần thân Card: Preview dữ liệu tài chính (Thông tin thêm của bạn ở đây) */}
                <div className="px-6 py-4 bg-gray-50/50 space-y-3 border-b border-gray-100 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 flex items-center gap-1"><Coins className="w-3.5 h-3.5" /> Tiền đặt cọc gốc:</span>
                    <span className="font-semibold text-gray-900">{c.deposit.toLocaleString()} đ</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 flex items-center gap-1"><Receipt className="w-3.5 h-3.5" /> Công nợ tồn đọng:</span>
                    {unpaidCount > 0 ? (
                      <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">
                        -{totalDebt.toLocaleString()} đ ({unpaidCount} mục)
                      </span>
                    ) : (
                      <span className="text-green-600 font-medium flex items-center gap-0.5"><CheckCircle2 className="w-3 h-3" /> Đã sạch nợ</span>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 flex items-center gap-1"><Hammer className="w-3.5 h-3.5" /> Chi phí hư hỏng:</span>
                    {repairCost > 0 ? (
                      <span className="font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-100">
                        -{repairCost.toLocaleString()} đ
                      </span>
                    ) : (
                      <span className="text-green-600 font-medium">Bàn giao tốt</span>
                    )}
                  </div>
                </div>

                {/* Phần chân Card: Chốt số tiền dự kiến tất toán & Nút bấm */}
                <div className="p-4 px-6 bg-white flex justify-between items-center gap-4">
                  <div>
                    <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Quyết toán dự kiến</p>
                    <p className={`text-base font-black ${finalAmount >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      {finalAmount >= 0 ? "Hoàn: " : "Thu thêm: "}{Math.abs(finalAmount).toLocaleString()} đ
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => setSelectedContractId(c.id)}
                    className="inline-flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-sm hover:shadow transition-all group"
                  >
                    Xem chi tiết <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Chốt chặn bảo vệ tránh crash lỗi undefined nếu bấm bừa Id dữ liệu không khớp
  if (!currentContract) return null;

  const { totalDebt, repairCost, finalAmount } = calculateFinancials(currentContract);

  // --- MÀN HÌNH 2: CHI TIẾT ĐỐI CHIẾU ---
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <button 
        onClick={() => setSelectedContractId(null)}
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Quay lại danh sách thanh lý
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chi tiết đối chiếu & Biên bản thanh lý</h1>
          <p className="text-gray-500">Mã hồ sơ: TL-{currentContract.contractId}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* BÊN TRÁI: HIỂN THỊ THÔNG TIN CHI TIẾT QUY TRÌNH ĐỐI CHIẾU */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Lớp 1: Thông tin hợp đồng gốc */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 mb-4 pb-2 border-b flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-400" /> 1. Thông tin hợp đồng gốc
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FileText className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Mã hợp đồng</p>
                  <p className="font-semibold text-gray-900">{currentContract.contractId}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <User className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Khách thuê</p>
                  <p className="font-semibold text-gray-900">{currentContract.customer}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Home className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Phòng thuê</p>
                  <p className="font-semibold text-gray-900">{currentContract.room} ({currentContract.building})</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Thời hạn hợp đồng</p>
                  <p className="text-gray-700 font-medium">{currentContract.startDate} - {currentContract.endDate}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Lớp 2: Thông tin tiền cọc */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 mb-4 pb-2 border-b flex items-center gap-2">
              <Coins className="w-5 h-5 text-gray-400" /> 2. Thông tin tiền cọc giữ chỗ
            </h3>
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-500 rounded-lg text-white">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-950">Tiền đặt cọc của khách</p>
                  <p className="text-xs text-blue-600">Hệ thống ghi nhận đã thu khi ký hợp đồng</p>
                </div>
              </div>
              <span className="text-2xl font-black text-blue-600">{currentContract.deposit.toLocaleString()} đ</span>
            </div>
          </div>

          {/* Lớp 3: Bảng đối chiếu công nợ chi tiết */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 mb-4 pb-2 border-b flex items-center gap-2">
              <Receipt className="w-5 h-5 text-gray-400" /> 3. Đối chiếu công nợ tồn đọng
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              {currentContract.debts.map((debt, index) => (
                <div 
                  key={index} 
                  className={`p-3.5 border rounded-xl flex justify-between items-center transition-all ${
                    debt.amount === 0 
                      ? "bg-green-50/50 border-green-200 text-green-800" 
                      : "bg-white border-gray-200 shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {debt.amount === 0 ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
                    )}
                    <span className="text-sm font-medium text-gray-700">{debt.item}</span>
                  </div>
                  <span className={`text-sm font-bold ${debt.amount === 0 ? "text-green-600" : "text-red-600"}`}>
                    {debt.amount === 0 ? "Đã đóng sạch" : `${debt.amount.toLocaleString()} đ`}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-4 bg-red-50/60 border border-red-100 rounded-xl flex justify-between items-center">
              <span className="text-sm font-bold text-red-900">Tổng tiền công nợ chưa hoàn thành:</span>
              <span className="text-lg font-black text-red-600">{totalDebt.toLocaleString()} đ</span>
            </div>
          </div>

          {/* Lớp 4: Hiện trạng cơ sở vật chất */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 mb-4 pb-2 border-b flex items-center gap-2">
              <Hammer className="w-5 h-5 text-gray-400" /> 4. Hiện trạng cơ sở vật chất bàn giao
            </h3>
            
            {repairCost > 0 ? (
              <div className="border border-orange-200 rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 bg-orange-50 border-b border-orange-200 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-orange-500" />
                    <span className="font-bold text-orange-900 text-sm">Ghi nhận hư hỏng thiết bị phòng</span>
                  </div>
                  <span className="px-2 py-0.5 bg-orange-200 text-orange-800 text-xs font-bold rounded">Khấu trừ cọc</span>
                </div>
                <div className="p-4 bg-white space-y-3 text-sm">
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-gray-500 flex-shrink-0">Chi tiết lỗi:</span>
                    <p className="text-gray-900 font-medium text-right">{currentContract.inspection.details}</p>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-dashed">
                    <span className="font-medium text-gray-700">Chi phí sửa chữa / khôi phục:</span>
                    <span className="font-bold text-orange-600">+{repairCost.toLocaleString()} đ</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-800 text-sm font-medium shadow-sm">
                <ShieldCheck className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-bold text-green-900">Phòng đạt chuẩn 100%</p>
                  <p className="text-xs text-green-600 mt-0.5">Cơ sở vật chất đầy đủ, không hư hại, bàn giao sạch sẽ.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* BÊN PHẢI: QUYẾT TOÁN TÀI CHÍNH & LẬP BIÊN BẢN */}
        <div className="space-y-6">
          {/* Lớp 5: Quyết toán tài chính */}
          <div className="bg-slate-900 text-white rounded-xl p-6 shadow-md border border-slate-800">
            <h3 className="text-xs font-semibold tracking-wider text-slate-400 uppercase mb-4">5. Quyết toán tài chính</h3>
            <div className="space-y-3 text-sm border-b border-slate-700 pb-4 mb-4">
              <div className="flex justify-between text-slate-400">
                <span>Tiền cọc gốc:</span> <span className="text-white font-medium">+{currentContract.deposit.toLocaleString()} đ</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>(-) Tổng công nợ:</span> <span className="text-amber-400 font-medium">-{totalDebt.toLocaleString()} đ</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>(-) Hư hỏng phòng:</span> <span className="text-amber-400 font-medium">-{repairCost.toLocaleString()} đ</span>
              </div>
            </div>
            <div>
              {finalAmount >= 0 ? (
                <>
                  <p className="text-xs text-emerald-400 font-medium">Số tiền hoàn trả cho khách:</p>
                  <p className="text-3xl font-black text-emerald-400 mt-1.5 tracking-tight">{finalAmount.toLocaleString()} đ</p>
                </>
              ) : (
                <>
                  <p className="text-xs text-rose-400 font-medium">Số tiền khách phải đóng thêm:</p>
                  <p className="text-3xl font-black text-rose-400 mt-1.5 tracking-tight">{Math.abs(finalAmount).toLocaleString()} đ</p>
                </>
              )}
            </div>
          </div>

          {/* Lớp 6 & 7: Nghiệp vụ biên bản */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-gray-900 pb-2 border-b">6 & 7. Biên bản & Chữ ký xác nhận</h3>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">Ý kiến phản hồi từ khách thuê</label>
              <select 
                value={customerFeedback} 
                onChange={(e) => setCustomerFeedback(e.target.value)}
                className="w-full text-sm border border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:bg-white focus:border-blue-500 outline-none font-medium"
              >
                <option value="Khách đồng ý">Khách đồng ý biên bản tất toán</option>
                <option value="Khách khiếu nại">Khách khiếu nại (Yêu cầu xem xét lại)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-gray-500 mb-1">Ngày lập biên bản</label>
                <input type="date" value={liquidationDate} onChange={(e) => setLiquidationDate(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 bg-gray-50 font-medium" />
              </div>
              <div>
                <label className="block text-gray-500 mb-1">Người đại diện lập</label>
                <input type="text" value={creator} onChange={(e) => setCreator(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 bg-gray-50 font-medium" />
              </div>
            </div>
          </div>

          {/* Lớp 8: Cụm nút bấm */}
          <div className="space-y-2">
            <button
              onClick={() => handleCompleteLiquidation(currentContract.id)}
              disabled={customerFeedback === "Khách khiếu nại"}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all shadow-sm"
            >
              <ClipboardCheck className="w-5 h-5" /> Hoàn tất thanh lý
            </button>
            
            <button onClick={() => window.print()} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl font-medium text-sm transition-colors">
              <Printer className="w-4 h-4 text-gray-500" /> In biên bản thanh lý (PDF)
            </button>
          </div>

          {customerFeedback === "Khách khiếu nại" && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs flex items-start gap-2 text-red-800 shadow-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
              <span>Hệ thống đang tạm khóa nút Hoàn tất do phát sinh khiếu nại chi phí từ phía khách thuê.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}