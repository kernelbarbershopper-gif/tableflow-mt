import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { Users, Shield, Settings, BarChart3, LogOut, Edit, Trash2, Plus, Search, Filter, ChevronDown, ChevronUp, Mail, Phone, Calendar, Eye, Activity, Briefcase, User, Check, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AdminPanelProps {
  onClose?: () => void;
}

export default function AdminPanel({ onClose }: AdminPanelProps) {
  const { user, signOut } = useAuth();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'manager' | 'staff' | 'customer'>('all');
  const [sortField, setSortField] = useState<'created_at' | 'full_name' | 'email' | 'role'>('created_at');
  const [sortAsc, setSortAsc] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<UserProfile>>({});

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/profiles');
      if (response.ok) {
        const data = await response.json();
        setProfiles(data);
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: 'created_at' | 'full_name' | 'email' | 'role') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const filteredProfiles = profiles
    .filter(p => {
      const matchesSearch = p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || p.role === roleFilter;
      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      const aVal = a[sortField] || '';
      const bVal = b[sortField] || '';
      return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });

  const handleEdit = (profile: UserProfile) => {
    setEditingId(profile.id);
    setEditData({ role: profile.role, full_name: profile.full_name });
  };

  const handleSave = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/profiles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });
      if (response.ok) {
        setEditingId(null);
        fetchProfiles();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este usuário?')) return;
    try {
      const response = await fetch(`/api/admin/profiles/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchProfiles();
      }
    } catch (error) {
      console.error('Error deleting profile:', error);
    }
  };

  const handleCreateAdmin = async () => {
    const email = window.prompt('Email do novo admin:');
    if (!email) return;
    const password = window.prompt('Senha temporária:');
    if (!password) return;
    const name = window.prompt('Nome completo:');
    if (!name) return;

    try {
      const response = await fetch('/api/admin/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: name, role: 'admin' }),
      });
      if (response.ok) {
        fetchProfiles();
        alert('Admin criado com sucesso!');
      } else {
        const err = await response.json();
        alert('Erro: ' + (err.message || 'Falha ao criar admin'));
      }
    } catch (error) {
      console.error('Error creating admin:', error);
      alert('Erro ao criar admin');
    }
  };

  const roleColors: Record<string, string> = {
    admin: 'bg-red-100 text-red-800',
    manager: 'bg-blue-100 text-blue-800',
    staff: 'bg-green-100 text-green-800',
    customer: 'bg-amber-100 text-amber-800',
  };

  const roleLabels: Record<string, string> = {
    admin: 'Administrador',
    manager: 'Gerente',
    staff: 'Funcionário',
    customer: 'Cliente',
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-900/80 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-800 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando painel administrativo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/80 z-50 overflow-y-auto">
      <div className="min-h-screen flex">
        <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
          <div className="p-4 border-b border-slate-800">
            <h2 className="font-bold text-xl text-white flex items-center gap-2">
              <Shield className="h-6 w-6 text-amber-500" />
              Admin Panel
            </h2>
            <p className="text-xs text-slate-400 mt-1">TableFlow MT</p>
          </div>
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <button className="w-full text-left px-3 py-2 rounded-xl bg-amber-800 text-white text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Usuários
            </button>
            <button className="w-full text-left px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </button>
            <button className="w-full text-left px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white text-sm font-medium flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configurações
            </button>
          </nav>
          <div className="p-4 border-t border-slate-800">
            <button onClick={signOut} className="w-full px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium flex items-center justify-center gap-2">
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </div>
        </aside>

        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h1 className="font-bold text-2xl text-white">Gerenciamento de Usuários</h1>
                <p className="text-slate-400 text-sm mt-1">Visualize, edite e gerencie perfis de usuários</p>
              </div>
              <button onClick={handleCreateAdmin} className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl font-medium text-sm flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Novo Admin
              </button>
            </div>

            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-4 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nome ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-800"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="text-sm text-slate-300">Filtrar:</label>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value as any)}
                    className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-800"
                  >
                    <option value="all">Todos</option>
                    <option value="admin">Admin</option>
                    <option value="manager">Gerente</option>
                    <option value="staff">Funcionário</option>
                    <option value="customer">Cliente</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      {[
                        { key: 'full_name', label: 'Nome' },
                        { key: 'email', label: 'Email' },
                        { key: 'role', label: 'Perfil' },
                        { key: 'phone', label: 'Telefone' },
                        { key: 'created_at', label: 'Cadastro' },
                        { key: 'actions', label: '' },
                      ].map(col => (
                        <th
                          key={col.key}
                          className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400 cursor-pointer hover:text-amber-400"
                          onClick={() => col.key !== 'actions' && handleSort(col.key as any)}
                        >
                          <div className="flex items-center gap-1">
                            {col.label}
                            {sortField === col.key && (
                              <span>{sortAsc ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}</span>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {filteredProfiles.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                          Nenhum usuário encontrado
                        </td>
                      </tr>
                    ) : (
                      filteredProfiles.map(profile => (
                        <tr key={profile.id} className="hover:bg-slate-800/50 transition">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-amber-800/20 flex items-center justify-center">
                                <span className="text-amber-500 font-bold text-sm">
                                  {profile.full_name?.[0]?.toUpperCase() || profile.email[0].toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-white">{profile.full_name || 'Sem nome'}</p>
                                <p className="text-xs text-slate-400">ID: {profile.id.slice(0, 8)}...</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <a href={`mailto:${profile.email}`} className="text-amber-400 hover:underline flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {profile.email}
                            </a>
                          </td>
                          <td className="px-4 py-3">
                            {editingId === profile.id ? (
                              <select
                                value={editData.role}
                                onChange={(e) => setEditData({ ...editData, role: e.target.value as any })}
                                className="px-2 py-1 bg-slate-900 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
                              >
                                <option value="admin">Admin</option>
                                <option value="manager">Gerente</option>
                                <option value="staff">Funcionário</option>
                                <option value="customer">Cliente</option>
                              </select>
                            ) : (
                              <span className={`px-2 py-1 rounded-full text-xs font-bold ${roleColors[profile.role]}`}>
                                {roleLabels[profile.role]}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {profile.phone ? (
                              <a href={`tel:${profile.phone}`} className="text-slate-300 flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {profile.phone}
                              </a>
                            ) : (
                              <span className="text-slate-500">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-slate-300">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(profile.created_at).toLocaleDateString('pt-BR')}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {editingId === profile.id ? (
                                <>
                                  <button onClick={() => handleSave(profile.id)} className="p-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white transition">
                                    <Check className="h-4 w-4" />
                                  </button>
                                  <button onClick={() => { setEditingId(null); setEditData({}); }} className="p-2 bg-slate-600 hover:bg-slate-500 rounded-lg text-white transition">
                                    <X className="h-4 w-4" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button onClick={() => handleEdit(profile)} className="p-2 bg-amber-800 hover:bg-amber-900 rounded-lg text-white transition" title="Editar">
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <button onClick={() => handleDelete(profile.id)} className="p-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition" title="Excluir">
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: 'Total', value: profiles.length, color: 'text-white', icon: Users },
                { label: 'Admins', value: profiles.filter(p => p.role === 'admin').length, color: 'text-red-400', icon: Shield },
                { label: 'Gerentes', value: profiles.filter(p => p.role === 'manager').length, color: 'text-blue-400', icon: Briefcase },
                { label: 'Clientes', value: profiles.filter(p => p.role === 'customer').length, color: 'text-amber-400', icon: User },
              ].map(stat => (
                <div key={stat.label} className="bg-slate-800/50 rounded-2xl border border-slate-700 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wide">{stat.label}</p>
                      <p className="font-bold text-3xl ${stat.color}">{stat.value}</p>
                    </div>
                    <div className="p-3 bg-slate-900 rounded-xl">
                      <stat.icon className="h-6 w-6 ${stat.color}" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}