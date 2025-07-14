import React, { useState } from 'react';
import { loginUser } from '@/lib/authContext';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Mail, Lock, User } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loginError, setLoginError] = useState(null);

  const handleAuthAction = async (e) => {
    e.preventDefault();
    setLoginError(null);
    if (isLogin) {
      // Login JWT
      const form = e.target;
      const email = form.email.value;
      const password = form.password.value;
      try {
        await loginUser(email, password);
        toast({
          title: 'Login realizado com sucesso!',
          description: 'Redirecionando para o dashboard...',
          duration: 1500,
        });
        setTimeout(() => navigate('/dashboard'), 1500);
      } catch (err) {
        setLoginError('Usuário ou senha inválidos');
        toast({
          title: 'Erro ao fazer login',
          description: 'Usuário ou senha inválidos',
          duration: 2500,
          variant: 'destructive',
        });
      }
    } else {
      // Registro (mantém comportamento antigo)
      toast({
        title: 'Registrando...',
        description: 'Funcionalidade de registro não implementada.',
        duration: 2000,
      });
    }
  };

  const toggleForm = () => setIsLogin(!isLogin);

  const formVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: 'easeOut' } },
    exit: { opacity: 0, y: -30, scale: 0.98, transition: { duration: 0.3, ease: 'easeIn' } },
  };

  return (
    <>
      <Helmet>
        <title>Autenticação - Cadence</title>
        <meta name="description" content="Entre ou registe-se para aceder à plataforma Cadence." />
      </Helmet>
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-dark-primary)' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="w-full max-w-md p-8 space-y-8 rounded-2xl shadow-2xl"
          style={{ backgroundColor: 'var(--bg-dark-secondary)', border: '1px solid var(--border-color)' }}
        >
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent mb-4">
              Cadence
            </h1>
            <AnimatePresence mode="wait">
              <motion.h2
                key={isLogin ? 'login' : 'register'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-2xl font-semibold"
                style={{ color: 'var(--text-light-primary)' }}
              >
                {isLogin ? 'Bem-vindo(a) de volta!' : 'Crie a sua conta'}
              </motion.h2>
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={isLogin ? 'loginForm' : 'registerForm'}
              variants={formVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onSubmit={handleAuthAction}
              className="space-y-6"
            >
              {isLogin ? (
                <>
                  <div>
                    <label className="sr-only">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2" size={18} style={{ color: 'var(--text-light-secondary)' }} />
                      <Input id="email-login" name="email" type="email" required placeholder="Email" className="pl-10" />
                    </div>
                  </div>
                  <div>
                    <label className="sr-only">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2" size={18} style={{ color: 'var(--text-light-secondary)' }} />
                      <Input id="password-login" name="password" type="password" required placeholder="Password" className="pl-10" />
                    </div>
                  </div>
                  {loginError && <div className="text-red-500 text-sm mb-2">{loginError}</div>}
                  <div className="flex items-center justify-end">
                    <a href="#" className="text-sm font-medium transition-colors" style={{ color: 'var(--text-light-secondary)' }} hover={{ color: 'var(--color-primary)' }}>
                      Esqueceu a password?
                    </a>
                  </div>
                  <Button type="submit" className="w-full btn-primary">
                    Entrar
                  </Button>
                </>
              ) : (
                <>
                  <div>
                    <label className="sr-only">Nome de Utilizador</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2" size={18} style={{ color: 'var(--text-light-secondary)' }} />
                      <Input id="username-register" name="username" type="text" required placeholder="Nome de Utilizador" className="pl-10" />
                    </div>
                  </div>
                  <div>
                    <label className="sr-only">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2" size={18} style={{ color: 'var(--text-light-secondary)' }} />
                      <Input id="email-register" name="email" type="email" required placeholder="Email" className="pl-10" />
                    </div>
                  </div>
                  <div>
                    <label className="sr-only">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2" size={18} style={{ color: 'var(--text-light-secondary)' }} />
                      <Input id="password-register" name="password" type="password" required placeholder="Password" className="pl-10" />
                    </div>
                  </div>
                   <div>
                    <label className="sr-only">Confirmar Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2" size={18} style={{ color: 'var(--text-light-secondary)' }} />
                      <Input id="confirm-password-register" name="confirm-password" type="password" required placeholder="Confirmar Password" className="pl-10" />
                    </div>
                  </div>
                  <Button type="submit" className="w-full btn-primary">
                    Registar
                  </Button>
                </>
              )}
            </motion.form>
          </AnimatePresence>

          <div className="text-center">
            <p className="text-sm" style={{ color: 'var(--text-light-secondary)' }}>
              {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
              <Button variant="link" onClick={toggleForm} className="font-medium" style={{ color: 'var(--color-primary)' }}>
                {isLogin ? 'Registar' : 'Entrar'}
              </Button>
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Auth;