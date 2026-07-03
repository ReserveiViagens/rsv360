import React, { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../src/context/AuthContext';
import { canAccessAnfitriaoModule } from '../src/lib/anfitriao-auth';
import ProtectedRoute from './ProtectedRoute';

interface AnfitriaoRoleGuardProps {
  children: ReactNode;
}

/**
 * Exige login + papel anfitriao/corretor/admin/manager para /anfitriao/*
 */
export default function AnfitriaoRoleGuard({ children }: AnfitriaoRoleGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user && !canAccessAnfitriaoModule(user.role)) {
      router.replace('/dashboard');
    }
  }, [isLoading, isAuthenticated, user, router]);

  return (
    <ProtectedRoute>
      {!isLoading && user && !canAccessAnfitriaoModule(user.role) ? (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
          <p className="text-slate-600">Acesso restrito a parceiros (anfitrião/corretor) e staff.</p>
        </div>
      ) : (
        children
      )}
    </ProtectedRoute>
  );
}
