"use client";

import { 
  Home, FileText, CreditCard, BarChart3, MessageCircle, Calendar, HelpCircle,
  ChevronLeft, ChevronRight, LogOut, User, Settings, Shield
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  activePage: string;
  onPageChange: (page: string) => void;
  onLogout: () => void;
}

const sidebarItems = [
  { id: 'overview', label: 'Home', icon: Home, href: '/dashboard' },
  { id: 'chat', label: 'Chat', icon: MessageCircle, href: '/chat' },
//   { id: 'profile', label: 'Profile', icon: User, href: '/profile' },
//   { id: 'documents', label: 'Documents', icon: FileText, href: '/documents' },
//   { id: 'verification', label: 'Verification', icon: Shield, href: '/verification' },
//   { id: 'billing', label: 'Billing', icon: CreditCard, href: '/billing' },
//   { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/analytics' },
//   { id: 'messages', label: 'Messages', icon: MessageCircle, href: '/chat' },
//   { id: 'calendar', label: 'Calendar', icon: Calendar, href: '/calendar' },
//   { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
//   { id: 'help', label: 'Help & Support', icon: HelpCircle, href: '/help' },
];

export default function Sidebar({ isOpen, onToggle, activePage, onPageChange, onLogout }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  return (
    <div className={`${isOpen ? 'w-[280px]' : 'w-[80px]'} transition-all duration-300 bg-[#2A243E] backdrop-blur-md  flex flex-col mx-auto `}>
      {/* Sidebar Header */}
      <div className="pt-[56px] px-[80px] pb-[80px] ">
        <div className="flex items-center justify-between">
          {isOpen && (
            <div className="flex items-center gap-3">
             
              <span className="text-[#FA266D] text-[28px] font-bold font-urbanist ">Aphrodite</span>
            </div>
          )}
          <button
            onClick={onToggle}
            className="text-white/60 hover:text-white p-1 rounded transition-colors"
          >
            {isOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
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
                className={`w-full h-[58px] flex items-center  transition-all duration-200 font-urbanist ${
                  isActive
                    ? ' text-[#FA266D] '
                    : 'text-[#999999] text-[16px] hover:text-white'
                }`}
                style={{
                  paddingLeft: '40px',
                  paddingRight: isOpen ? '16px' : '40px'
                }}
              >
                <Icon className="h-[24px] w-[24px] flex-shrink-0" />
                {isOpen && <span className="text-sm font-medium ml-3">{item.label}</span>}
              </button>
          );
        })}
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
