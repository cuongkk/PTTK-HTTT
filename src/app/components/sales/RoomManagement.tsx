import { useState } from "react";
import { Building2, MapPin, DollarSign, Users, CheckCircle, Clock, AlertTriangle, Settings } from "lucide-react";

export function RoomManagement() {
  const [filterStatus, setFilterStatus] = useState("all");

  const rooms = [
    {
      id: 1,
      name: "Room 201",
      building: "Building A",
      floor: "2nd Floor",
      type: "Single Bed",
      price: 400,
      status: "Available",
      area: "Downtown",
      lastUpdated: "May 10, 2026",
    },
    {
      id: 2,
      name: "Room 305",
      building: "Building B",
      floor: "3rd Floor",
      type: "Double Bed",
      price: 300,
      status: "Available",
      area: "University District",
      lastUpdated: "May 12, 2026",
    },
    {
      id: 3,
      name: "Room 102",
      building: "Building C",
      floor: "1st Floor",
      type: "Single Bed",
      price: 500,
      status: "Occupied",
      area: "City Center",
      tenant: "John Smith",
      lastUpdated: "Jan 15, 2026",
    },
    {
      id: 4,
      name: "Room 404",
      building: "Building A",
      floor: "4th Floor",
      type: "Shared Room",
      price: 250,
      status: "Reserved",
      area: "Downtown",
      lastUpdated: "May 13, 2026",
    },
    {
      id: 5,
      name: "Room 203",
      building: "Building A",
      floor: "2nd Floor",
      type: "Single Bed",
      price: 400,
      status: "Under Maintenance",
      area: "Downtown",
      lastUpdated: "May 8, 2026",
    },
  ];

  const statusConfig = {
    Available: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-100" },
    Occupied: { icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
    Reserved: { icon: Clock, color: "text-orange-600", bg: "bg-orange-100" },
    "Under Maintenance": { icon: AlertTriangle, color: "text-red-600", bg: "bg-red-100" },
    Locked: { icon: AlertTriangle, color: "text-gray-600", bg: "bg-gray-100" },
  };

  const filteredRooms = filterStatus === "all" ? rooms : rooms.filter((r) => r.status === filterStatus);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Room Management</h1>
        <p className="text-gray-600">View and manage room availability</p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All Rooms
          </button>
          {Object.keys(statusConfig).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === status
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Room List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredRooms.map((room) => {
          const config = statusConfig[room.status as keyof typeof statusConfig];
          const StatusIcon = config.icon;

          return (
            <div
              key={room.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{room.name}</h3>
                      <p className="text-sm text-gray-600">{room.building}</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${config.bg}`}>
                    <StatusIcon className={`w-4 h-4 ${config.color}`} />
                    <span className={`text-sm font-medium ${config.color}`}>{room.status}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-gray-600">Type</p>
                    <p className="font-medium text-gray-900">{room.type}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Floor</p>
                    <p className="font-medium text-gray-900">{room.floor}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Price</p>
                    <p className="font-medium text-gray-900">${room.price}/month</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Area</p>
                    <p className="font-medium text-gray-900">{room.area}</p>
                  </div>
                </div>

                {room.tenant && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-900">
                      <span className="font-medium">Current Tenant:</span> {room.tenant}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">Updated: {room.lastUpdated}</p>
                  <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Settings className="w-4 h-4" />
                    Manage
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
