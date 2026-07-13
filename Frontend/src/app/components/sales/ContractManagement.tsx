import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { FileText, Search, Plus, Eye, X, CheckCircle, AlertCircle, ArrowRight, DoorOpen, ShieldAlert, Sparkles, RefreshCw } from "lucide-react";
import { salesApi, type SalesDepositSlip, type SalesRentalContract } from "../../services/sales/salesApi";
import { toast } from "sonner";

type ContractType = "deposit" | "rental";

export function ContractManagement() {
  const navigate = useNavigate();
  const location = useLocation();
  const [tab, setTab] = useState<ContractType>("deposit");
  const [search, setSearch] = useState("");
  const [selectedDeposit, setSelectedDeposit] = useState<SalesDepositSlip | null>(null);
  const [selectedRental, setSelectedRental] = useState<SalesRentalContract | null>(null);

  // Check-in Wizard states
  const [showCheckinWizard, setShowCheckinWizard] = useState(false);
  const [checkinStep, setCheckinStep] = useState(1);
  const [checkinSearchRef, setCheckinSearchRef] = useState("");
  const [checkinFoundDeposit, setCheckinFoundDeposit] = useState<SalesDepositSlip | null>(null);
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

  const [deposits, setDeposits] = useState<SalesDepositSlip[]>([]);
  const [rentals, setRentals] = useState<SalesRentalContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadContracts = async () => {
    setLoading(true);
    try {
      const [depList, rentList] = await Promise.all([
        salesApi.getDepositSlips(),
        salesApi.getContracts()
      ]);
      setDeposits(depList);
      setRentals(rentList);
    } catch (err) {
      console.error(err);
      setError("Không thể tải thông tin hợp đồng từ máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContracts();
  }, []);

  // Listen to search parameters from dashboard notifications
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const action = params.get("action");
    const ref = params.get("ref");
    if (action === "checkin" && ref && deposits.length > 0) {
      setTab("deposit");
      setCheckinSearchRef(ref);
      const dep = deposits.find(d => d.depositId.toLowerCase() === ref.toLowerCase());
      if (dep) {
        setCheckinFoundDeposit(dep);
        setCheckinRentalForm(prev => ({ ...prev, monthlyRent: dep.depositAmount.toString() }));
        setCheckinStep(2); // directly open compare CCCD step
      } else {
        setCheckinStep(1); // open search step
      }
      setShowCheckinWizard(true);
    }
  }, [location.search, deposits]);

  const handleCheckinSearch = () => {
    if (!checkinSearchRef.trim()) {
      toast.warning("Vui lòng nhập mã hợp đồng đặt cọc.");
      return;
    }
    const dep = deposits.find(d => d.depositId.toLowerCase() === checkinSearchRef.trim().toLowerCase());
    if (dep) {
      setCheckinFoundDeposit(dep);
      setCheckinRentalForm(prev => ({ ...prev, monthlyRent: dep.depositAmount.toString() }));
      setCheckinStep(2);
    } else {
      toast.error("Không tìm thấy hợp đồng đặt cọc hợp lệ hoặc phòng không có đặt chỗ!");
    }
  };

  const handleCheckinVerify = () => {
    const cccd = checkinIdentityCard.trim();
    if (!cccd) {
      toast.warning("Vui lòng nhập số CMND/CCCD để đối chiếu.");
      return;
    }
    const isValid = /^[0-9]{9}$|^[0-9]{12}$/.test(cccd);
    if (isValid) {
      setCheckinIdentityMatch(true);
      setCheckinIdentityMismatchError(false);
      toast.success("Thông tin CCCD hợp lệ!");
    } else {
      setCheckinIdentityMatch(false);
      setCheckinIdentityMismatchError(true);
      toast.error("Số CMND/CCCD không hợp lệ (phải gồm 9 hoặc 12 chữ số).");
    }
  };

  const handleCheckinSubmit = async () => {
    if (!checkinFoundDeposit) return;
    const rentAmount = parseInt(checkinRentalForm.monthlyRent);
    if (!checkinRentalForm.moveInDate || !rentAmount) {
      toast.warning("Vui lòng điền đầy đủ các thông tin bắt buộc.");
      return;
    }

    try {
      const result = await salesApi.createRentalContract({
        depositId: checkinFoundDeposit.depositId,
        roomId: "", // resolved by backend
        moveInDate: new Date(checkinRentalForm.moveInDate).toISOString(),
        durationMonths: parseInt(checkinRentalForm.duration),
        monthlyRent: rentAmount,
        paymentCycle: checkinRentalForm.paymentCycle,
        services: checkinRentalForm.services,
      });

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

      toast.success(`Đối chiếu nhận phòng thành công!\nHợp đồng thuê ${result.contractId} đã được lập ở trạng thái: Chờ ký.`);
      await loadContracts();
    } catch (err) {
      toast.error("Đối chiếu nhận phòng thất bại.");
    }
  };

  const filterDeposits = deposits.filter(c =>
    (c.customerName || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.depositId || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.roomName || "").toLowerCase().includes(search.toLowerCase())
  );
  
  const filterRentals = rentals.filter(c =>
    (c.customerName || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.contractId || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.roomName || "").toLowerCase().includes(search.toLowerCase())
  );

  const getDepositStatusLabel = (st: string) => {
    switch (st) {
      case "cho_thanh_toan": return "Chờ thanh toán cọc";
      case "hoan_thanh": return "Đã đặt cọc";
      case "huy": return "Hủy";
      default: return st;
    }
  };

  const getRentalStatusLabel = (st: string) => {
    switch (st) {
      case "cho_ky": return "Chờ nhận phòng";
      case "cho_thanh_toan_nhan_phong": return "Chờ thanh toán nhận phòng";
      case "hieu_luc": return "Hiệu lực";
      case "cho_tra_phong": return "Chờ trả phòng";
      case "thanh_ly": return "Đã kết thúc";
      default: return st;
    }
  };

  const depositStatusColor: Record<string, string> = {
    "hoan_thanh": "bg-green-100 text-green-700",
    "cho_thanh_toan": "bg-orange-100 text-orange-700",
    "huy": "bg-red-100 text-red-700",
  };

  const rentalStatusColor: Record<string, string> = {
    "hieu_luc": "bg-green-100 text-green-700",
    "cho_ky": "bg-blue-100 text-blue-700",
    "cho_thanh_toan_nhan_phong": "bg-yellow-100 text-yellow-800",
    "cho_tra_phong": "bg-orange-100 text-orange-700",
    "thanh_ly": "bg-gray-100 text-gray-600",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-500 text-sm">Đang tải danh sách hợp đồng...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700">
        <h2 className="font-bold mb-2">Đã xảy ra lỗi</h2>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Tra cứu hợp đồng</h1>
          <p className="text-sm text-gray-500">Tra cứu và đối chiếu các thông tin hợp đồng đặt cọc và hợp đồng thuê</p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadContracts} className="p-2 border border-gray-300 hover:bg-gray-100 rounded-lg text-gray-700">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setCheckinStep(1);
              setCheckinIdentityCard("");
              setCheckinIdentityMatch(false);
              setCheckinIdentityMismatchError(false);
              setShowCheckinWizard(true);
            }}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 animate-spin-slow" />
            Đối chiếu Nhận phòng
          </button>
        </div>
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
        {tab === "rental" && (
          <button
            onClick={() => navigate("/sales/rental-contract")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Lập HĐ thuê
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={`Tìm hợp đồng theo tên khách, mã hợp đồng, phòng...`}
          className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
        />
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {tab === "deposit" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50/80 border-b">
                <tr>
                  <th className="px-5 py-3.5">Mã hợp đồng cọc</th>
                  <th className="px-5 py-3.5">Khách hàng</th>
                  <th className="px-5 py-3.5">Điện thoại</th>
                  <th className="px-5 py-3.5">Phòng đặt giữ</th>
                  <th className="px-5 py-3.5">Giá trị cọc</th>
                  <th className="px-5 py-3.5">Giữ chỗ đến</th>
                  <th className="px-5 py-3.5">Trạng thái</th>
                  <th className="px-5 py-3.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150">
                {filterDeposits.map(d => (
                  <tr key={d.depositId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 font-semibold text-gray-900 font-mono">{d.depositId}</td>
                    <td className="px-5 py-4 font-medium text-gray-900">{d.customerName}</td>
                    <td className="px-5 py-4">{d.phoneNumber}</td>
                    <td className="px-5 py-4">{d.roomName}</td>
                    <td className="px-5 py-4 font-semibold text-blue-700">{d.depositAmount.toLocaleString("vi-VN")} đ</td>
                    <td className="px-5 py-4">{new Date(d.holdUntil).toLocaleDateString("vi-VN")}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${depositStatusColor[d.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {getDepositStatusLabel(d.status)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {d.status === "hoan_thanh" && (
                          <button
                            onClick={() => {
                              setCheckinSearchRef(d.depositId);
                              setCheckinFoundDeposit(d);
                              setCheckinRentalForm(prev => ({ ...prev, monthlyRent: d.depositAmount.toString() }));
                              setCheckinIdentityCard("");
                              setCheckinIdentityMatch(false);
                              setCheckinIdentityMismatchError(false);
                              setCheckinStep(2);
                              setShowCheckinWizard(true);
                            }}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold"
                          >
                            Nhận phòng
                          </button>
                        )}
                        <button onClick={() => setSelectedDeposit(d)} className="p-1 border hover:bg-gray-100 rounded text-gray-600">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filterDeposits.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-gray-400">Không tìm thấy hợp đồng cọc nào.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50/80 border-b">
                <tr>
                  <th className="px-5 py-3.5">Mã hợp đồng thuê</th>
                  <th className="px-5 py-3.5">Khách hàng</th>
                  <th className="px-5 py-3.5">Điện thoại</th>
                  <th className="px-5 py-3.5">Phòng thuê</th>
                  <th className="px-5 py-3.5">Giá thuê/tháng</th>
                  <th className="px-5 py-3.5">Ngày vào ở</th>
                  <th className="px-5 py-3.5">Kỳ hạn</th>
                  <th className="px-5 py-3.5">Trạng thái</th>
                  <th className="px-5 py-3.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150">
                {filterRentals.map(r => (
                  <tr key={r.contractId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 font-semibold text-gray-900 font-mono">{r.contractId}</td>
                    <td className="px-5 py-4 font-medium text-gray-900">{r.customerName}</td>
                    <td className="px-5 py-4">{r.phoneNumber}</td>
                    <td className="px-5 py-4">{r.roomName}</td>
                    <td className="px-5 py-4 font-semibold text-blue-700">{r.monthlyRent.toLocaleString("vi-VN")} đ</td>
                    <td className="px-5 py-4">{new Date(r.moveInDate).toLocaleDateString("vi-VN")}</td>
                    <td className="px-5 py-4">{r.durationMonths} tháng</td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${rentalStatusColor[r.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {getRentalStatusLabel(r.status)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {r.status === "hieu_luc" && (
                          <button
                            onClick={() => navigate(`/sales/checkout-contract?contractId=${r.contractId}`)}
                            className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded text-xs font-semibold"
                          >
                            Trả phòng
                          </button>
                        )}
                        <button onClick={() => setSelectedRental(r)} className="p-1 border hover:bg-gray-100 rounded text-gray-600">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filterRentals.length === 0 && (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-gray-400">Không tìm thấy hợp đồng thuê nào.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Chi tiết Hợp đồng cọc */}
      {selectedDeposit && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-4 overflow-y-auto pt-[6vh] md:pt-[10vh]">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Hợp đồng đặt cọc
              </h2>
              <button onClick={() => setSelectedDeposit(null)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="p-6 space-y-3.5 text-sm">
              {[
                ["Mã hợp đồng", selectedDeposit.depositId],
                ["Khách hàng", selectedDeposit.customerName],
                ["Số điện thoại", selectedDeposit.phoneNumber],
                ["Phòng đặt giữ", selectedDeposit.roomName],
                ["Khu vực", selectedDeposit.area],
                ["Số tiền cọc", `${selectedDeposit.depositAmount.toLocaleString("vi-VN")} VNĐ`],
                ["Ngày lập cọc", new Date(selectedDeposit.createdAt).toLocaleDateString("vi-VN")],
                ["Giữ phòng đến", new Date(selectedDeposit.holdUntil).toLocaleDateString("vi-VN")],
                ["Trạng thái cọc", getDepositStatusLabel(selectedDeposit.status)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <span className="text-gray-500">{k}</span>
                  <span className="font-semibold text-gray-900">{v}</span>
                </div>
              ))}
            </div>
            <div className="px-6 pb-6 flex gap-2">
              {selectedDeposit.status === "hoan_thanh" && (
                <button
                  onClick={() => {
                    setCheckinSearchRef(selectedDeposit.depositId);
                    setCheckinFoundDeposit(selectedDeposit);
                    setCheckinRentalForm(prev => ({ ...prev, monthlyRent: selectedDeposit.depositAmount.toString() }));
                    setCheckinIdentityCard("");
                    setCheckinIdentityMatch(false);
                    setCheckinIdentityMismatchError(false);
                    setCheckinStep(2);
                    setShowCheckinWizard(true);
                    setSelectedDeposit(null);
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  Tiến hành nhận phòng
                </button>
              )}
              <button onClick={() => setSelectedDeposit(null)} className="flex-1 px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-medium text-gray-700 transition-colors">Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Chi tiết Hợp đồng thuê */}
      {selectedRental && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-4 overflow-y-auto pt-[6vh] md:pt-[10vh]">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Hợp đồng thuê phòng
              </h2>
              <button onClick={() => setSelectedRental(null)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="p-6 space-y-3 text-sm">
              {[
                ["Mã hợp đồng", selectedRental.contractId],
                ["Khách hàng", selectedRental.customerName],
                ["Số điện thoại", selectedRental.phoneNumber],
                ["Phòng thuê", selectedRental.roomName],
                ["Giá thuê/tháng", `${selectedRental.monthlyRent.toLocaleString("vi-VN")} VNĐ`],
                ["Ngày vào ở", new Date(selectedRental.moveInDate).toLocaleDateString("vi-VN")],
                ["Thời hạn thuê", `${selectedRental.durationMonths} tháng`],
                ["Kỳ thanh toán", selectedRental.paymentCycle],
                ["Mã cọc tham chiếu", selectedRental.depositRef],
                ["Dịch vụ đi kèm", selectedRental.services.join(", ")],
                ["Trạng thái", getRentalStatusLabel(selectedRental.status)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <span className="text-gray-500">{k}</span>
                  <span className="font-semibold text-gray-900">{v}</span>
                </div>
              ))}
            </div>
            <div className="px-6 pb-6 flex gap-2">
              {selectedRental.status === "hieu_luc" && (
                <button
                  onClick={() => {
                    setSelectedRental(null);
                    navigate(`/sales/checkout-contract?contractId=${selectedRental.contractId}`);
                  }}
                  className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <DoorOpen className="w-4 h-4" /> Tiếp nhận trả phòng
                </button>
              )}
              <button onClick={() => setSelectedRental(null)} className="flex-1 px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-medium text-gray-700 transition-colors">Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Check-in & Identification Compare Wizard (UC 3) ── */}
      {showCheckinWizard && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-4 overflow-y-auto pt-[6vh] md:pt-[10vh]">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            {/* Wizard Header */}
            <div className="p-5 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-900 flex items-center gap-1.5">
                  <Sparkles className="w-5 h-5 text-green-600" />
                  Đối chiếu thông tin & nhận phòng
                </h3>
                <p className="text-[10px] text-gray-500">Quy trình bàn giao chìa khóa & ký hợp đồng (Bản ghi A5)</p>
              </div>
              <button onClick={() => setShowCheckinWizard(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Wizard Progress Bar */}
            <div className="flex bg-gray-100 h-1.5">
              <div className={`h-full bg-green-500 transition-all ${checkinStep === 1 ? "w-1/3" : checkinStep === 2 ? "w-2/3" : "w-full"}`} />
            </div>

            {/* Step Content */}
            <div className="p-6 space-y-4">
              {checkinStep === 1 && (
                <div className="space-y-3">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Bước 1: Tra cứu hợp đồng đặt cọc</p>
                  <div>
                    <label className="block text-xs font-semibold text-gray-750 mb-1">Mã hợp đồng đặt cọc <span className="text-red-500">*</span></label>
                    <div className="flex gap-2">
                      <input
                        value={checkinSearchRef}
                        onChange={e => setCheckinSearchRef(e.target.value)}
                        placeholder="Nhập mã hợp đồng cọc (Vd: DCxxxxxxxxxx)"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      <button onClick={handleCheckinSearch} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors">
                        Tìm
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {checkinStep === 2 && checkinFoundDeposit && (
                <div className="space-y-4">
                  <div className="bg-blue-50/60 p-3.5 border border-blue-200 rounded-xl space-y-1 text-xs text-gray-700">
                    <p><strong>Mã cọc:</strong> {checkinFoundDeposit.depositId}</p>
                    <p><strong>Khách hàng:</strong> {checkinFoundDeposit.customerName}</p>
                    <p><strong>Số điện thoại:</strong> {checkinFoundDeposit.phoneNumber}</p>
                    <p><strong>Phòng đặt giữ:</strong> {checkinFoundDeposit.roomName}</p>
                  </div>

                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wide border-b pb-1">
                    Bước 2: Đối chiếu CCCD thực tế của khách hàng
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-750 mb-1">Nhập Số CMND/CCCD thực tế khách mang tới <span className="text-red-500">*</span></label>
                      <input
                        value={checkinIdentityCard}
                        onChange={e => setCheckinIdentityCard(e.target.value)}
                        placeholder="Nhập 12 số CCCD"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white font-mono"
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={handleCheckinVerify}
                        className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs transition-colors flex justify-center items-center gap-1.5"
                      >
                        Kiểm tra thực tế
                      </button>
                    </div>

                    {checkinIdentityMatch && (
                      <div className="p-3 bg-green-100 border border-green-200 rounded-xl space-y-2">
                        <p className="text-xs text-green-800 font-bold flex items-center gap-1.5">✓ CCCD hợp lệ!</p>
                        <p className="text-[10px] text-green-700">Khách hàng đủ điều kiện bàn giao phòng. Bấm Tiếp tục để thiết lập hợp đồng thuê.</p>
                        <button
                          onClick={() => setCheckinStep(3)}
                          className="px-3.5 py-1.5 bg-green-700 hover:bg-green-800 text-white rounded text-xs font-semibold transition-colors"
                        >
                          Tiếp tục bước 3 →
                        </button>
                      </div>
                    )}

                    {checkinIdentityMismatchError && (
                      <div className="p-3.5 bg-red-50 border border-red-250 rounded-xl text-xs text-red-700 space-y-2">
                        <p className="font-bold flex items-center gap-1"><ShieldAlert className="w-4 h-4 text-red-650" /> Cảnh báo: Số CMND/CCCD không hợp lệ!</p>
                        <p className="text-[10px] text-red-600">Vui lòng kiểm tra lại định dạng số CMND/CCCD thực tế của khách hàng (gồm 9 hoặc 12 chữ số).</p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-start border-t pt-3">
                    <button onClick={() => setCheckinStep(1)} className="px-3 py-1.5 border border-gray-300 text-gray-600 rounded text-xs">← Quay lại Bước 1</button>
                  </div>
                </div>
              )}

              {checkinStep === 3 && checkinFoundDeposit && (
                <div className="space-y-4">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wide border-b pb-1">
                    Bước 3: Thiết lập điều khoản Hợp đồng thuê phòng
                  </p>

                  {checkinShowPreview ? (
                    <div className="bg-yellow-50/60 p-4 border border-yellow-200 rounded-xl space-y-3 text-xs text-gray-700">
                      <h4 className="font-bold text-center text-gray-800 tracking-wide">XÁC NHẬN HỢP ĐỒNG THUÊ</h4>
                      <p><strong>Bên thuê:</strong> {checkinFoundDeposit.customerName}</p>
                      <p><strong>Phòng thuê:</strong> {checkinFoundDeposit.roomName}</p>
                      <p><strong>Ngày vào ở:</strong> {new Date(checkinRentalForm.moveInDate).toLocaleDateString("vi-VN")}</p>
                      <p><strong>Thời hạn:</strong> {checkinRentalForm.duration} tháng</p>
                      <p><strong>Giá thuê/tháng:</strong> {parseInt(checkinRentalForm.monthlyRent).toLocaleString("vi-VN")} đ</p>
                      <p><strong>Kỳ thanh toán:</strong> {checkinRentalForm.paymentCycle}</p>
                      <div className="pt-2 flex gap-2">
                        <button onClick={handleCheckinSubmit} className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded text-xs">
                          Xác nhận ký hợp đồng
                        </button>
                        <button onClick={() => setCheckinShowPreview(false)} className="px-3 py-2 border border-gray-300 rounded text-xs">
                          Sửa
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 text-xs">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-gray-500 mb-1">Ngày bắt đầu nhận phòng</label>
                          <input
                            type="date"
                            value={checkinRentalForm.moveInDate}
                            onChange={e => setCheckinRentalForm({ ...checkinRentalForm, moveInDate: e.target.value })}
                            className="w-full px-2.5 py-1.5 border border-gray-300 rounded bg-white text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-500 mb-1">Thời hạn hợp đồng</label>
                          <select
                            value={checkinRentalForm.duration}
                            onChange={e => setCheckinRentalForm({ ...checkinRentalForm, duration: e.target.value })}
                            className="w-full px-2.5 py-1.5 border border-gray-300 rounded bg-white text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                          >
                            <option value="6">6 tháng</option>
                            <option value="12">12 tháng</option>
                            <option value="24">24 tháng</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-gray-500 mb-1">Giá thuê hàng tháng (VNĐ)</label>
                          <input
                            type="number"
                            value={checkinRentalForm.monthlyRent}
                            onChange={e => setCheckinRentalForm({ ...checkinRentalForm, monthlyRent: e.target.value })}
                            className="w-full px-2.5 py-1.5 border border-gray-300 rounded bg-white text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-500 mb-1">Kỳ thanh toán</label>
                          <select
                            value={checkinRentalForm.paymentCycle}
                            onChange={e => setCheckinRentalForm({ ...checkinRentalForm, paymentCycle: e.target.value })}
                            className="w-full px-2.5 py-1.5 border border-gray-300 rounded bg-white text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                          >
                            <option>Hàng tháng</option>
                            <option>Mỗi 3 tháng</option>
                            <option>Mỗi 6 tháng</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-3 border-t">
                        <button
                          onClick={() => {
                            if (!checkinRentalForm.moveInDate || !checkinRentalForm.monthlyRent) { toast.warning("Vui lòng nhập đủ thông tin."); return; }
                            setCheckinShowPreview(true);
                          }}
                          className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded text-xs"
                        >
                          Xem trước & Nhận phòng →
                        </button>
                        <button onClick={() => setCheckinStep(2)} className="px-3 py-2 border border-gray-300 rounded text-xs text-gray-700"> Quay lại CCCD </button>
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
