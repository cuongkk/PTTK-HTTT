import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { FileText, Search, Plus, Eye, X, CheckCircle, AlertCircle, ArrowRight, DoorOpen, ShieldAlert, Sparkles } from "lucide-react";

type ContractType = "deposit" | "rental";

interface DepositContract {
  id: number;
  contractId: string;
  type: "deposit";
  customer: string;
  phone: string;
  room: string;
  area: string;
  depositAmount: number;
  holdUntil: string;
  status: "Chờ thanh toán cọc" | "Đã đặt cọc" | "Hủy";
  createdDate: string;
}

interface RentalContract {
  id: number;
  contractId: string;
  type: "rental";
  customer: string;
  phone: string;
  room: string;
  moveInDate: string;
  duration: number;
  monthlyRent: number;
  services: string[];
  paymentCycle: string;
  depositRef: string;
  status: "Hiệu lực" | "Chờ nhận phòng" | "Đã kết thúc" | "Chờ trả phòng";
  createdDate: string;
  checkoutRequest?: { requestDate: string; expectedDate: string; note: string };
}

type AnyContract = DepositContract | RentalContract;

const INITIAL_DEPOSITS: DepositContract[] = [
  { id: 1, contractId: "HDC-2026-001", type: "deposit", customer: "Nguyễn Văn B", phone: "0901234567", room: "Phòng 201 – Tòa A", area: "Khu A", depositAmount: 1800000, holdUntil: "30/05/2026", status: "Đã đặt cọc", createdDate: "14/05/2026" },
  { id: 2, contractId: "HDC-2026-002", type: "deposit", customer: "Trần Thị C", phone: "0912345678", room: "Phòng 305 – Tòa B", area: "Khu B", depositAmount: 2400000, holdUntil: "01/06/2026", status: "Chờ thanh toán cọc", createdDate: "15/05/2026" },
];

const INITIAL_RENTALS: RentalContract[] = [
  { id: 1, contractId: "HDT-2026-001", type: "rental", customer: "Nguyễn Văn A", phone: "0934567890", room: "Phòng 102 – Tòa C", moveInDate: "15/01/2026", duration: 12, monthlyRent: 2000000, services: ["Điện", "Nước", "Internet"], paymentCycle: "Hàng tháng", depositRef: "HDC-2025-011", status: "Hiệu lực", createdDate: "10/01/2026" },
];

