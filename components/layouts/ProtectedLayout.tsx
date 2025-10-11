'use client';

import { ReactNode } from 'react';
import ProtectedRoute from '../auth/ProtectedRoute';

interface ProtectedLayoutProps {
  children: ReactNode;
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  );
}