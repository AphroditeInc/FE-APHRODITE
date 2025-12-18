"use client";

import { useChatSocket } from "@/lib/hooks";
import { Wifi, WifiOff } from "lucide-react";

/**
 * Connection Status Indicator
 * Shows the current WebSocket connection status
 */
export function ConnectionStatus() {
  const { connected } = useChatSocket();

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
        connected
          ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
      }`}
      title={
        connected
          ? "Connected - Real-time messaging active"
          : "Connecting - Messages will be sent via fallback"
      }
    >
      {connected ? (
        <>
          <Wifi className="w-3 h-3" />
          <span>Connected</span>
        </>
      ) : (
        <>
          <WifiOff className="w-3 h-3" />
          <span>Connecting...</span>
        </>
      )}
    </div>
  );
}

/**
 * Minimal Connection Indicator (just a dot)
 */
export function ConnectionDot() {
  const { connected } = useChatSocket();

  return (
    <div
      className={`w-2 h-2 rounded-full ${
        connected ? "bg-green-500 animate-pulse" : "bg-yellow-500"
      }`}
      title={connected ? "Connected" : "Connecting..."}
    />
  );
}