export function ContractManagement() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<ContractType>("deposit");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<AnyContract | null>(null);

  // Check-in Wizard states
  const [showCheckinWizard, setShowCheckinWizard] = useState(false);
  const [checkinStep, setCheckinStep] = useState(1);
  const [checkinSearchRef, setCheckinSearchRef] = useState("");
  const [checkinFoundDeposit, setCheckinFoundDeposit] = useState<DepositContract | null>(null);
  const [checkinIdentityCard, setCheckinIdentityCard] = useState("");
  const [checkinIdentityMatch, setCheckinIdentityMatch] = useState(false);
  const [checkinIdentityMismatchError, setCheckinIdentityMismatchError] = useState(false);
  const [checkinShowPreview, setCheckinShowPreview] = useState(false);
  const [checkinRentalForm, setCheckinRentalForm] = useState({
    moveInDate: new Date().toISOString().substring(0, 10),
    duration: "12",
    monthlyRent: "",
    paymentCycle: "Hàng tháng",
    services: [] as string[],
    note: ""
  });

  const [deposits, setDeposits] = useState<DepositContract[]>(() => {
    const saved = localStorage.getItem("roommanager_deposits");
    return saved ? JSON.parse(saved) : INITIAL_DEPOSITS;
  });

  const [rentals, setRentals] = useState<RentalContract[]>(() => {
    const saved = localStorage.getItem("roommanager_rentals");
    return saved ? JSON.parse(saved) : INITIAL_RENTALS;
  });

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem("roommanager_deposits", JSON.stringify(deposits));
  }, [deposits]);

  useEffect(() => {
    localStorage.setItem("roommanager_rentals", JSON.stringify(rentals));
  }, [rentals]);

  // Sync from localStorage on focus (in case user returns from another tab/page)
  useEffect(() => {
    const syncData = () => {
      const savedDeps = localStorage.getItem("roommanager_deposits");
      if (savedDeps) setDeposits(JSON.parse(savedDeps));
      const savedRents = localStorage.getItem("roommanager_rentals");
      if (savedRents) setRentals(JSON.parse(savedRents));
    };
    window.addEventListener("focus", syncData);
    return () => window.removeEventListener("focus", syncData);
  }, []);

  // Listen to search parameters from dashboard notifications
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const action = params.get("action");
    const ref = params.get("ref");
    if (action === "checkin" && ref) {
      setTab("deposit");
      setCheckinSearchRef(ref);
      const dep = deposits.find(d => d.contractId === ref);
      if (dep) {
        setCheckinFoundDeposit(dep);
        setCheckinRentalForm(prev => ({ ...prev, monthlyRent: dep.depositAmount.toString() }));
        setCheckinStep(2); // directly open compare CCCD step
      } else {
        setCheckinStep(1); // open search step
      }
      setShowCheckinWizard(true);
    } else if (action === "checkout" && ref) {
      navigate(`/sales/checkout-contract?contractId=${ref}`);
    }
  }, [window.location.search, deposits, rentals, navigate]);

  const handleCheckinSearch = () => {
    if (!checkinSearchRef.trim()) {
      alert("Vui lòng nhập mã hợp đồng đặt cọc.");
      return;
    }
    const dep = deposits.find(d => d.contractId.toLowerCase() === checkinSearchRef.trim().toLowerCase());
    if (dep) {
      setCheckinFoundDeposit(dep);
      setCheckinRentalForm(prev => ({ ...prev, monthlyRent: dep.depositAmount.toString() }));
      setCheckinStep(2);
    } else {
      alert("Không tìm thấy hợp đồng đặt cọc hợp lệ hoặc phòng không có đặt chỗ!");
    }
  };

  const handleCheckinVerify = (isMatch: boolean) => {
    if (isMatch) {
      if (!checkinIdentityCard.trim()) {
        alert("Vui lòng nhập số CMND/CCCD để đối chiếu.");
        return;
      }
      setCheckinIdentityMatch(true);
      setCheckinIdentityMismatchError(false);
    } else {
      setCheckinIdentityMatch(false);
      setCheckinIdentityMismatchError(true);
    }
  };

  const handleCheckinSubmit = () => {
    if (!checkinFoundDeposit) return;
    const rentAmount = parseInt(checkinRentalForm.monthlyRent);
    if (!checkinRentalForm.moveInDate || !rentAmount) {
      alert("Vui lòng điền đầy đủ các thông tin bắt buộc.");
      return;
    }

    const newContract: RentalContract = {
      id: rentals.length + 1,
      contractId: `HDT-2026-${String(rentals.length + 1).padStart(3, "0")}`,
      type: "rental",
      customer: checkinFoundDeposit.customer,
      phone: checkinFoundDeposit.phone,
      room: checkinFoundDeposit.room,
      moveInDate: checkinRentalForm.moveInDate,
      duration: parseInt(checkinRentalForm.duration),
      monthlyRent: rentAmount,
      services: checkinRentalForm.services,
      paymentCycle: checkinRentalForm.paymentCycle,
      depositRef: checkinFoundDeposit.contractId,
      status: "Hiệu lực",
      createdDate: new Date().toLocaleDateString("vi-VN"),
    };

    setRentals(p => [newContract, ...p]);
    setDeposits(p => p.map(d => d.id === checkinFoundDeposit.id ? { ...d, status: "Đã đặt cọc" } : d));
    
    setShowCheckinWizard(false);
    setCheckinFoundDeposit(null);
    setCheckinIdentityCard("");
    setCheckinIdentityMatch(false);
    setCheckinIdentityMismatchError(false);
    setCheckinShowPreview(false);
    setCheckinRentalForm({
      moveInDate: new Date().toISOString().substring(0, 10),
      duration: "12",
      monthlyRent: "",
      paymentCycle: "Hàng tháng",
      services: [],
      note: ""
    });
    alert(`Nhận phòng thành công!\nHợp đồng thuê ${newContract.contractId} đã có hiệu lực. Khóa phòng điện tử và biên bản bàn giao đã được gửi cho khách hàng.`);
  };

  const filterDeposits = deposits.filter(c =>
    c.customer.toLowerCase().includes(search.toLowerCase()) ||
    c.contractId.toLowerCase().includes(search.toLowerCase()) ||
    c.room.toLowerCase().includes(search.toLowerCase())
  );
  const filterRentals = rentals.filter(c =>
    c.customer.toLowerCase().includes(search.toLowerCase()) ||
    c.contractId.toLowerCase().includes(search.toLowerCase()) ||
    c.room.toLowerCase().includes(search.toLowerCase())
  );

  const depositStatusColor: Record<string, string> = {
    "Đã đặt cọc": "bg-green-100 text-green-700",
    "Chờ thanh toán cọc": "bg-orange-100 text-orange-700",
    "Hủy": "bg-red-100 text-red-700",
  };
  const rentalStatusColor: Record<string, string> = {
    "Hiệu lực": "bg-green-100 text-green-700",
    "Chờ nhận phòng": "bg-blue-100 text-blue-700",
    "Chờ trả phòng": "bg-orange-100 text-orange-700",
    "Đã kết thúc": "bg-gray-100 text-gray-600",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Tra cứu hợp đồng</h1>
        <p className="text-sm text-gray-500">Tra cứu và đối chiếu các thông tin hợp đồng đặt cọc và hợp đồng thuê</p>
      </div>

      {/* Tabs + Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
          <button onClick={() => setTab("deposit")} className={`px-5 py-2.5 text-sm font-medium transition-colors ${tab === "deposit" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}>
            Hợp đồng đặt cọc ({deposits.length})
          </button>
          <button onClick={() => setTab("rental")} className={`px-5 py-2.5 text-sm font-medium transition-colors ${tab === "rental" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}>
            Hợp đồng thuê ({rentals.length})
          </button>
        </div>
        {tab === "deposit" && (
          <button
            onClick={() => navigate("/sales/deposit-contract")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Lập HĐ đặt cọc
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm theo mã hợp đồng, tên khách, số phòng..." className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white" />
      </div>

      {/* Deposit list */}
      {tab === "deposit" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-100">
            {filterDeposits.map(c => (
              <div key={c.id} className="p-5 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{c.contractId}</h3>
                        <p className="text-xs text-gray-500">{c.customer} · {c.phone}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs ml-13">
                      <div><p className="text-gray-400">Phòng/giường</p><p className="font-medium text-gray-800">{c.room}</p></div>
                      <div><p className="text-gray-400">Tiền cọc</p><p className="font-semibold text-blue-700">{c.depositAmount.toLocaleString("vi-VN")} đ</p></div>
                      <div><p className="text-gray-400">Giữ chỗ đến</p><p className="font-medium text-gray-800">{c.holdUntil}</p></div>
                      <div><p className="text-gray-400">Ngày lập</p><p className="font-medium text-gray-800">{c.createdDate}</p></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${depositStatusColor[c.status]}`}>{c.status}</span>
                    <button onClick={() => setSelected(c)} className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
                      <Eye className="w-3 h-3" /> Xem
                    </button>
                    {c.status === "Đã đặt cọc" && (
                      <button onClick={() => navigate(`/sales/rental-contract?depositRef=${c.contractId}`)} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors">
                        <ArrowRight className="w-3 h-3" /> Lập HĐ thuê
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {filterDeposits.length === 0 && (
              <div className="text-center py-12 px-6 text-gray-500 text-sm">
                <AlertCircle className="w-10 h-10 text-orange-500 mx-auto mb-2" />
                <p className="font-bold text-gray-700">Không tìm thấy thông tin hợp đồng đặt cọc! (A4)</p>
                <p className="text-xs text-gray-400 mt-1">Không có hợp đồng nào khớp với từ khóa tìm kiếm: "{search}"</p>
                <button onClick={() => setSearch("")} className="mt-3 px-3 py-1.5 border border-gray-300 hover:bg-gray-100 rounded-lg text-xs font-medium text-gray-700">
                  Xóa bộ lọc tìm kiếm (Quay lại bước 3)
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rental list */}
      {tab === "rental" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-100">
            {filterRentals.map(c => (
              <div key={c.id} className="p-5 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{c.contractId}</h3>
                        <p className="text-xs text-gray-500">{c.customer} · {c.phone}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs ml-13">
                      <div><p className="text-gray-400">Phòng/giường</p><p className="font-medium text-gray-800">{c.room}</p></div>
                      <div><p className="text-gray-400">Ngày vào ở</p><p className="font-medium text-gray-800">{c.moveInDate}</p></div>
                      <div><p className="text-gray-400">Thời hạn</p><p className="font-medium text-gray-800">{c.duration} tháng</p></div>
                      <div><p className="text-gray-400">Tiền thuê/tháng</p><p className="font-semibold text-blue-700">{c.monthlyRent.toLocaleString("vi-VN")} đ</p></div>
                    </div>
                    {c.checkoutRequest && (
                      <div className="mt-2 ml-13 px-3 py-1.5 bg-orange-50 rounded-lg text-xs text-orange-800">
                        Yêu cầu trả phòng: {c.checkoutRequest.expectedDate} · {c.checkoutRequest.note || "Không có ghi chú"}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${rentalStatusColor[c.status]}`}>{c.status}</span>
                    <button onClick={() => setSelected(c)} className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
                      <Eye className="w-3 h-3" /> Chi tiết
                    </button>
                    {c.status === "Hiệu lực" && (
                      <button onClick={() => navigate(`/sales/checkout-contract?contractId=${c.contractId}`)} className="flex items-center gap-1 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2">
                        <DoorOpen className="w-3 h-3" /> Tiếp nhận trả phòng
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {filterRentals.length === 0 && (
              <div className="text-center py-12 px-6 text-gray-500 text-sm">
                <AlertCircle className="w-10 h-10 text-orange-500 mx-auto mb-2" />
                <p className="font-bold text-gray-700">Không tìm thấy thông tin hợp đồng thuê phòng! (A4)</p>
                <p className="text-xs text-gray-400 mt-1">Không có hợp đồng nào khớp với từ khóa tìm kiếm: "{search}"</p>
                <button onClick={() => setSearch("")} className="mt-3 px-3 py-1.5 border border-gray-300 hover:bg-gray-100 rounded-lg text-xs font-medium text-gray-700">
                  Xóa bộ lọc tìm kiếm (Quay lại bước 3)
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Modal: Chi tiết hợp đồng ── */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-4 overflow-y-auto pt-[6vh] md:pt-[10vh]">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Chi tiết hợp đồng</h2>
              <button onClick={() => setSelected(null)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="p-6 space-y-2 text-sm">
              {selected.type === "deposit" ? (
                <>
                  {[
                    ["Mã hợp đồng", (selected as DepositContract).contractId],
                    ["Loại", "Hợp đồng đặt cọc"],
                    ["Trạng thái", (selected as DepositContract).status],
                    ["Khách hàng", (selected as DepositContract).customer],
                    ["Điện thoại", (selected as DepositContract).phone],
                    ["Phòng/giường", (selected as DepositContract).room],
                    ["Khu vực", (selected as DepositContract).area],
                    ["Tiền cọc", `${(selected as DepositContract).depositAmount.toLocaleString("vi-VN")} đ`],
                    ["Giữ chỗ đến", (selected as DepositContract).holdUntil],
                    ["Ngày lập", (selected as DepositContract).createdDate],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4 py-1 border-b border-gray-50">
                      <span className="text-gray-500">{k}</span>
                      <span className="font-medium text-gray-900 text-right">{v}</span>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  {[
                    ["Mã hợp đồng", (selected as RentalContract).contractId],
                    ["Loại", "Hợp đồng thuê"],
                    ["Trạng thái", (selected as RentalContract).status],
                    ["Khách hàng", (selected as RentalContract).customer],
                    ["Điện thoại", (selected as RentalContract).phone],
                    ["Phòng/giường", (selected as RentalContract).room],
                    ["Ngày vào ở", (selected as RentalContract).moveInDate],
                    ["Thời hạn", `${(selected as RentalContract).duration} tháng`],
                    ["Tiền thuê/tháng", `${(selected as RentalContract).monthlyRent.toLocaleString("vi-VN")} đ`],
                    ["Kỳ thanh toán", (selected as RentalContract).paymentCycle],
                    ["Dịch vụ", (selected as RentalContract).services.join(", ") || "Không có"],
                    ["HĐ cọc tham chiếu", (selected as RentalContract).depositRef],
                    ["Ngày lập", (selected as RentalContract).createdDate],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4 py-1 border-b border-gray-50">
                      <span className="text-gray-500">{k}</span>
                      <span className="font-medium text-gray-900 text-right">{v}</span>
                    </div>
                  ))}
                  {(selected as RentalContract).checkoutRequest && (
                    <div className="mt-3 p-3 bg-orange-50 rounded-lg">
                      <p className="text-xs font-medium text-orange-800 mb-1">Yêu cầu trả phòng</p>
                      <p className="text-xs text-orange-700">Ngày yêu cầu: {(selected as RentalContract).checkoutRequest!.requestDate}</p>
                      <p className="text-xs text-orange-700">Ngày dự kiến rời: {(selected as RentalContract).checkoutRequest!.expectedDate}</p>
                      {(selected as RentalContract).checkoutRequest!.note && <p className="text-xs text-orange-700">Ghi chú: {(selected as RentalContract).checkoutRequest!.note}</p>}
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="flex gap-3 px-6 pb-6">
              {selected.type === "rental" && (selected as RentalContract).status === "Hiệu lực" && (
                <button onClick={() => { setSelected(null); navigate(`/sales/checkout-contract?contractId=${(selected as RentalContract).contractId}`); }} className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                  <DoorOpen className="w-4 h-4" /> Tiếp nhận trả phòng
                </button>
              )}
              <button onClick={() => setSelected(null)} className="flex-1 px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-medium text-gray-700 transition-colors">Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Wizard Đối chiếu & Nhận phòng ── */}
      {showCheckinWizard && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-4 overflow-y-auto pt-[6vh] md:pt-[10vh]">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600 animate-pulse" />
                  Đối chiếu & Nhận phòng
                </h2>
                <p className="text-xs text-gray-500">Quy trình bàn giao phòng cho khách (Bước 2, 3, 4, 5)</p>
              </div>
              <button 
                onClick={() => {
                  setShowCheckinWizard(false);
                  setCheckinFoundDeposit(null);
                  setCheckinIdentityCard("");
                  setCheckinIdentityMatch(false);
                  setCheckinIdentityMismatchError(false);
                  setCheckinShowPreview(false);
                }} 
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Step indicator */}
            <div className="px-6 pt-4 flex items-center justify-center gap-3">
              {[
                { step: 1, label: "Tìm cọc" },
                { step: 2, label: "Đối chiếu" },
                { step: 3, label: "Lập HĐ thuê" }
              ].map(s => (
                <div key={s.step} className="flex items-center gap-1.5">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${checkinStep === s.step ? "bg-blue-600 text-white" : checkinStep > s.step ? "bg-green-100 text-green-700 border border-green-200" : "bg-gray-100 text-gray-400"}`}>
                    {checkinStep > s.step ? "✓" : s.step}
                  </span>
                  <span className={`text-xs font-medium ${checkinStep === s.step ? "text-blue-600 font-bold" : "text-gray-500"}`}>
                    {s.label}
                  </span>
                  {s.step < 3 && <span className="text-gray-300">→</span>}
                </div>
              ))}
            </div>

            {/* Step Content */}
            <div className="p-6">
              {checkinStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mã hợp đồng đặt cọc <span className="text-red-500">*</span></label>
                    <div className="flex gap-2">
                      <input 
                        value={checkinSearchRef} 
                        onChange={e => setCheckinSearchRef(e.target.value)} 
                        placeholder="Vd: HDC-2026-001" 
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white" 
                      />
                      <button onClick={handleCheckinSearch} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5">
                        <Search className="w-4 h-4" /> Tìm cọc
                      </button>
                    </div>
                  </div>

                  {checkinFoundDeposit ? (
                    <div className="bg-purple-50 p-4 border border-purple-150 rounded-xl space-y-3">
                      <h4 className="font-bold text-xs text-purple-900 uppercase">Hợp đồng đặt cọc tìm thấy</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
                        <p><strong>Khách hàng:</strong> {checkinFoundDeposit.customer}</p>
                        <p><strong>Số điện thoại:</strong> {checkinFoundDeposit.phone}</p>
                        <p><strong>Phòng đặt giữ:</strong> {checkinFoundDeposit.room}</p>
                        <p><strong>Tiền cọc:</strong> {checkinFoundDeposit.depositAmount.toLocaleString("vi-VN")} đ</p>
                        <p><strong>Hạn giữ chỗ:</strong> {checkinFoundDeposit.holdUntil}</p>
                        <p><strong>Trạng thái:</strong> {checkinFoundDeposit.status}</p>
                      </div>
                      
                      {checkinFoundDeposit.status === "Chờ thanh toán cọc" ? (
                        <div className="p-2.5 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-1.5 text-xs text-yellow-800">
                          <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                          <span>HĐ cọc chưa thanh toán! Vui lòng thu tiền đặt cọc trước.</span>
                        </div>
                      ) : (
                        <button onClick={() => setCheckinStep(2)} className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1">
                          Tiếp tục đối chiếu thông tin (Bước 2) <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-400 border border-dashed rounded-xl">
                      <FileText className="w-10 h-10 mx-auto opacity-30 mb-2" />
                      <p className="text-xs">Nhập mã cọc để tra cứu thông tin đặt chỗ của khách hàng.</p>
                    </div>
                  )}
                </div>
              )}

              {checkinStep === 2 && checkinFoundDeposit && (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-3.5 rounded-lg border border-gray-150 text-xs">
                    <p><strong>Khách hàng đặt cọc:</strong> {checkinFoundDeposit.customer}</p>
                    <p><strong>Số điện thoại:</strong> {checkinFoundDeposit.phone}</p>
                    <p><strong>Phòng đăng ký:</strong> {checkinFoundDeposit.room}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nhập số CMND/CCCD thực tế <span className="text-red-500">*</span></label>
                    <input 
                      value={checkinIdentityCard} 
                      onChange={e => setCheckinIdentityCard(e.target.value)} 
                      placeholder="Nhập 9 hoặc 12 số CCCD" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white" 
                    />
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => handleCheckinVerify(true)} className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors">
                      Xác nhận trùng khớp CCCD (Khớp thông tin)
                    </button>
                    <button onClick={() => handleCheckinVerify(false)} className="px-3 py-2 bg-red-50 text-red-650 hover:bg-red-100 border border-red-200 text-xs font-semibold rounded-lg transition-colors">
                      Không trùng khớp CCCD (A3)
                    </button>
                  </div>

                  {checkinIdentityMatch && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-xl space-y-2 text-xs text-green-800">
                      <p className="font-semibold">✓ Kết quả đối chiếu: TRÙNG KHỚP</p>
                      <p>Khách hàng trùng khớp thông tin trên hệ thống. Đủ điều kiện nhận phòng.</p>
                      <button onClick={() => setCheckinStep(3)} className="w-full py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-1">
                        Tiếp tục lập hợp đồng thuê <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {checkinIdentityMismatchError && (
                    <div className="p-3 bg-red-100 border border-red-200 rounded-xl space-y-2 text-xs text-red-800">
                      <div className="flex items-center gap-1 text-red-700 font-bold">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <span>Cảnh báo lỗi: Người nhận phòng không khớp với HĐ cọc! (A3)</span>
                      </div>
                      <p className="text-[11px]">Hệ thống ghi nhận thông tin không đồng nhất và từ chối nhận phòng. Bạn có thể:</p>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setCheckinIdentityMismatchError(false);
                            setCheckinIdentityCard("");
                          }}
                          className="px-3 py-1.5 bg-white border border-red-300 text-red-700 hover:bg-red-50 rounded text-[11px] font-medium"
                        >
                          Nhập lại CCCD
                        </button>
                        <button 
                          onClick={() => {
                            setDeposits(p => p.map(d => d.id === checkinFoundDeposit.id ? { ...d, status: "Hủy" } : d));
                            setShowCheckinWizard(false);
                            alert("Đã hủy hợp đồng đặt giữ chỗ do vi phạm quy tắc đối chiếu thông tin (A3).");
                          }}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-[11px] font-medium"
                        >
                          Hủy cọc/Hủy nhận phòng
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {checkinStep === 3 && checkinFoundDeposit && (
                <div className="space-y-4">
                  {checkinShowPreview ? (
                    <div className="space-y-3">
                      <div className="bg-yellow-50 p-4 border border-yellow-200 rounded-xl max-h-[40vh] overflow-y-auto">
                        <h4 className="font-bold text-center text-gray-800 text-sm mb-2">HỢP ĐỒNG THUÊ PHÒNG & BÀN GIAO</h4>
                        <div className="space-y-2 text-[11px] text-gray-700 leading-relaxed">
                          <p><strong>BÊN CHO THUÊ:</strong> Homestay Dorm RoomManager</p>
                          <p><strong>BÊN THUÊ:</strong> {checkinFoundDeposit.customer}</p>
                          <p><strong>Số điện thoại:</strong> {checkinFoundDeposit.phone}</p>
                          <p><strong>Phòng thuê:</strong> {checkinFoundDeposit.room}</p>
                          <p><strong>Ngày bắt đầu vào ở:</strong> {new Date(checkinRentalForm.moveInDate).toLocaleDateString("vi-VN")}</p>
                          <p><strong>Thời hạn hợp đồng:</strong> {checkinRentalForm.duration} tháng</p>
                          <p><strong>Giá thuê phòng:</strong> {parseInt(checkinRentalForm.monthlyRent).toLocaleString("vi-VN")} đ/tháng</p>
                          <p><strong>Kỳ đóng tiền:</strong> {checkinRentalForm.paymentCycle}</p>
                          <p><strong>Dịch vụ đăng ký:</strong> {checkinRentalForm.services.join(", ") || "Không sử dụng thêm dịch vụ"}</p>
                          <p className="pt-2 border-t font-semibold">ĐIỀU KHOẢN BÀN GIAO tài sản:</p>
                          <p>- Bàn giao đầy đủ 01 chìa khóa phòng điện tử, 01 thẻ từ ra vào tòa nhà.</p>
                          <p>- Nội thất phòng bao gồm: Điều hòa, tủ lạnh mini, giường, đệm, tủ gỗ nguyên vẹn.</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => setCheckinShowPreview(false)} className="flex-1 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg text-xs font-semibold text-gray-700">
                          Quay lại chỉnh sửa
                        </button>
                        <button onClick={handleCheckinSubmit} className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1">
                          <CheckCircle className="w-4 h-4" /> Ký hợp đồng & Bàn giao phòng
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 text-xs">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-gray-700 font-medium mb-1">Ngày vào ở <span className="text-red-500">*</span></label>
                          <input 
                            type="date" 
                            value={checkinRentalForm.moveInDate} 
                            onChange={e => setCheckinRentalForm(prev => ({ ...prev, moveInDate: e.target.value }))} 
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white" 
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 font-medium mb-1">Thời hạn thuê (tháng)</label>
                          <select 
                            value={checkinRentalForm.duration} 
                            onChange={e => setCheckinRentalForm(prev => ({ ...prev, duration: e.target.value }))} 
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                          >
                            <option value="3">3 tháng</option>
                            <option value="6">6 tháng</option>
                            <option value="12">12 tháng</option>
                            <option value="24">24 tháng</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-gray-700 font-medium mb-1">Giá thuê/tháng (VNĐ) <span className="text-red-500">*</span></label>
                          <input 
                            type="number" 
                            value={checkinRentalForm.monthlyRent} 
                            onChange={e => setCheckinRentalForm(prev => ({ ...prev, monthlyRent: e.target.value }))} 
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white" 
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 font-medium mb-1">Kỳ thanh toán</label>
                          <select 
                            value={checkinRentalForm.paymentCycle} 
                            onChange={e => setCheckinRentalForm(prev => ({ ...prev, paymentCycle: e.target.value }))} 
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                          >
                            <option>Hàng tháng</option>
                            <option>Hàng quý</option>
                            <option>6 tháng/lần</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-700 font-medium mb-1.5">Dịch vụ sử dụng</label>
                        <div className="flex flex-wrap gap-3 p-3 bg-gray-50 border rounded-lg">
                          {["Điện", "Nước", "Internet", "Vệ sinh", "Gửi xe"].map(service => {
                            const hasSvc = checkinRentalForm.services.includes(service);
                            return (
                              <label key={service} className="flex items-center gap-1.5 cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={hasSvc} 
                                  onChange={() => {
                                    setCheckinRentalForm(prev => ({
                                      ...prev,
                                      services: hasSvc 
                                        ? prev.services.filter(s => s !== service) 
                                        : [...prev.services, service]
                                    }));
                                  }} 
                                />
                                <span>{service}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button 
                          onClick={() => setCheckinStep(2)} 
                          className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold"
                        >
                          Quay lại
                        </button>
                        <button 
                          onClick={() => {
                            if (!checkinRentalForm.moveInDate || !checkinRentalForm.monthlyRent) {
                              alert("Vui lòng điền đầy đủ các thông tin bắt buộc.");
                              return;
                            }
                            setCheckinShowPreview(true);
                          }} 
                          className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                        >
                          Xem trước hợp đồng thuê
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
