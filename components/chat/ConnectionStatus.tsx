"use client";

import { useChatSocket } from "@/lib/hooks";
import { Wifi, WifiOff } from "lucide-react";

/**
 * Connection Status Indicator
 * Shows the current WebSocket connection status
 */
export function ConnectionStatus() {
  const { connected, reconnecting } = useChatSocket();

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
        connected
          ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
          : reconnecting
          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
          : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
      }`}
      title={
        connected
          ? "Connected - Real-time messaging active"
          : reconnecting
          ? "Reconnecting - Attempting to restore connection"
          : "Offline - Check your internet connection"
      }
    >
      {connected ? (
        <>
          <Wifi className="w-3 h-3" />
          <span>Connected</span>
        </>
      ) : reconnecting ? (
        <>
          <div className="w-3 h-3 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin" />
          <span>Reconnecting...</span>
        </>
      ) : (
        <>
          <WifiOff className="w-3 h-3" />
          <span>Offline</span>
        </>
      )}
    </div>
  );
}

/**
 * Minimal Connection Indicator (just a dot)
 */
export function ConnectionDot() {
  const { connected, reconnecting } = useChatSocket();

  return (
    <div
      className={`w-2 h-2 rounded-full ${
        connected 
          ? "bg-green-500 animate-pulse" 
          : reconnecting 
          ? "bg-yellow-500 animate-bounce" 
          : "bg-red-500"
      }`}
      title={connected ? "Connected" : reconnecting ? "Reconnecting" : "Offline"}
    />
  );
}
