import { Outlet, Link, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  Home as HomeIcon,
  BookOpen as BookIcon,
  Heart as HeartIcon,
  ShoppingCart as CartIcon,
  Settings as SettingsIcon,
  Search as SearchIcon,
  Bell as BellIcon,
  Mail as MailIcon,
  LogOut as LogOutIcon,
  X as XIcon,
  Menu as MenuIcon
} from "lucide-react";
import { useAuth } from "../context/auth";
import userImg from "../assets/faculty/teacher5.jpg";

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: "Dashboard", path: "/student", icon: HomeIcon },
    { name: "Browse Courses", path: "/courses", icon: BookIcon },
    { name: "Cart", path: "/student/cart", icon: CartIcon },
    { name: "Wishlist", path: "/student/wishlist", icon: HeartIcon },
    { name: "Settings", path: "/student/settings", icon: SettingsIcon },
  ];

  return (
    <>
      <div className="flex h-screen bg-gray-50 overflow-hidden font-sans text-gray-900">
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}
        {/* Left Sidebar */}
        <aside
          className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
        >
          {/* Logo Area */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#0c3c2e]/90 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                L
              </div>
              <span className="text-xl font-bold tracking-tight">
                Learnable
              </span>
            </div>
            {/* Close Button for Mobile */}
            <button
              className="md:hidden text-gray-500 hover:text-gray-700"
              onClick={() => setIsSidebarOpen(false)}
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-3">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                const Icon = link.icon;
                return (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-[#0c3c2e]/10 text-[#0c3c2e]"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${isActive ? "text-[#0c3c2e]" : "text-gray-400"}`}
                      />
                      {link.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* Main Content Area (Header + Page Content) */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* 2. Top Header */}
          <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-8 flex-shrink-0 z-10 gap-4">
            {/* Mobile Hamburger */}
            <button
              className="md:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-50 rounded-lg"
              onClick={() => setIsSidebarOpen(true)}
            >
              <MenuIcon className="w-6 h-6" />
            </button>
            {/* Search Bar */}
            <div className="max-w-md w-full relative hidden sm:block">
              <SearchIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search your courses..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#0c3c2e]/20 focus:border-[#0c3c2e] transition-all"
              />
            </div>

            {/* Right side icons & profile */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <button className="relative p-2 text-gray-500 hover:bg-gray-50 rounded-full transition-colors">
                  <MailIcon className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                </button>
                <button className="relative p-2 text-gray-500 hover:bg-gray-50 rounded-full transition-colors">
                  <BellIcon className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                </button>
              </div>

              <div className="h-8 w-px bg-gray-200"></div>

              <div className="flex items-center gap-3 cursor-pointer">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-gray-900 leading-none">
                    {user?.name || "Student"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Student</p>
                </div>
                <img
                  src={userImg}
                  alt="User Profile"
                  className="w-9 h-9 rounded-full object-cover border border-gray-200"
                />
              </div>
              <button
                onClick={logout}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-bold text-sm transition-colors"
              >
                <LogOutIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </header>

          {/* 3. Page Content Area (where the dashboard routes inject their content) */}
          <main className="flex-1 overflow-y-auto bg-[#f8f9fa] p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
}
