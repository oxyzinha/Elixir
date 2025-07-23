// src/pages/Auth.jsx
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Mail, Lock, User } from 'lucide-react';

// Assumindo que estas funções estão implementadas e lidam com as chamadas à API
// e o armazenamento do token JWT (e.g., em localStorage).
import { loginUser, registerUser } from '@/lib/authContext'; // Ou '@/lib/authContext' se for o teu caso

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authError, setAuthError] = useState(null);

  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuthAction = async (e) => {
    e.preventDefault();
    setAuthError(null);

    if (isLogin) {
      try {
        // Login com email e password
        await loginUser(email, password);
        toast({
          title: 'Login realizado com sucesso!',
          description: 'A redirecionar para o dashboard...',
          duration: 1500,
        });
        setTimeout(() => navigate('/dashboard'), 1500);
      } catch (err) {
        const errorMessage = err.message || 'Erro desconhecido ao fazer login.';
        setAuthError(errorMessage);
        toast({
          title: 'Erro ao fazer login',
          description: errorMessage,
          variant: 'destructive',
          duration: 2500,
        });
      }
    } else {
      // Registo com username, email, password e confirmação
      if (password !== confirmPassword) {
        setAuthError('As passwords não coincidem!');
        toast({
          title: 'Erro ao registar',
          description: 'As passwords não coincidem',
          variant: 'destructive',
          duration: 2500,
        });
        return;
      }
      try {
        await registerUser(username, email, password);
        toast({
          title: 'Registo realizado com sucesso!',
          description: 'A sua conta foi criada. Pode agora iniciar sessão.',
          duration: 2000,
        });
        setTimeout(() => {
          setIsLogin(true);
          setUsername('');
          setEmail('');
          setPassword('');
          setConfirmPassword('');
        }, 2000);
      } catch (err) {
        const errorMessage = err.message || 'Erro desconhecido ao registar utilizador.';
        setAuthError(errorMessage);
        toast({
          title: 'Erro ao registar',
          description: errorMessage,
          variant: 'destructive',
          duration: 2500,
        });
      }
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setAuthError(null);
    setEmail('');
    setPassword('');
    setUsername('');
    setConfirmPassword('');
  };

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
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-light-primary)' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="w-full max-w-md p-8 space-y-8 rounded-2xl shadow-2xl"
          style={{ backgroundColor: 'var(--bg-light-primary)', border: '1px solid var(--border-color)' }}
        >
          <div className="text-center">
            <h1
              className="text-4xl font-bold bg-gradient-to-r bg-clip-text text-transparent mb-4"
              style={{
                backgroundImage: 'linear-gradient(to right, #9B59B6, #6A5ACD)'
              }}
            >
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
                      <Input
                        id="email-login"
                        name="email"
                        type="email"
                        required
                        placeholder="Email"
                        className="pl-10 input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="sr-only">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2" size={18} style={{ color: 'var(--text-light-secondary)' }} />
                      <Input
                        id="password-login"
                        name="password"
                        type="password"
                        required
                        placeholder="Password"
                        className="pl-10 input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  {authError && <div className="text-red-500 text-sm mt-2">{authError}</div>}
                  <div className="flex items-center justify-end">
                    <a
                      href="#"
                      className="text-sm font-medium transition-colors hover:text-[var(--color-primary)]"
                      style={{ color: 'var(--text-light-secondary)' }}
                    >
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
                      <Input
                        id="username-register"
                        name="username"
                        type="text"
                        required
                        placeholder="Nome de Utilizador"
                        className="pl-10 input"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="sr-only">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2" size={18} style={{ color: 'var(--text-light-secondary)' }} />
                      <Input
                        id="email-register"
                        name="email"
                        type="email"
                        required
                        placeholder="Email"
                        className="pl-10 input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="sr-only">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2" size={18} style={{ color: 'var(--text-light-secondary)' }} />
                      <Input
                        id="password-register"
                        name="password"
                        type="password"
                        required
                        placeholder="Password"
                        className="pl-10 input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="sr-only">Confirmar Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2" size={18} style={{ color: 'var(--text-light-secondary)' }} />
                      <Input
                        id="confirm-password-register"
                        name="confirm-password"
                        type="password"
                        required
                        placeholder="Confirmar Password"
                        className="pl-10 input"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  {authError && <div className="text-red-500 text-sm mt-2">{authError}</div>}
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