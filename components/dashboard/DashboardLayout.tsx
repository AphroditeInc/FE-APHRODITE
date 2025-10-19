"use client";

import { useState } from "react";
import { 
  X, 
  Home, 
  Smile, 
  Play, 
  ShoppingCart, 
  MessageCircle, 
  Users, 
  Megaphone, 
  HelpCircle 
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";

interface DashboardLayoutProps {
  children: React.ReactNode;
  pageTitle: string;
}

export default function DashboardLayout({ children, pageTitle }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    // Clear any stored authentication data
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    // Redirect to home page
    router.push('/');
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex overflow-hidden">
      {/* Sidebar - Hidden on mobile */}
      <div className="hidden lg:block">
        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={toggleSidebar}
          activePage=""
          onPageChange={() => {}}
          onLogout={handleLogout}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <Header onMenuToggle={toggleMenu} />

        {/* Page Content */}
        <main className="flex-1 overflow-auto scrollbar-hide">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black/50" onClick={toggleMenu} />
          <div className="fixed left-0 top-0 bottom-0 w-64 sm:w-72 bg-[#2A243E] backdrop-blur-md flex flex-col">
            {/* Mobile Sidebar Header */}
            <div className="pt-4 sm:pt-6 px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-[#FA266D] text-xl sm:text-2xl font-bold font-urbanist">
                    Aphrodite
                  </span>
                </div>
                <button onClick={toggleMenu} className="text-white/60 hover:text-white p-1">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Mobile Sidebar Navigation */}
            <nav className="flex-1 px-4 sm:px-6">
              {[
                { id: "home", label: "Home", icon: Home, href: "/dashboard" },
                { id: "feeds", label: "Feeds", icon: Smile, href: "/feeds" },
                { id: "strip-room", label: "Strip Room", icon: Play, href: "/strip-room" },
                { id: "orders", label: "Orders", icon: ShoppingCart, href: "/orders" },
                { id: "chats", label: "Chats", icon: MessageCircle, href: "/chat" },
                { id: "connections", label: "Connections", icon: Users, href: "/connections" },
                { id: "advertisement", label: "Advertisement", icon: Megaphone, href: "/advertisement" },
                { id: "faq-help", label: "FAQs & Help", icon: HelpCircle, href: "/help" },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      router.push(item.href);
                      toggleMenu(); // Close mobile menu after navigation
                    }}
                    className={`w-full h-12 sm:h-14 flex items-center transition-all duration-200 font-urbanist px-3 sm:px-4 rounded-lg mb-1 ${
                      isActive
                        ? "text-[#FA266D] bg-white/10"
                        : "text-[#999999] hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                      <span className="text-sm sm:text-base font-medium">{item.label}</span>
                    </div>
                  </button>
                );
              })}

              {/* Complete Profile Setup */}
              <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-white/6 rounded-[20px] text-white">
                <p className="text-base sm:text-[18px] font-bold mb-2">
                  Complete Your Profile Setup Now!
                </p>
                <p className="text-xs sm:text-[14px] mb-3 sm:mb-4 text-white/60">
                  Finish setting up your account, add your services and pricing to
                  start getting clients.
                </p>
                <button
                  onClick={() => {
                    router.push("/profile");
                    toggleMenu();
                  }}
                  className="w-full flex items-center justify-center px-4 sm:px-[24px] py-2 sm:py-[10px] text-white bg-[#FA266D] rounded-[30px] sm:rounded-[40px] transition-all duration-200"
                >
                  <span className="text-sm sm:text-[16px] font-semibold">Go to Profile</span>
                </button>
              </div>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
