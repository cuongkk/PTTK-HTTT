import { Link } from "react-router";
import {
  Search,
  FileText,
  CreditCard,
  Home,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
} from "lucide-react";

export function CustomerDashboard() {
  const stats = [
    { label: "Active Contracts", value: "1", icon: FileText, color: "blue" },
    { label: "Pending Payments", value: "2", icon: CreditCard, color: "orange" },
    { label: "Upcoming Due Date", value: "May 20", icon: Calendar, color: "green" },
  ];

  const quickActions = [
    {
      title: "Search Rooms",
      description: "Find available rooms and beds",
      icon: Search,
      link: "/customer/rooms",
      color: "blue",
    },
    {
      title: "Register Rental",
      description: "Submit a new rental application",
      icon: FileText,
      link: "/customer/register",
      color: "green",
    },
    {
      title: "My Payments",
      description: "View and manage your payments",
      icon: CreditCard,
      link: "/customer/payments",
      color: "purple",
    },
  ];

  const recentActivity = [
    {
      title: "Payment Confirmed",
      description: "Monthly rent for Room 203 - May 2026",
      time: "2 hours ago",
      status: "success",
    },
    {
      title: "Payment Due",
      description: "Deposit for Room 301 - Due May 20",
      time: "1 day ago",
      status: "warning",
    },
    {
      title: "Contract Signed",
      description: "Rental contract for Room 203",
      time: "3 days ago",
      status: "success",
    },
  ];

  const myRooms = [
    {
      id: 1,
      name: "Room 203",
      building: "Building A",
      type: "Single Bed",
      price: "$400/month",
      status: "Active",
      moveInDate: "Jan 15, 2026",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h1>
        <p className="text-gray-600">Manage your rentals and payments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: "bg-blue-100 text-blue-600",
            orange: "bg-orange-100 text-orange-600",
            green: "bg-green-100 text-green-600",
          };
          return (
            <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            const colorClasses = {
              blue: "bg-blue-600 hover:bg-blue-700",
              green: "bg-green-600 hover:bg-green-700",
              purple: "bg-purple-600 hover:bg-purple-700",
            };
            return (
              <Link
                key={index}
                to={action.link}
                className={`${colorClasses[action.color as keyof typeof colorClasses]} text-white rounded-xl p-6 transition-colors group`}
              >
                <Icon className="w-8 h-8 mb-3" />
                <h3 className="text-lg font-semibold mb-1">{action.title}</h3>
                <p className="text-sm text-white/80">{action.description}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* My Rooms */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">My Rooms</h2>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {myRooms.map((room) => (
            <div key={room.id} className="p-6 border-b border-gray-200 last:border-b-0">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Home className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{room.name}</h3>
                    <p className="text-sm text-gray-600">{room.building}</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                  {room.status}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Type</p>
                  <p className="font-medium text-gray-900">{room.type}</p>
                </div>
                <div>
                  <p className="text-gray-600">Price</p>
                  <p className="font-medium text-gray-900">{room.price}</p>
                </div>
                <div>
                  <p className="text-gray-600">Move-in Date</p>
                  <p className="font-medium text-gray-900">{room.moveInDate}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-200">
          {recentActivity.map((activity, index) => (
            <div key={index} className="p-4 flex items-start gap-4">
              <div
                className={`p-2 rounded-lg ${
                  activity.status === "success"
                    ? "bg-green-100 text-green-600"
                    : "bg-orange-100 text-orange-600"
                }`}
              >
                {activity.status === "success" ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 mb-1">{activity.title}</h3>
                <p className="text-sm text-gray-600 mb-1">{activity.description}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
