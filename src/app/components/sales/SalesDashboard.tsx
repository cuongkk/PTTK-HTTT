import { Link } from "react-router";
import {
  Building2,
  Users,
  FileText,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

export function SalesDashboard() {
  const stats = [
    { label: "Available Rooms", value: "12", icon: Building2, color: "blue", trend: "+3" },
    { label: "New Registrations", value: "8", icon: Users, color: "green", trend: "+5" },
    { label: "Pending Contracts", value: "5", icon: FileText, color: "orange", trend: "+2" },
    { label: "Appointments Today", value: "4", icon: Calendar, color: "purple", trend: "0" },
  ];

  const recentRegistrations = [
    {
      id: 1,
      name: "John Smith",
      room: "Room 201 - Building A",
      date: "May 14, 2026",
      status: "Pending Review",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      room: "Room 305 - Building B",
      date: "May 13, 2026",
      status: "Approved",
    },
    {
      id: 3,
      name: "Michael Chen",
      room: "Room 404 - Building A",
      date: "May 13, 2026",
      status: "Pending Review",
    },
  ];

  const upcomingAppointments = [
    {
      id: 1,
      client: "Emma Wilson",
      room: "Room 501 - Building C",
      time: "10:00 AM",
      type: "Room Viewing",
    },
    {
      id: 2,
      client: "David Lee",
      room: "Room 202 - Building A",
      time: "2:00 PM",
      type: "Contract Signing",
    },
    {
      id: 3,
      client: "Lisa Anderson",
      room: "Room 308 - Building B",
      time: "4:00 PM",
      type: "Room Viewing",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sales Dashboard</h1>
        <p className="text-gray-600">Manage rooms, registrations, and contracts</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: "bg-blue-100 text-blue-600",
            green: "bg-green-100 text-green-600",
            orange: "bg-orange-100 text-orange-600",
            purple: "bg-purple-100 text-purple-600",
          };
          return (
            <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-3 rounded-lg ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                  <Icon className="w-6 h-6" />
                </div>
                {stat.trend !== "0" && (
                  <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                    <TrendingUp className="w-4 h-4" />
                    <span>{stat.trend}</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/sales/rooms"
          className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 hover:from-blue-600 hover:to-blue-700 transition-all group"
        >
          <Building2 className="w-8 h-8 mb-3" />
          <h3 className="text-lg font-semibold mb-1">Manage Rooms</h3>
          <p className="text-sm text-blue-100">View and update room availability</p>
        </Link>

        <Link
          to="/sales/registrations"
          className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 hover:from-green-600 hover:to-green-700 transition-all group"
        >
          <Users className="w-8 h-8 mb-3" />
          <h3 className="text-lg font-semibold mb-1">Registrations</h3>
          <p className="text-sm text-green-100">Review rental applications</p>
        </Link>

        <Link
          to="/sales/contracts"
          className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 hover:from-purple-600 hover:to-purple-700 transition-all group"
        >
          <FileText className="w-8 h-8 mb-3" />
          <h3 className="text-lg font-semibold mb-1">Contracts</h3>
          <p className="text-sm text-purple-100">Create and manage contracts</p>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Registrations */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Recent Registrations</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {recentRegistrations.map((reg) => (
              <div key={reg.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{reg.name}</h3>
                    <p className="text-sm text-gray-600">{reg.room}</p>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${
                      reg.status === "Approved"
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {reg.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{reg.date}</p>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-gray-200">
            <Link
              to="/sales/registrations"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View all registrations →
            </Link>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Today's Appointments</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {upcomingAppointments.map((apt) => (
              <div key={apt.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-semibold text-gray-900">{apt.client}</h3>
                      <span className="text-sm font-medium text-blue-600">{apt.time}</span>
                    </div>
                    <p className="text-sm text-gray-600">{apt.room}</p>
                    <p className="text-xs text-gray-500 mt-1">{apt.type}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
