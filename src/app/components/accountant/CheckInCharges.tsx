import { useState } from "react";
import { Calculator, Save, User, Home, CheckCircle, Search } from "lucide-react";

export function CheckInCharges() {
  const [selectedContract, setSelectedContract] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [chargesData, setChargesData] = useState({
    depositAmount: "",
    firstMonthRent: "",
    serviceFee: "",
    otherFees: "",
    notes: "",
  });

  const pendingContracts = [
    {
      id: 1,
      contractId: "CT-2026-0501",
      customer: "Alice Williams",
      room: "Room 101 - Building A",
      moveInDate: "May 20, 2026",
    },
    {
      id: 2,
      contractId: "CT-2026-0502",
      customer: "Robert Brown",
      room: "Room 205 - Building B",
      moveInDate: "May 22, 2026",
    },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Check-in charges saved successfully for contract ${selectedContract}!`);
    setSelectedContract(null);
    setChargesData({
      depositAmount: "",
      firstMonthRent: "",
      serviceFee: "",
      otherFees: "",
      notes: "",
    });
  };

  const totalAmount = 
    (parseFloat(chargesData.depositAmount) || 0) + 
    (parseFloat(chargesData.firstMonthRent) || 0) + 
    (parseFloat(chargesData.serviceFee) || 0) + 
    (parseFloat(chargesData.otherFees) || 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Check-in Charges</h1>
        <p className="text-gray-600">Calculate and input required charges for check-in</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Contracts List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Pending Contracts</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, room or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="space-y-3">
            {pendingContracts
              .filter(
                (c) =>
                  c.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  c.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  c.contractId.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((contract) => (
              <div
                key={contract.id}
                onClick={() => setSelectedContract(contract.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedContract === contract.id
                    ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                    : "border-gray-200 bg-white hover:border-blue-300"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-bold text-blue-600">{contract.contractId}</span>
                  <span className="text-xs text-gray-500">{contract.moveInDate}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-900 font-medium mb-1">
                  <User className="w-4 h-4 text-gray-500" />
                  {contract.customer}
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <Home className="w-4 h-4 text-gray-500" />
                  {contract.room}
                </div>
              </div>
            ))}
            {pendingContracts.length === 0 && (
              <div className="p-8 text-center bg-gray-50 rounded-xl border border-gray-200 border-dashed">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-gray-600">No pending contracts for check-in.</p>
              </div>
            )}
          </div>
        </div>

        {/* Input Form */}
        <div className="lg:col-span-2">
          {selectedContract ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calculator className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Input Charges</h2>
                  <p className="text-sm text-gray-600">
                    For {pendingContracts.find((c) => c.id === selectedContract)?.customer} (
                    {pendingContracts.find((c) => c.id === selectedContract)?.contractId})
                  </p>
                </div>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Security Deposit ($)
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={chargesData.depositAmount}
                      onChange={(e) => setChargesData({ ...chargesData, depositAmount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="e.g. 1000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Month Rent ($)
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={chargesData.firstMonthRent}
                      onChange={(e) => setChargesData({ ...chargesData, firstMonthRent: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="e.g. 500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Fee ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={chargesData.serviceFee}
                      onChange={(e) => setChargesData({ ...chargesData, serviceFee: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="e.g. 50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Other Fees ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={chargesData.otherFees}
                      onChange={(e) => setChargesData({ ...chargesData, otherFees: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="e.g. 20"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={chargesData.notes}
                      onChange={(e) => setChargesData({ ...chargesData, notes: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                      placeholder="Optional notes..."
                    />
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                  <span className="text-gray-700 font-medium">Total Amount to Collect:</span>
                  <span className="text-2xl font-bold text-blue-600">${totalAmount.toFixed(2)}</span>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-6">
                  <button
                    type="button"
                    onClick={() => setSelectedContract(null)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Save & Confirm
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-gray-200 border-dashed text-gray-500 p-8">
              <Calculator className="w-12 h-12 mb-4 text-gray-400" />
              <p className="text-lg font-medium text-gray-900 mb-1">No Contract Selected</p>
              <p className="text-center max-w-sm">
                Select a pending contract from the list to calculate and input check-in charges.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
