import { BookOpen, CheckCircle, Clock, Trophy } from "lucide-react";

export default function Dashboard() {
  const stats = [
    {
      title: "Enrolled Courses",
      value: "8",
      change: "+12% from last month",
      icon: BookOpen,
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600",
    },
    {
      title: "Completed",
      value: "4",
      change: "+8% from last month",
      icon: CheckCircle,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      title: "In Progress",
      value: "4",
      change: "On track",
      icon: Clock,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    },
    {
      title: "Certificates",
      value: "12",
      change: "+20% from last month",
      icon: Trophy,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, Sarah! 👋</h1>
        <p className="text-gray-500 mt-2">Here's what's happening with your learning today</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</h3>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.iconBg}`}>
                  <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
              </div>
              <p className="text-xs font-medium text-emerald-500 mt-4">{stat.change}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
