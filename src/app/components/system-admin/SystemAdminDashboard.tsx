import { Link } from "react-router";
import {
  Shield,
  Users,
  Settings,
  Building2,
  DollarSign,
  Clock,
  TrendingUp,
  AlertCircle,
  FileText,
  ChevronRight,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

export function SystemAdminDashboard() {
  const stats = [
    {
      label: "Total Accounts",
      value: "248",
      note: "+18 this month",
      icon: Users,
      color: "blue",
    },
    {
      label: "Active Policies",
      value: "12",
      note: "4 updated recently",
      icon: Settings,
      color: "purple",
    },
    {
      label: "Room Catalog Items",
      value: "36",
      note: "Rooms and bed types",
      icon: Building2,
      color: "green",
    },
    {
      label: "Service Packages",
      value: "9",
      note: "Utilities and extras",
      icon: DollarSign,
      color: "orange",
    },
  ];

  const quickActions = [
    {
      title: "User Management",
      description: "Create, edit, assign roles, and manage customer accounts.",
      path: "/system-admin/users",
      icon: Users,
      tone: "from-blue-500 to-blue-600",
      caption: "Accounts and permissions",
    },
    {
      title: "System Settings",
      description: "Configure shared rules such as deposit ratios and payment windows.",
      path: "/system-admin/settings",
      icon: Settings,
      tone: "from-purple-500 to-purple-600",
      caption: "Global configuration",
    },
    {
      title: "Room / Bed Catalog",
      description: "Maintain room categories, bed capacity, and rental pricing.",
      path: "/system-admin/rooms",
      icon: Building2,
      tone: "from-emerald-500 to-emerald-600",
      caption: "Rooms, beds, and pricing",
    },
    {
      title: "Service Catalog",
      description: "Manage utilities and extra services like electricity, water, and wifi.",
      path: "/system-admin/services",
      icon: DollarSign,
      tone: "from-orange-500 to-orange-600",
      caption: "Fees and add-ons",
    },
  ];

  const alerts = [
    {
      title: "Deposit policy review",
      detail: "Update the refundable deposit ratio before the new term starts.",
      status: "Needs attention",
    },
    {
      title: "Pending account approvals",
      detail: "3 employee accounts are waiting for role assignment.",
      status: "Pending",
    },
    {
      title: "Service pricing sync",
      detail: "Electricity and cleaning fees were adjusted this morning.",
      status: "Updated",
    },
  ];

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white p-8 shadow-xl overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.35),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.18),transparent_30%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <Badge variant="secondary" className="bg-white/10 text-white border-white/15">
              System Admin Console
            </Badge>
            <div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Central administration hub</h1>
              <p className="mt-3 text-slate-200 max-w-2xl">
                Control users, shared policies, room and bed catalog data, and the service price list from a single operating surface.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="bg-white text-slate-900 hover:bg-slate-100">
                <Link to="/system-admin/users">
                  Review accounts
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white">
                <Link to="/system-admin/settings">
                  Open settings
                </Link>
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-slate-300">System health</p>
              <p className="mt-1 text-2xl font-semibold">99.9%</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-slate-300">Open changes</p>
              <p className="mt-1 text-2xl font-semibold">7</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-slate-300">Audited actions</p>
              <p className="mt-1 text-2xl font-semibold">128</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-slate-300">Policy updates</p>
              <p className="mt-1 text-2xl font-semibold">4</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: "bg-blue-100 text-blue-700",
            purple: "bg-purple-100 text-purple-700",
            green: "bg-emerald-100 text-emerald-700",
            orange: "bg-orange-100 text-orange-700",
          };

          return (
            <Card key={stat.label} className="shadow-sm border-slate-200/80">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className={`rounded-2xl p-3 ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                    Live
                  </span>
                </div>
                <p className="mt-4 text-sm text-slate-500">{stat.label}</p>
                <p className="mt-1 text-3xl font-bold text-slate-900">{stat.value}</p>
                <p className="mt-2 text-sm text-slate-600">{stat.note}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {quickActions.map((action) => {
          const Icon = action.icon;

          return (
            <Link key={action.path} to={action.path} className="group">
              <Card className="h-full overflow-hidden border-slate-200/80 shadow-sm transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-lg">
                <CardContent className="p-0">
                  <div className={`flex h-full flex-col justify-between bg-gradient-to-br ${action.tone} p-6 text-white`}>
                    <div>
                      <div className="mb-4 inline-flex rounded-2xl bg-white/15 p-3 backdrop-blur">
                        <Icon className="w-6 h-6" />
                      </div>
                      <Badge variant="secondary" className="bg-white/15 text-white border-white/20">
                        {action.caption}
                      </Badge>
                      <h3 className="mt-4 text-xl font-semibold">{action.title}</h3>
                      <p className="mt-2 max-w-md text-sm text-white/85">{action.description}</p>
                    </div>
                    <div className="mt-6 flex items-center gap-2 text-sm font-medium text-white/90">
                      <span>Open module</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-sm border-slate-200/80">
          <CardHeader>
            <CardTitle className="text-slate-900">Operational queue</CardTitle>
            <CardDescription>High priority items that require admin review.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {alerts.map((item) => (
              <div key={item.title} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-slate-900">{item.title}</h4>
                    <p className="mt-1 text-sm text-slate-600">{item.detail}</p>
                  </div>
                  <Badge variant={item.status === "Needs attention" ? "destructive" : "outline"}>
                    {item.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200/80">
          <CardHeader>
            <CardTitle className="text-slate-900">Policy snapshot</CardTitle>
            <CardDescription>Current shared settings in use.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Deposit refund ratio", value: "70%" },
              { label: "Payment grace window", value: "24h" },
              { label: "Account approval SLA", value: "2 days" },
              { label: "Service price review", value: "Monthly" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <span className="text-sm text-slate-600">{item.label}</span>
                <span className="font-semibold text-slate-900">{item.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
