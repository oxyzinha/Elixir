// src/pages/Profile.jsx
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
import { apiFetch } from '@/services/api'; // Certifique-se que este import está correto

const Profile = () => {
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: '', member_since: '' }); // Adicionei role e member_since ao form para edição, se necessário
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Busca os dados do utilizador
    const fetchUser = async () => {
      try {
        const u = await apiFetch('/api/me');
        setUser(u);
        setForm({
          name: u.name || '',
          email: u.email || '',
          role: u.role || '', // Preenche o cargo
          member_since: u.member_since || '', // Preenche a data de membro
        });
      } catch (err) {
        setError(err.message);
        toast({
          title: "Erro ao carregar perfil",
          description: err.message,
          duration: 3000,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleEditProfile = () => {
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
    // Reinicia o formulário com os dados atuais do utilizador
    setForm({
      name: user?.name || '',
      email: user?.email || '',
      role: user?.role || '',
      member_since: user?.member_since || '',
    });
  };

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Envia apenas os campos que podem ser editados
      const updated = await apiFetch('/api/me', {
        method: 'PUT',
        body: JSON.stringify({ name: form.name, email: form.email }), // Supondo que apenas nome e email são editáveis
        headers: { 'Content-Type': 'application/json' },
      });
      setUser(updated);
      setEditMode(false);
      toast({
        title: 'Perfil atualizado!',
        description: 'Os seus dados foram salvos com sucesso.',
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

  if (loading) {
    return (
      <div className="flex min-h-screen bg-bg-light-primary items-center justify-center">
        <span>Carregando perfil...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-bg-light-primary items-center justify-center text-red-500">
        <span>Erro ao carregar perfil: {error}</span>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>O Meu Perfil - Cadence</title>
        <meta name="description" content="Página de perfil do utilizador na plataforma Cadence." />
      </Helmet>

      {/* Alterado o fundo principal para usar a cor da sua variável */}
      <div className="flex min-h-screen bg-bg-light-primary">
        <Navbar />
        
        <div className="flex-1 ml-64">
          <Header />
          
          <main className="pt-24 p-8"> {/* Ajustei o padding-top para corresponder ao Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl mx-auto"
            >
              {/* Alterado o estilo inline para uma classe Tailwind mapeada */}
              <h1 className="text-3xl font-bold mb-8 text-text-light-primary">
                O Meu Perfil
              </h1>

              {/* Adicionada a classe 'card' para usar os estilos definidos no index.css */}
              <Card className="card"> 
                <CardContent className="pt-6 flex flex-col items-center">
                  {user && ( // Condicional para mostrar o perfil apenas se houver user
                    <>
                      {!editMode ? (
                        <>
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 20 }}
                          >
                            {/* A classe 'avatar' já está no index.css, mas a borda está sobrescrita com --color-primary, mantida assim */}
                            <Avatar className="h-32 w-32 border-4" style={{ borderColor: 'var(--color-primary)' }}>
                              <AvatarImage src={user.avatar_url || "/placeholder-avatar.jpg"} alt={user.name || "Avatar"} />
                              <AvatarFallback>{user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}</AvatarFallback>
                            </Avatar>
                          </motion.div>

                          {/* Alterado o estilo inline para uma classe Tailwind mapeada */}
                          <h2 className="text-3xl font-bold mt-6 text-text-light-primary">
                            {user.name || 'Nome do Utilizador'}
                          </h2>

                          <div className="flex items-center gap-2 mt-2">
                            {/* A classe 'status-online' já puxa a cor correta do index.css */}
                            <div className="w-3 h-3 rounded-full status-online"></div>
                            {/* O estilo inline aqui já usa a variável, mantido por clareza */}
                            <span className="text-sm font-medium" style={{ color: 'var(--color-accent-green)' }}>
                              Online
                            </span>
                          </div>
                          
                          <div className="w-full mt-8 space-y-4 text-left">
                            <div 
                              className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 border border-border-color" 
                            >
                              {/* Alterado estilo inline para uma classe Tailwind mapeada */}
                              <Mail size={20} className="text-text-light-secondary" />
                              {/* Alterado estilo inline para uma classe Tailwind mapeada */}
                              <span className="text-text-light-primary">{user.email || 'email@cadence.com'}</span>
                            </div>
                            <div 
                              className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 border border-border-color" 
                            >
                              {/* Alterado estilo inline para uma classe Tailwind mapeada */}
                              <Briefcase size={20} className="text-text-light-secondary" />
                              {/* Alterado estilo inline para uma classe Tailwind mapeada */}
                              <span className="text-text-light-primary">{user.role || 'Cargo não informado'}</span>
                            </div>
                            <div 
                              className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 border border-border-color" 
                            >
                              {/* Alterado estilo inline para uma classe Tailwind mapeada */}
                              <Calendar size={20} className="text-text-light-secondary" />
                              {/* Alterado estilo inline para uma classe Tailwind mapeada */}
                              <span className="text-text-light-primary">Membro desde: {user.member_since || 'Data desconhecida'}</span>
                            </div>
                          </div>

                          <Button
                            onClick={handleEditProfile}
                            className="w-full mt-8 btn-primary" // Já usa btn-primary
                          >
                            Editar Perfil
                          </Button>
                        </>
                      ) : (
                        <form onSubmit={handleSave} className="w-full max-w-md mx-auto mt-4 space-y-6">
                          <div>
                            <label className="block mb-1 font-medium text-text-light-secondary">Nome</label> {/* Adicionada classe de texto */}
                            <input
                              type="text"
                              name="name"
                              value={form.name}
                              onChange={handleChange}
                              className="w-full p-2 border rounded border-border-color bg-bg-light-secondary text-text-light-primary focus:ring-1 focus:ring-primary focus:outline-none" // Adicionadas classes Tailwind para input
                              required
                            />
                          </div>
                          <div>
                            <label className="block mb-1 font-medium text-text-light-secondary">Email</label> {/* Adicionada classe de texto */}
                            <input
                              type="email"
                              name="email"
                              value={form.email}
                              onChange={handleChange}
                              className="w-full p-2 border rounded border-border-color bg-bg-light-secondary text-text-light-primary focus:ring-1 focus:ring-primary focus:outline-none" // Adicionadas classes Tailwind para input
                              required
                            />
                          </div>
                          {/* Você pode adicionar campos de edição para role e member_since aqui, se forem editáveis no backend */}
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
};

export default Profile;