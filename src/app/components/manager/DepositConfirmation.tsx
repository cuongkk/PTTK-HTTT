import { useState } from "react";
import { ClipboardList, Building2, CheckCircle, AlertTriangle, Camera, Plus } from "lucide-react";

export function DepositConfirmation() {
  const [selectedDeposit, setSelectedDeposit] = useState<number | null>(null);
  const [showDepositDetail, setShowDepositDetail] = useState(false);

  const deposits = [
    {
        id: 1,
        contractCode: "DC001",
        customer: "Nguyễn Văn A",
        room: "Room 501",
        depositAmount: "2.000.000 VNĐ",
        status: "Chờ xác nhận",
    },
    {
        id: 2,
        contractCode: "DC002",
        customer: "Trần Văn B",
        room: "Room 203",
        depositAmount: "2.000.000 VNĐ",
        status: "Chờ xác nhận",
    },
    {
        id: 3,
        contractCode: "DC003",
        customer: "Lê Văn C",
        room: "Room 404",
        depositAmount: "2.000.000 VNĐ",
        status: "Chờ xác nhận",
    },
    ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Xác nhận tiền cọc</h1>
        <p className="text-gray-600">Xác nhận thông tin tiền cọc của khách hàng</p>
      </div>

      {/* Room List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {deposits.map((deposit) => (
            <div
            key={deposit.id}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
            >
            <div className="flex justify-between items-start mb-4">
                <div>
                <h3 className="text-lg font-bold text-gray-900">
                    {deposit.contractCode}
                </h3>

                <p className="text-sm text-gray-600">
                    {deposit.customer}
                </p>
                </div>

                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                {deposit.status}
                </span>
            </div>

            <div className="space-y-2 mb-4 text-sm">
                <p>
                <span className="text-gray-600">Phòng:</span>{" "}
                {deposit.room}
                </p>

                <p>
                <span className="text-gray-600">Tiền cọc:</span>{" "}
                {deposit.depositAmount}
                </p>
            </div>

            <button
                onClick={() => setShowDepositDetail(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
            >   
            Xem chi tiết
            </button>
            </div>
        ))}
        </div>

      {/* Inspection Form Modal */}
      {showDepositDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full p-6">

            <h2 className="text-xl font-bold text-gray-900 mb-6">
                Thông tin đặt cọc
            </h2>

            <div className="space-y-4">

                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mã hợp đồng
                </label>

                <input
                    value="DC001"
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
                </div>

                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Khách hàng
                </label>

                <input
                    value="Nguyễn Văn A"
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
                </div>

                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phòng
                </label>

                <input
                    value="Room 501"
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
                </div>

                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tiền cọc
                </label>

                <input
                    value="2.000.000 VNĐ"
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
                </div>

                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chứng từ thanh toán
                </label>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    Hình ảnh chứng từ thanh toán
                </div>
                </div>

            </div>

            <div className="flex gap-3 pt-6">

                <button
                onClick={() => setShowDepositDetail(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                >
                Đóng
                </button>

                <button
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                >
                Không hợp lệ
                </button>

                <button
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                >
                Xác nhận hợp lệ
                </button>

            </div>

            </div>
        </div>
        )}
    </div>
  );
}
