'use client';

import ProviderDashboardPage from "@/components/dashboard/pages/ProviderDashboardPage";
import ClientDashboardPage from "@/components/dashboard/pages/ClientDashboardPage";
import { useAuth, useEnrichedProfile } from "@/lib/hooks";

export default function Dashboard() {
  const { user, isDiva, isHunk, isClient } = useAuth();
  const { profile } = useEnrichedProfile(user?.id || null);

  const userType = profile?.user?.userType || user?.userType;

  if (isClient || userType === "client") {
    return <ClientDashboardPage />;
  }

  if (isDiva || isHunk || userType === "diva" || userType === "hunk") {
    return <ProviderDashboardPage />;
  }

  return <ClientDashboardPage />;
}
