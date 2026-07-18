import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { ChatProvider } from "@/lib/contexts/ChatContext";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <ChatProvider>
        {children}
      </ChatProvider>
    </ProtectedRoute>
  );
}