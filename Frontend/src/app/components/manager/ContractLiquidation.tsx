import { useState } from "react";
import { ClipboardCheck, Calendar, DollarSign, AlertCircle, CheckCircle, Building2 } from "lucide-react";

export function ContractLiquidation() {
  const contractsToLiquidate = [
    {
      id: 1,
      contractId: "RC-2026-0008",
      customer: "Emma Wilson",
      room: "Phòng 501 - Tòa C",
      startDate: "01/01/2026",
      endDate: "31/05/2026",
      moveOutDate: "10/05/2026",
      earlyTermination: true,
      monthlyRent: 500,
      deposit: 1000,
      status: "Chờ thanh lý",
      inspectionCompleted: true,
      reconciliationCompleted: false,
    },
    {
      id: 2,
      contractId: "RC-2026-0003",
      customer: "David Lee",
      room: "Phòng 202 - Tòa A",
      startDate: "01/12/2025",
      endDate: "31/05/2026",
      moveOutDate: "05/05/2026",
      earlyTermination: false,
      monthlyRent: 400,
      deposit: 800,
      status: "Chờ thanh lý",
      inspectionCompleted: true,
      reconciliationCompleted: true,
    },
  ];

  const handleLiquidate = (id: number) => {
    alert(`Thanh lý hợp đồng ${id} thành công!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Thanh lý hợp đồng</h1>
        <p className="text-gray-600">Kết thúc hợp đồng thuê và bắt đầu quá trình đối chiếu</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Đang chờ thanh lý</p>
          <p className="text-2xl font-bold text-gray-900">{contractsToLiquidate.length}</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Đã thanh lý tháng này</p>
          <p className="text-2xl font-bold text-gray-900">5</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Đang chờ kiểm tra phòng</p>
          <p className="text-2xl font-bold text-gray-900">0</p>
        </div>
      </div>

      {/* Contracts to Liquidate */}
      <div className="space-y-6">
        {contractsToLiquidate.map((contract) => (
          <div
            key={contract.id}
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {contract.contractId} - {contract.customer}
                  </h3>
                  <p className="text-sm text-gray-600">{contract.room}</p>
                </div>
                <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm font-medium rounded-full">
                  {contract.status}
                </span>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Contract Period */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Thời hạn hợp đồng</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ngày bắt đầu:</span>
                      <span className="font-medium text-gray-900">{contract.startDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ngày kết thúc:</span>
                      <span className="font-medium text-gray-900">{contract.endDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ngày dọn ra:</span>
                      <span className="font-medium text-gray-900">{contract.moveOutDate}</span>
                    </div>
                    {contract.earlyTermination && (
                      <div className="flex items-center gap-2 text-orange-600">
                        <AlertCircle className="w-4 h-4" />
                        <span className="font-medium">Chấm dứt trước thời hạn</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Financial Details */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Thông tin tài chính</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tiền thuê hàng tháng:</span>
                      <span className="font-medium text-gray-900">${contract.monthlyRent}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tiền đặt cọc:</span>
                      <span className="font-medium text-gray-900">${contract.deposit}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Checklist */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Danh mục kiểm tra thanh lý</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {contract.inspectionCompleted ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                    )}
                    <span
                      className={`text-sm ${
                        contract.inspectionCompleted ? "text-green-700" : "text-gray-600"
                      }`}
                    >
                      Đã hoàn thành kiểm tra phòng
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {contract.reconciliationCompleted ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                    )}
                    <span
                      className={`text-sm ${
                        contract.reconciliationCompleted ? "text-green-700" : "text-gray-600"
                      }`}
                    >
                      Đã hoàn thành đối chiếu công nợ
                    </span>
                  </div>
                </div>
              </div>

              {!contract.reconciliationCompleted && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900 mb-1">Yêu cầu hành động</p>
                      <p className="text-sm text-blue-700">
                        Vui lòng hoàn thành đối chiếu công nợ tại mục Kế toán trước khi tiến hành thanh lý hợp đồng này.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  disabled={!contract.inspectionCompleted || !contract.reconciliationCompleted}
                  onClick={() => handleLiquidate(contract.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                >
                  <ClipboardCheck className="w-4 h-4" />
                  Hoàn tất thanh lý
                </button>

                {!contract.inspectionCompleted && (
                  <button className="flex items-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors">
                    Đi đến kiểm tra phòng
                  </button>
                )}

                {!contract.reconciliationCompleted && (
                  <button className="flex items-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors">
                    Đi đến đối chiếu công nợ
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}