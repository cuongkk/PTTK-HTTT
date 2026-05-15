import { useState } from "react";
import {
  Search,
  MapPin,
  DollarSign,
  Users,
  Wifi,
  Wind,
  Tv,
  Droplet,
  Home,
  Filter,
  X,
} from "lucide-react";

export function RoomSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArea, setSelectedArea] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [roomType, setRoomType] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const rooms = [
    {
      id: 1,
      name: "Room 201",
      building: "Building A",
      area: "Downtown",
      type: "Single Bed",
      price: 400,
      status: "Available",
      amenities: ["WiFi", "AC", "TV", "Water"],
      size: "20m²",
      floor: "2nd Floor",
    },
    {
      id: 2,
      name: "Room 305",
      building: "Building B",
      area: "University District",
      type: "Double Bed",
      price: 300,
      status: "Available",
      amenities: ["WiFi", "AC", "Water"],
      size: "25m²",
      floor: "3rd Floor",
    },
    {
      id: 3,
      name: "Room 102",
      building: "Building C",
      area: "City Center",
      type: "Single Bed",
      price: 500,
      status: "Reserved",
      amenities: ["WiFi", "AC", "TV", "Water"],
      size: "22m²",
      floor: "1st Floor",
    },
    {
      id: 4,
      name: "Room 404",
      building: "Building A",
      area: "Downtown",
      type: "Shared Room",
      price: 250,
      status: "Available",
      amenities: ["WiFi", "Water"],
      size: "30m²",
      floor: "4th Floor",
    },
  ];

  const amenityIcons: Record<string, any> = {
    WiFi: Wifi,
    AC: Wind,
    TV: Tv,
    Water: Droplet,
  };

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.building.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesArea = selectedArea === "all" || room.area === selectedArea;
    const matchesPriceRange =
      priceRange === "all" ||
      (priceRange === "low" && room.price < 300) ||
      (priceRange === "medium" && room.price >= 300 && room.price < 450) ||
      (priceRange === "high" && room.price >= 450);
    const matchesType = roomType === "all" || room.type === roomType;

    return matchesSearch && matchesArea && matchesPriceRange && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Search Rooms</h1>
        <p className="text-gray-600">Find your perfect room or bed</p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by room name or building..."
              className="w-full pl-11 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            <Filter className="w-5 h-5" />
            <span>Filters</span>
          </button>
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Area</label>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="all">All Areas</option>
                <option value="Downtown">Downtown</option>
                <option value="University District">University District</option>
                <option value="City Center">City Center</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="all">All Prices</option>
                <option value="low">Under $300</option>
                <option value="medium">$300 - $450</option>
                <option value="high">$450+</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Room Type</label>
              <select
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="all">All Types</option>
                <option value="Single Bed">Single Bed</option>
                <option value="Double Bed">Double Bed</option>
                <option value="Shared Room">Shared Room</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          Found <span className="font-semibold text-gray-900">{filteredRooms.length}</span> rooms
        </p>
      </div>

      {/* Room Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredRooms.map((room) => (
          <div
            key={room.id}
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Room Image Placeholder */}
            <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
              <Home className="w-16 h-16 text-blue-300" />
            </div>

            {/* Room Details */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{room.name}</h3>
                  <p className="text-sm text-gray-600">{room.building}</p>
                </div>
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${
                    room.status === "Available"
                      ? "bg-green-100 text-green-700"
                      : "bg-orange-100 text-orange-700"
                  }`}
                >
                  {room.status}
                </span>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{room.area}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{room.type}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Home className="w-4 h-4" />
                  <span>{room.size}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Home className="w-4 h-4" />
                  <span>{room.floor}</span>
                </div>
              </div>

              {/* Amenities */}
              <div className="flex flex-wrap gap-2 mb-4">
                {room.amenities.map((amenity) => {
                  const Icon = amenityIcons[amenity];
                  return (
                    <div
                      key={amenity}
                      className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                    >
                      <Icon className="w-3 h-3" />
                      <span>{amenity}</span>
                    </div>
                  );
                })}
              </div>

              {/* Price & Action */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div>
                  <p className="text-2xl font-bold text-gray-900">${room.price}</p>
                  <p className="text-sm text-gray-600">per month</p>
                </div>
                <button
                  disabled={room.status !== "Available"}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                >
                  {room.status === "Available" ? "Reserve Now" : "Not Available"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
