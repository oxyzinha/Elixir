import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import Navbar from '@/components/layout/Navbar';
import Header from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Mail, Briefcase, Calendar } from 'lucide-react';
import { apiFetch } from '@/services/api';


const Profile = () => {
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: '', email: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiFetch('/api/me')
      .then((u) => {
        setUser(u);
        setForm({ name: u.name || '', email: u.email || '' });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleEditProfile = () => {
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
    setForm({ name: user?.name || '', email: user?.email || '' });
  };

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await apiFetch('/api/me', {
        method: 'PUT',
        body: JSON.stringify(form),
        headers: { 'Content-Type': 'application/json' },
      });
      setUser(updated);
      setEditMode(false);
      toast({
        title: 'Perfil atualizado!',
        description: 'Seus dados foram salvos com sucesso.',
        duration: 2000,
      });
    } catch (err) {
      toast({
        title: 'Erro ao salvar',
        description: err.message,
        duration: 2500,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>O Meu Perfil - Cadence</title>
        <meta name="description" content="Página de perfil do utilizador na plataforma Cadence." />
      </Helmet>
      <div className="flex min-h-screen">
        <Navbar />
        <div className="flex-1 ml-64">
          <Header />
          <main className="pt-16 p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl mx-auto"
            >
              <h1 className="text-3xl font-bold mb-8" style={{ color: 'var(--text-light-primary)' }}>
                O Meu Perfil
              </h1>
              <Card>
                <CardContent className="pt-6 flex flex-col items-center">
                  {loading && <span>Carregando...</span>}
                  {error && <span className="text-red-500">Erro: {error}</span>}
                  {user && (
                    <>
                      {!editMode ? (
                        <>
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 20 }}
                          >
                            <Avatar className="h-32 w-32 border-4" style={{ borderColor: 'var(--color-primary)' }}>
                              <AvatarImage src={user.avatar_url || "/placeholder-avatar.jpg"} alt={user.name || "Avatar"} />
                              <AvatarFallback>{user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}</AvatarFallback>
                            </Avatar>
                          </motion.div>
                          <h2 className="text-3xl font-bold mt-6" style={{ color: 'var(--text-light-primary)' }}>
                            {user.name || 'Usuário'}
                          </h2>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="w-3 h-3 rounded-full status-online"></div>
                            <span className="text-sm font-medium" style={{ color: 'var(--text-light-primary)' }}>
                              Online
                            </span>
                          </div>
                          <div className="w-full mt-8 space-y-4 text-left">
                            <div className="flex items-center gap-4 p-3 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                              <Mail size={20} style={{ color: 'var(--text-light-secondary)' }} />
                              <span style={{ color: 'var(--text-light-primary)' }}>{user.email || 'email@cadence.com'}</span>
                            </div>
                            <div className="flex items-center gap-4 p-3 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                              <Briefcase size={20} style={{ color: 'var(--text-light-secondary)' }} />
                              <span style={{ color: 'var(--text-light-primary)' }}>{user.role || 'Cargo não informado'}</span>
                            </div>
                            <div className="flex items-center gap-4 p-3 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                              <Calendar size={20} style={{ color: 'var(--text-light-secondary)' }} />
                              <span style={{ color: 'var(--text-light-primary)' }}>Membro desde: {user.member_since || 'Data desconhecida'}</span>
                            </div>
                          </div>
                          <Button
                            onClick={handleEditProfile}
                            className="w-full mt-8 btn-primary"
                          >
                            Editar Perfil
                          </Button>
                        </>
                      ) : (
                        <form onSubmit={handleSave} className="w-full max-w-md mx-auto mt-4 space-y-6">
                          <div>
                            <label className="block mb-1 font-medium">Nome</label>
                            <input
                              type="text"
                              name="name"
                              value={form.name}
                              onChange={handleChange}
                              className="w-full p-2 border rounded"
                              required
                            />
                          </div>
                          <div>
                            <label className="block mb-1 font-medium">Email</label>
                            <input
                              type="email"
                              name="email"
                              value={form.email}
                              onChange={handleChange}
                              className="w-full p-2 border rounded"
                              required
                            />
                          </div>
                          <div className="flex gap-4 mt-6">
                            <Button type="button" onClick={handleCancel} className="flex-1" variant="secondary">Cancelar</Button>
                            <Button type="submit" className="flex-1 btn-primary" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
                          </div>
                        </form>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </main>
        </div>
      </div>
    </>
  );
}

export default Profile;
