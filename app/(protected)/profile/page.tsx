"use client";

import ProviderProfilePage from "@/components/dashboard/pages/ProfilePage";
import ClientProfilePage from "@/components/dashboard/pages/ClientProfilePage";
import { useAuth, useEnrichedProfile } from "@/lib/hooks";

export default function Profile() {
  const { user, isDiva, isHunk, isClient } = useAuth();
  const { profile } = useEnrichedProfile(user?.id || null);

  const userType = profile?.user?.userType || user?.userType;

  if (isClient || userType === "client") {
    return <ClientProfilePage />;
  }

  if (isDiva || isHunk || userType === "diva" || userType === "hunk") {
    return <ProviderProfilePage />;
  }

  return <ClientProfilePage />;
}
