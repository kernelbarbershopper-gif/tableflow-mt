import React, { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Compass, Shield, Lock } from 'lucide-react';

interface AdminProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AdminProtectedRoute({ children, fallback }: AdminProtectedRouteProps) {
  const { user, loading, isAdmin } = useAuth();

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
          <p className="text-slate-400">Verificando permissões de administrador...</p>
        </div>
      </motion.div>
    );
  }

  if (!user) {
    return fallback || (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen flex items-center justify-center bg-slate-900 p-4"
      >
        <div className="bg-slate-800/50 rounded-3xl border border-slate-700 p-8 max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-900/30 rounded-full flex items-center justify-center">
            <Lock className="h-8 w-8 text-red-400" />
          </div>
          <h2 className="font-bold text-xl text-white mb-2">Acesso Restrito</h2>
          <p className="text-slate-400 mb-6">Você precisa fazer login como administrador para acessar esta área.</p>
          <div className="text-left space-y-2 text-sm text-slate-500">
            <p>Admin: michaelmarianodasilva81@gmail.com</p>
            <p>Senha: M@1dasilva</p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!isAdmin) {
    return fallback || (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen flex items-center justify-center bg-slate-900 p-4"
      >
        <div className="bg-slate-800/50 rounded-3xl border border-slate-700 p-8 max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-amber-900/30 rounded-full flex items-center justify-center">
            <Shield className="h-8 w-8 text-amber-400" />
          </div>
          <h2 className="font-bold text-xl text-white mb-2">Permissão Insuficiente</h2>
          <p className="text-slate-400 mb-6">Apenas administradores podem acessar esta funcionalidade.</p>
          <p className="text-sm text-slate-500">Seu perfil: Usuário comum</p>
        </div>
      </motion.div>
    );
  }

  return <>{children}</>;
}