"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";

interface DashboardLayoutProps {
  children: React.ReactNode;
  pageTitle: string;
}

export default function DashboardLayout({ children, pageTitle }: DashboardLayoutProps) {
  const router = useRouter();
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
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
        activePage=""
        onPageChange={() => {}}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 overflow-auto scrollbar-hide">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black/50" onClick={toggleMenu} />
          <div className="fixed left-0 top-0 bottom-0 w-64 bg-[#2A243E] backdrop-blur-md p-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-[#FA266D] text-[28px] font-bold font-urbanist">Aphrodite</span>
              </div>
              <button onClick={toggleMenu} className="text-white/60 hover:text-white p-1">
                <X className="h-5 w-5" />
              </button>
            </div>
            <Sidebar
              isOpen={true}
              onToggle={() => {}}
              activePage=""
              onPageChange={() => {}}
              onLogout={handleLogout}
            />
          </div>
        </div>
      )}
    </div>
  );
}
