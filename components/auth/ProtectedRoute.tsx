'use client';

import { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { ApiContext } from '@/lib/context/ApiContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  
  // Safely get the context
  const apiContext = useContext(ApiContext);
  
  // If context is not available, treat as unauthenticated
  const isAuthenticated = apiContext?.isAuthenticated ?? false;
  const isLoading = apiContext?.isLoading ?? false;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle case where ApiContext is not available
  useEffect(() => {
    if (!apiContext) {
      console.warn('ProtectedRoute: ApiContext not available, redirecting to user-type');
      router.push('/user-type');
    }
  }, [apiContext, router]);

  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated) {
      router.push('/user-type');
    }
  }, [mounted, isAuthenticated, isLoading, router]);

  // Prevent hydration mismatch by showing loading on server
  if (!mounted || isLoading) {
    return (
      <div suppressHydrationWarning className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}