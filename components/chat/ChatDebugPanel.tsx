"use client";

import { useEffect, useState } from "react";
import { useChatSocket } from "@/lib/hooks";
import { useAuth } from "@/lib/hooks";

/**
 * Chat Debug Panel
 * Displays real-time WebSocket connection info and events
 * Use this component during development to monitor chat system
 */
export function ChatDebugPanel() {
  const { socket, connected } = useChatSocket();
  const { isAuthenticated, accessToken, userId } = useAuth();
  const [events, setEvents] = useState<Array<{ time: string; event: string; data: unknown }>>([]);

  useEffect(() => {
    if (!socket) return;

    const logEvent = (event: string, data: unknown) => {
      setEvents((prev) => [
        { time: new Date().toLocaleTimeString(), event, data },
        ...prev.slice(0, 19), // Keep last 20 events
      ]);
    };

    // Listen to all events for debugging
    socket.onAny((event, ...args) => {
      logEvent(event, args);
    });

    return () => {
      socket.offAny();
    };
  }, [socket]);

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-gray-900 text-white rounded-lg shadow-2xl border border-gray-700 max-h-96 flex flex-col z-50">
      {/* Header */}
      <div className="p-3 border-b border-gray-700 bg-gray-800 rounded-t-lg">
        <h3 className="font-semibold text-sm">Chat Debug Panel</h3>
        <div className="text-xs text-gray-400 mt-1 space-y-1">
          <div className="flex justify-between">
            <span>Status:</span>
            <span className={connected ? "text-green-400" : "text-yellow-400"}>
              {connected ? "Connected ✓" : "Disconnected ✗"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Socket ID:</span>
            <span className="text-gray-300 truncate ml-2" title={socket?.id}>
              {socket?.id || "N/A"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Auth:</span>
            <span className={isAuthenticated ? "text-green-400" : "text-red-400"}>
              {isAuthenticated ? "Yes ✓" : "No ✗"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>User ID:</span>
            <span className="text-gray-300 truncate ml-2" title={userId || undefined}>
              {userId || "N/A"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Token:</span>
            <span className="text-gray-300 truncate ml-2" title={accessToken || undefined}>
              {accessToken ? `${accessToken.slice(0, 10)}...` : "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* Events Log */}
      <div className="flex-1 overflow-y-auto p-2 text-xs space-y-1 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
        <div className="font-semibold text-gray-400 mb-2">Recent Events:</div>
        {events.length === 0 ? (
          <div className="text-gray-500 italic">No events yet...</div>
        ) : (
          events.map((event, i) => (
            <div key={i} className="bg-gray-800 rounded p-2 border border-gray-700">
              <div className="flex justify-between mb-1">
                <span className="text-blue-400 font-mono">{event.event}</span>
                <span className="text-gray-500">{event.time}</span>
              </div>
              <pre className="text-gray-300 overflow-x-auto whitespace-pre-wrap break-all">
                {JSON.stringify(event.data, null, 2).slice(0, 200)}
                {JSON.stringify(event.data).length > 200 ? "..." : ""}
              </pre>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-gray-700 bg-gray-800 rounded-b-lg text-xs text-center text-gray-400">
        Real-time event monitoring
      </div>
    </div>
  );
}
