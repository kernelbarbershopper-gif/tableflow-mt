import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { User, Mail, Phone, Calendar, Shield, MapPin, Star, Award, Settings, Edit, X, ChevronLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ProfilePageProps {
  userId?: string;
  onClose?: () => void;
}

export default function ProfilePage({ userId, onClose }: ProfilePageProps) {
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<UserProfile>>({});

  const targetUserId = userId || currentUser?.id;

  useEffect(() => {
    if (targetUserId) {
      fetchProfile();
    }
  }, [targetUserId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/profiles/${targetUserId}`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!targetUserId) return;
    try {
      const response = await fetch(`/api/profiles/${targetUserId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });
      if (response.ok) {
        const updated = await response.json();
        setProfile(updated);
        setEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const roleColors: Record<string, string> = {
    admin: 'bg-red-100 text-red- text-red-800 border-red-200',
    manager: 'bg-blue-100 text-blue-800 border-blue-200',
    staff: 'bg-green-100 text-green-800 border-green-200',
    customer: 'bg-amber-100 text-amber-800 border-amber-200',
  };

  const roleLabels: Record<string, string> = {
    admin: 'Administrador',
    manager: 'Gerente',
    staff: 'Funcionário',
    customer: 'Cliente',
  };

  const loyaltyColors: Record<string, string> = {
    Bronze: 'bg-amber-100 text-amber-800',
    Silver: 'bg-slate-100 text-slate-800',
    Gold: 'bg-yellow-100 text-yellow-800',
    Platinium: 'bg-purple-100 text-purple-800',
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-900/80 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-800 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="fixed inset-0 bg-slate-900/80 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 text-center max-w-md">
          <User className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h2 className="font-bold text-xl text-slate-800 mb-2">Perfil não encontrado</h2>
          <p className="text-slate-500 mb-6">O usuário solicitado não existe ou foi removido.</p>
          <button onClick={onClose} className="px-6 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl font-medium">
            Fechar
          </button>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === profile.id;
  const isAdmin = currentUser?.user_metadata?.role === 'admin' || profile.role === 'admin';

  return (
    <div className="fixed inset-0 bg-slate-900/80 z-50 overflow-y-auto">
      <div className="min-h-screen flex flex-col">
        <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onClose && (
              <button onClick={onClose} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 hover:text-white transition">
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            <div>
              <h1 className="font-bold text-xl text-white">Perfil do Usuário</h1>
              <p className="text-xs text-slate-400">Visualize e gerencie informações do perfil</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isOwnProfile && !editing && (
              <button onClick={() => { setEditData({ full_name: profile.full_name, phone: profile.phone }); setEditing(true); }} className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl font-medium text-sm flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Editar
              </button>
            )}
            {isOwnProfile && editing && (
              <>
                <button onClick={handleSave} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium text-sm flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Salvar
                </button>
                <button onClick={() => { setEditing(false); setEditData({}); }} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-xl font-medium text-sm flex items-center gap-2">
                  <X className="h-4 w-4" />
                  Cancelar
                </button>
              </>
            )}
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="max-w-3xl mx-auto">
            <div className="bg-slate-800/50 rounded-3xl border border-slate-700 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-900/50 to-slate-900/50 p-8 border-b border-slate-700">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="relative">
                    <div className="w-28 h-28 rounded-full bg-amber-800/20 flex items-center justify-center border-4 border-amber-800/30">
                      <span className="text-amber-500 font-bold text-4xl">
                        {profile.full_name?.[0]?.toUpperCase() || profile.email[0].toUpperCase()}
                      </span>
                    </div>
                    {profile.role === 'admin' && (
                      <div className="absolute -bottom-2 -right-2">
                        <Shield className="h-6 w-6 text-red-400 bg-white rounded-full p-1" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                      <h2 className="font-bold text-2xl text-white">
                        {editing ? (
                          <input
                            type="text"
                            value={editData.full_name || profile.full_name || ''}
                            onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
                            className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-1 text-white font-bold text-2xl w-auto focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                        ) : (
                          profile.full_name || 'Sem nome'
                        )}
                      </h2>
                    </div>
                    <p className="text-amber-300 mb-2">{profile.email}</p>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${roleColors[profile.role]}`}>
                        {roleLabels[profile.role]}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-900/50 rounded-2xl border border-slate-700 p-4">
                    <h3 className="font-medium text-slate-400 text-xs uppercase tracking-wide mb-3 flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Contato
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-slate-500">Email</p>
                        <p className="font-medium text-white">{profile.email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Telefone</p>
                        {editing ? (
                          <input
                            type="tel"
                            value={editData.phone || profile.phone || ''}
                            onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                            placeholder="(406) 555-0000"
                          />
                        ) : (
                          <p className="font-medium text-white">{profile.phone || 'Não informado'}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900/50 rounded-2xl border border-slate-700 p-4">
                    <h3 className="font-medium text-slate-400 text-xs uppercase tracking-wide mb-3 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Conta
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-slate-500">Membro desde</p>
                        <p className="font-medium text-white">{new Date(profile.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Última atualização</p>
                        <p className="font-medium text-white">{new Date(profile.updated_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">ID do usuário</p>
                        <p className="font-mono text-xs text-slate-400">{profile.id}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {isAdmin && (
                  <div className="bg-red-900/20 border border-red-800/30 rounded-2xl p-4">
                    <h3 className="font-medium text-red-300 text-xs uppercase tracking-wide mb-3 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Ações Administrativas
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <button className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium">Resetar Senha</button>
                      <button className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-medium">Alterar Perfil</button>
                      <button className="px-3 py-1.5 bg-slate-600 hover:bg-slate-500 text-white rounded-lg text-xs font-medium">Ver Logs</button>
                    </div>
                  </div>
                )}

                <div className="border-t border-slate-700 pt-6">
                  <h3 className="font-medium text-slate-300 text-xs uppercase tracking-wide mb-4 flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Fidelidade & Atividade
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-900/50 rounded-2xl border border-slate-700 p-4 text-center">
                      <Star className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                      <p className="text-xs text-slate-400">Pontos</p>
                      <p className="font-bold text-2xl text-white">0</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-2xl border border-slate-700 p-4 text-center">
                      <Award className="h-8 w-8 mx-auto mb-2" style={{ color: loyaltyColors['Bronze']?.replace('bg-', 'text-').replace('100', '500') }} />
                      <p className="text-xs text-slate-400">Nível</p>
                      <p className="font-bold text-xl text-white">Bronze</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-2xl border border-slate-700 p-4 text-center">
                      <MapPin className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                      <p className="text-xs text-slate-400">Visitas</p>
                      <p className="font-bold text-2xl text-white">0</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}