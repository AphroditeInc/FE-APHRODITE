"use client";

import {
  Home,
  FileText,
  CreditCard,
  BarChart3,
  MessageCircle,
  Calendar,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  Settings,
  Shield,
  Smile,
  Play,
  ShoppingCart,
  Users,
  Megaphone,
  Lock,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { selectUid } from "@/feature/authentication/authSlice";
import { useGetEnrichedProfileQuery } from "@/feature/profile/profileApiSlice";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  activePage: string;
  onPageChange: (page: string) => void;
  onLogout: () => void;
}

const sidebarItems = [
  { id: "home", label: "Home", icon: Home, href: "/dashboard" },
  { id: "feeds", label: "Feeds", icon: Smile, href: "/feeds" },
  { id: "strip-room", label: "Strip Room", icon: Play, href: "/strip-room" },
  { id: "orders", label: "Orders", icon: ShoppingCart, href: "/orders" },
  { id: "chats", label: "Chats", icon: MessageCircle, href: "/chat" },
  { id: "connections", label: "Connections", icon: Users, href: "/connections" },
  { id: "advertisement", label: "Advertisement", icon: Megaphone, href: "/advertisement" },
  { id: "faq-help", label: "FAQs & Help", icon: HelpCircle, href: "/help" },
];

export default function Sidebar({
  isOpen,
  onToggle,
  activePage,
  onPageChange,
  onLogout,
}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const uid = useSelector(selectUid);
  const { data: profileData } = useGetEnrichedProfileQuery(uid!, { skip: !uid });
  const profile = (profileData as any)?.data || (profileData as any);

  const isProfileComplete = !!(
    profile?.bio &&
    profile?.occupation &&
    profile?.education &&
    profile?.gender &&
    profile?.ethnicity &&
    profile?.nationality &&
    profile?.bodyBuild &&
    profile?.looks &&
    Array.isArray(profile?.services) && profile.services.length > 0 &&
    Array.isArray(profile?.media) && profile.media.length > 0 &&
    profile?.hasVideoProof &&
    profile?.issuedIdUrl
  );

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  return (
    <div
      className={`${
        isOpen ? "w-[280px]" : "w-[60px] sm:w-[80px]"
      } transition-all duration-300 bg-[#2A243E] backdrop-blur-md flex flex-col h-full`}
    >
      {/* Sidebar Header */}
      <div className="pt-4 sm:pt-6 px-3 sm:px-6 pb-4 sm:pb-6">
        <div className="flex items-center justify-between">
          {isOpen && (
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-[#FA266D] text-xl sm:text-2xl lg:text-[28px] font-bold font-urbanist">
                Aphrodite
              </span>
            </div>
          )}
          <button
            onClick={onToggle}
            className="text-white/60 hover:text-white p-1 rounded transition-colors"
          >
            {isOpen ? (
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            ) : (
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <nav className="flex-1">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.href)}
              className={`w-full h-[48px] sm:h-[58px] flex items-center transition-all duration-200 font-urbanist px-3 sm:px-6 ${
                isActive
                  ? "text-[#FA266D]"
                  : "text-[#999999] hover:text-white hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-2 sm:gap-4">
                <Icon className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
                {isOpen && (
                  <span className="text-sm sm:text-base font-medium truncate">{item.label}</span>
                )}
              </div>
            </button>
          );
        })}

        {/* complete ur profile setup — hidden once all steps are done */}
        {!isProfileComplete && (
          <div className="px-3 sm:px-6 pb-4 sm:pb-6">
            {isOpen && (
              <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-white/6 rounded-[20px] sm:rounded-[24px] text-white">
                <p className="text-base sm:text-[18px] font-bold mb-2">
                  Complete Your Profile Setup Now!
                </p>
                <p className="text-xs sm:text-[14px] mb-3 sm:mb-4 text-white/60">
                  Finish setting up your account, add your services and pricing to
                  start getting clients.
                </p>
                <button
                  onClick={() => handleNavigation("/profile")}
                  className="w-full flex items-center justify-center px-4 sm:px-[24px] py-2 sm:py-[10px] text-white bg-[#FA266D] rounded-[30px] sm:rounded-[40px] transition-all duration-200 cursor-pointer"
                >
                  <span className="text-sm sm:text-[16px] font-semibold">Go to Profile</span>
                </button>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Sidebar Footer */}
      {/* <div className="p-4 border-t border-white/10">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {isOpen && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div> */}
    </div>
  );
}
