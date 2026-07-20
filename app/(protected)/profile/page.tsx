"use client";

import ProviderProfilePage from "@/components/dashboard/pages/ProfilePage";
import ClientProfilePage from "@/components/dashboard/pages/ClientProfilePage";
import { useAuth } from "@/lib/hooks";

export default function Profile() {
  // Route based ONLY on the authenticated user's own userType from auth state.
  // Never rely on a fetched profile's userType — the profile fetch can return
  // stale or wrong data if the uid in Redux is incorrect.
  const { user, isDiva, isHunk, isClient } = useAuth();

  if (isClient || user?.userType === "client") {
    return <ClientProfilePage />;
  }

  if (isDiva || isHunk || user?.userType === "diva" || user?.userType === "hunk") {
    return <ProviderProfilePage />;
  }

  // Fallback: show client page (safer default — provider page needs provider profile)
  return <ClientProfilePage />;
}
