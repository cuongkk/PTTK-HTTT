import { Link } from "react-router";
import {
  Building2,
  Users,
  FileCheck,
  ClipboardCheck,
  TrendingUp,
  DollarSign,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

export function ManagerDashboard() {
  const stats = [
    { label: "Occupancy Rate", value: "85%", icon: Building2, color: "blue", trend: "+5%" },
    { label: "Monthly Revenue", value: "$24,500", icon: DollarSign, color: "green", trend: "+12%" },
    { label: "Pending Approvals", value: "6", icon: AlertCircle, color: "orange" },
    { label: "Active Contracts", value: "42", icon: FileCheck, color: "purple" },
  ];

  const pendingApprovals = [
    {
      id: 1,
      type: "Deposit Payment",
      customer: "Sarah Johnson",
      room: "Room 305 - Building B",
      amount: "$800",
      date: "May 13, 2026",
    },
    {
      id: 2,
      type: "Rental Contract",
      customer: "Michael Chen",
      room: "Room 404 - Building A",
      amount: "$250/mo",
      date: "May 14, 2026",
    },
    {
      id: 3,
      type: "Tenant Verification",
      customer: "Emma Wilson",
      room: "Room 501 - Building C",
      amount: "-",
      date: "May 14, 2026",
    },
  ];

  const roomStats = [
    { building: "Building A", total: 20, occupied: 18, available: 2, maintenance: 0 },
    { building: "Building B", total: 15, occupied: 12, available: 2, maintenance: 1 },
    { building: "Building C", total: 10, occupied: 8, available: 1, maintenance: 1 },
  ];

  const recentActivity = [
    {
      id: 1,
      action: "Contract Approved",
      details: "Rental contract for John Smith - Room 203",
      time: "2 hours ago",
    },
    {
      id: 2,
      action: "Room Inspected",
      details: "Room 501 passed inspection - Ready for new tenant",
      time: "4 hours ago",
    },
    {
      id: 3,
      action: "Tenant Verified",
      details: "Background check completed for Sarah Johnson",
      time: "1 day ago",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Manager Dashboard</h1>
        <p className="text-gray-600">Overview and approvals management</p>
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
                {stat.trend && (
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          to="/manager/inspection"
          className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 hover:from-blue-600 hover:to-blue-700 transition-all"
        >
          <Building2 className="w-8 h-8 mb-3" />
          <h3 className="text-lg font-semibold mb-1">Room Inspection</h3>
          <p className="text-sm text-blue-100">Check room conditions</p>
        </Link>

        <Link
          to="/manager/contract-approval"
          className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 hover:from-green-600 hover:to-green-700 transition-all"
        >
          <FileCheck className="w-8 h-8 mb-3" />
          <h3 className="text-lg font-semibold mb-1">Contract Approval</h3>
          <p className="text-sm text-green-100">Review contracts</p>
        </Link>

        <Link
          to="/manager/tenant-verification"
          className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 hover:from-purple-600 hover:to-purple-700 transition-all"
        >
          <Users className="w-8 h-8 mb-3" />
          <h3 className="text-lg font-semibold mb-1">Tenant Verification</h3>
          <p className="text-sm text-purple-100">Verify tenants</p>
        </Link>

        <Link
          to="/manager/liquidation"
          className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-6 hover:from-orange-600 hover:to-orange-700 transition-all"
        >
          <ClipboardCheck className="w-8 h-8 mb-3" />
          <h3 className="text-lg font-semibold mb-1">Liquidation</h3>
          <p className="text-sm text-orange-100">End contracts</p>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Approvals */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Pending Approvals</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {pendingApprovals.map((approval) => (
              <div key={approval.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{approval.type}</h3>
                    <p className="text-sm text-gray-600">{approval.customer}</p>
                  </div>
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                    Pending
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{approval.room}</span>
                  <span className="font-medium text-gray-900">{approval.amount}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-gray-200">
            <Link
              to="/manager/contract-approval"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View all approvals →
            </Link>
          </div>
        </div>

        {/* Room Statistics */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Room Statistics by Building</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {roomStats.map((stat, index) => (
              <div key={index} className="p-4">
                <h3 className="font-semibold text-gray-900 mb-3">{stat.building}</h3>
                <div className="grid grid-cols-4 gap-2 text-sm">
                  <div>
                    <p className="text-gray-600">Total</p>
                    <p className="text-lg font-bold text-gray-900">{stat.total}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Occupied</p>
                    <p className="text-lg font-bold text-blue-600">{stat.occupied}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Available</p>
                    <p className="text-lg font-bold text-green-600">{stat.available}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Maintenance</p>
                    <p className="text-lg font-bold text-orange-600">{stat.maintenance}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="p-4 flex items-start gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{activity.action}</h3>
                <p className="text-sm text-gray-600 mb-1">{activity.details}</p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
