import React, { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthPage } from '@/components/AuthPage';
import { motion } from 'framer-motion';
import { Compass, Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center bg-slate-900"
      >
        <div className="flex flex-col items-center gap-4 text-white">
          <div className="relative w-16 h-16">
            <Compass className="w-full h-full text-amber-500 animate-spin" />
            <div className="absolute inset-0 border-4 border-amber-500/30 rounded-full animate-ping" />
          </div>
          <p className="text-slate-400">Carregando TableFlow MT...</p>
        </div>
      </motion.div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return <>{children}</>;
}