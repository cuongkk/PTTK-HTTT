import { useState } from "react";
import { FileText, User, Users, Calendar, Home, Plus, X, CheckCircle } from "lucide-react";

export function RentalRegistration() {
  const [formData, setFormData] = useState({
    roomId: "",
    moveInDate: "",
    duration: "6",
    primaryTenant: {
      fullName: "",
      idNumber: "",
      phone: "",
      email: "",
    },
  });

  const [additionalTenants, setAdditionalTenants] = useState<Array<{
    fullName: string;
    idNumber: string;
    phone: string;
  }>>([]);

  const [submitted, setSubmitted] = useState(false);

  const availableRooms = [
    { id: "1", name: "Room 201 - Building A", price: 400 },
    { id: "2", name: "Room 305 - Building B", price: 300 },
    { id: "4", name: "Room 404 - Building A", price: 250 },
  ];

  const addTenant = () => {
    setAdditionalTenants([...additionalTenants, { fullName: "", idNumber: "", phone: "" }]);
  };

  const removeTenant = (index: number) => {
    setAdditionalTenants(additionalTenants.filter((_, i) => i !== index));
  };

  const updateTenant = (index: number, field: string, value: string) => {
    const updated = [...additionalTenants];
    updated[index] = { ...updated[index], [field]: value };
    setAdditionalTenants(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Your rental registration has been submitted successfully. Our sales team will review your
            application and contact you within 24 hours.
          </p>
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-900 font-medium mb-1">Registration ID: #RR-2026-0514</p>
            <p className="text-sm text-blue-700">
              You can track your application status in the dashboard
            </p>
          </div>
          <button
            onClick={() => setSubmitted(false)}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Submit Another Registration
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Rental Registration</h1>
        <p className="text-gray-600">Submit your rental application</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Room Selection */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Home className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Room Selection</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Room</label>
              <select
                required
                value={formData.roomId}
                onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="">Choose a room...</option>
                {availableRooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name} - ${room.price}/month
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Move-in Date</label>
              <input
                type="date"
                required
                value={formData.moveInDate}
                onChange={(e) => setFormData({ ...formData, moveInDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rental Duration (months)
              </label>
              <select
                required
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="3">3 months</option>
                <option value="6">6 months</option>
                <option value="12">12 months</option>
                <option value="24">24 months</option>
              </select>
            </div>
          </div>
        </div>

        {/* Primary Tenant Information */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Primary Tenant Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                required
                value={formData.primaryTenant.fullName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    primaryTenant: { ...formData.primaryTenant, fullName: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Enter full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ID Number</label>
              <input
                type="text"
                required
                value={formData.primaryTenant.idNumber}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    primaryTenant: { ...formData.primaryTenant, idNumber: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Enter ID number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                required
                value={formData.primaryTenant.phone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    primaryTenant: { ...formData.primaryTenant, phone: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                required
                value={formData.primaryTenant.email}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    primaryTenant: { ...formData.primaryTenant, email: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Enter email"
              />
            </div>
          </div>
        </div>

        {/* Additional Tenants */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Additional Tenants (Optional)</h2>
            </div>
            <button
              type="button"
              onClick={addTenant}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Tenant
            </button>
          </div>

          {additionalTenants.length === 0 ? (
            <p className="text-gray-600 text-sm">No additional tenants added</p>
          ) : (
            <div className="space-y-4">
              {additionalTenants.map((tenant, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg relative">
                  <button
                    type="button"
                    onClick={() => removeTenant(index)}
                    className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-600 rounded"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pr-8">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={tenant.fullName}
                        onChange={(e) => updateTenant(index, "fullName", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Enter full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ID Number
                      </label>
                      <input
                        type="text"
                        value={tenant.idNumber}
                        onChange={(e) => updateTenant(index, "idNumber", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Enter ID number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={tenant.phone}
                        onChange={(e) => updateTenant(index, "phone", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Submit Registration
          </button>
        </div>
      </form>
    </div>
  );
}
