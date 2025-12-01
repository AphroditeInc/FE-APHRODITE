import { Suspense } from "react";
import MessagesPage from "@/components/dashboard/pages/MessagesPage";

function ChatContent() {
  return <MessagesPage />;
}

export default function Chat() {
  return (
    <Suspense fallback={
      <div className="h-full bg-[#1F1B2C] flex items-center justify-center">
        <div className="text-white text-xl">Loading chat...</div>
      </div>
    }>
      <ChatContent />
    </Suspense>
  );
}
