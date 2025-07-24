// src/components/layout/Header.jsx



import React, { useState, useRef, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

import { motion, AnimatePresence } from 'framer-motion';

import { Search, Bell, HelpCircle, ChevronDown, User, Settings, LogOut, Info, Menu } from 'lucide-react';

import { Input } from '@/components/ui/input';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import {

    DropdownMenu,

    DropdownMenuContent,

    DropdownMenuItem,

    DropdownMenuLabel,

    DropdownMenuSeparator,

    DropdownMenuTrigger,

} from '@/components/ui/dropdown-menu';

import { useToast } from '@/components/ui/use-toast';

import NotificationsPopup from '@/components/layout/NotificationsPopup';

import { useActivityNotifications } from '@/context/ActivityNotificationContext';



const ProfilePopup = ({ isVisible, onClose, onLogout }) => {

    const popupRef = useRef(null);

    const navigate = useNavigate();



    useEffect(() => {

        function handleClickOutside(event) {

            if (!isVisible) return;

            const button = document.querySelector('.profile-button');

            if (

                popupRef.current &&

                !popupRef.current.contains(event.target) &&

                (!button || !button.contains(event.target))

            ) {

                onClose();

            }

        }

        document.addEventListener('mousedown', handleClickOutside);

        return () => document.removeEventListener('mousedown', handleClickOutside);

    }, [isVisible, onClose]);



    const handleNavigate = (path) => {

        navigate(path);

        onClose();

    };



    return (

        <AnimatePresence>

            {isVisible && (

                <motion.div

                    initial={{ opacity: 0, y: -10, scale: 0.95 }}

                    animate={{ opacity: 1, y: 10, scale: 1 }}

                    exit={{ opacity: 0, y: -10, scale: 0.95 }}

                    transition={{ duration: 0.25, ease: 'easeOut' }}

                    className="absolute right-0 mt-2 w-72 md:w-80 rounded-xl shadow-2xl z-40"

                    style={{

                        backgroundColor: '#f9fafb', // fundo claro

                        border: '1px solid #d1d5db', // borda cinza clara

                        color: '#111827', // texto preto escuro

                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)', // sombra suave

                    }}

                    ref={popupRef}

                >

                    <div

                        className="p-5 border-b"

                        style={{ borderColor: 'rgba(17, 24, 39, 0.1)' }}

                    >

                        <div className="flex items-center gap-4">

                            <div className="w-12 h-12 rounded-full bg-gray-300" />

                            <div>

                                <p className="font-semibold text-gray-900">Lara Silva</p>

                                <p className="text-sm text-gray-600">larasilva@email.com</p>

                            </div>

                        </div>

                    </div>



                    <div className="p-3 space-y-2">

                        <button

                            onClick={() => handleNavigate('/perfil')}

                            className="flex items-center w-full gap-3 px-4 py-2 rounded-lg hover:bg-gray-200 transition text-gray-900 text-sm font-medium"

                        >

                            <User size={20} />

                            Perfil

                        </button>



                        <button

                            onClick={() => handleNavigate('/minha-conta')}

                            className="flex items-center w-full gap-3 px-4 py-2 rounded-lg hover:bg-gray-200 transition text-gray-900 text-sm font-medium"

                        >

                            <Info size={20} />

                            Minha conta

                        </button>



                        <button

                            onClick={() => handleNavigate('/configuracoes')}

                            className="flex items-center w-full gap-3 px-4 py-2 rounded-lg hover:bg-gray-200 transition text-gray-900 text-sm font-medium"

                        >

                            <Settings size={20} />

                            Configurações

                        </button>

                    </div>



                    <div

                        className="border-t p-3"

                        style={{ borderColor: 'rgba(17, 24, 39, 0.1)' }}

                    >

                        <button

                            onClick={() => {

                                onLogout();

                                onClose();

                            }}

                            className="flex items-center w-full gap-3 px-4 py-2 rounded-lg hover:bg-red-100 transition text-red-600 font-semibold text-sm"

                        >

                            <LogOut size={20} />

                            Sair

                        </button>

                    </div>

                </motion.div>

            )}

        </AnimatePresence>

    );

};



const Header = ({ onMenuClick, isNavbarOpen }) => { // Recebe isNavbarOpen

    const { toast = () => {} } = useToast(); // Adicionado fallback para toast

    const navigate = useNavigate();

    const [showNotifications, setShowNotifications] = useState(false);

    const [showProfilePopup, setShowProfilePopup] = useState(false);

    const { unreadCount } = useActivityNotifications();



    const handleFeatureClick = (feature) => {

        toast({

            title: "🚧 Esta funcionalidade ainda não foi implementada...",

            duration: 3000,

        });

    };



    const handleLogout = () => {

        toast({

            title: "Terminando sessão...",

            duration: 1500,

        });

        setTimeout(() => navigate('/auth'), 1500);

    };



    return (

        <motion.header

            initial={{ y: -50, opacity: 0 }}

            animate={{ y: 0, opacity: 1 }}

            transition={{ duration: 0.5 }}

            // Classes para o efeito "push"

            // Em mobile, o header é empurrado com translate-x

            // Em desktop (md:), ele tem uma margem esquerda para a navbar e ocupa a largura restante

            className={`fixed top-0 w-full h-16 flex items-center justify-between px-4 md:px-6 z-20 bg-bg-light-primary border-b border-border-color

            ${isNavbarOpen ? 'translate-x-64' : 'translate-x-0'}

            md:left-64 md:w-[calc(100%-16rem)] md:translate-x-0 transition-all duration-300`}

        >

            {/* Secção Esquerda: Botão de Menu (Hambúrguer) para Mobile */}

            <div className="flex items-center md:hidden"> {/* Visível só em mobile */}

                <button

                    onClick={onMenuClick}

                    className="p-2 rounded-full transition-colors hover:bg-white/10 text-text-light-secondary"

                    aria-label="Abrir menu"

                >

                    <Menu size={24} />

                </button>

            </div>



            {/* Barra de pesquisa: visível APENAS em telas MD e maiores (md:flex).

                Oculta em telas pequenas (hidden por padrão). */}

            <div className="hidden md:flex md:flex-1 md:max-w-md md:mx-auto">

                <div className="relative w-full">

                    <Search

                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light-secondary"

                        size={18}

                    />

                    <Input

                        placeholder="Procurar..."

                        className="pl-10 w-full"

                        onClick={() => handleFeatureClick('search')}

                    />

                </div>

            </div>



            {/* Secção Direita: Ícones do sino e perfil. Sempre visíveis, alinhados à direita. */}

            <div className="flex items-center space-x-2 sm:space-x-4 ml-auto">

                {/* Sino */}

                <div className="relative">

                    <motion.button

                        whileHover={{ scale: 1.1 }}

                        whileTap={{ scale: 0.95 }}

                        onClick={() => setShowNotifications(!showNotifications)}

                        className="p-2 rounded-full transition-colors hover:bg-white/10 relative text-text-light-secondary bg-transparent bell-notification-button"

                    >

                        <Bell size={20} />

                        {unreadCount > 0 && (

                            <span className="absolute top-1 right-1 flex h-2.5 w-2.5">

                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-color-primary"></span>

                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-color-primary"></span>

                            </span>

                        )}

                    </motion.button>

                    <NotificationsPopup

                        isVisible={showNotifications}

                        onClose={() => setShowNotifications(false)}

                    />

                </div>



                {/* Ajuda: OCULTA em telas pequenas, visível a partir de MD. */}

                <motion.button

                    whileHover={{ scale: 1.1 }}

                    whileTap={{ scale: 0.95 }}

                    onClick={() => handleFeatureClick('help')}

                    className="hidden md:block p-2 rounded-full transition-colors hover:bg-white/10 text-text-light-secondary bg-transparent"

                >

                    <HelpCircle size={20} />

                </motion.button>



                {/* Avatar e pop-up do perfil */}

                <div className="relative">

                    <motion.button

                        whileHover={{ scale: 1.05 }}

                        className="flex items-center space-x-2 sm:space-x-3 p-1.5 sm:p-2 rounded-lg transition-colors text-text-light-primary profile-button"

                        onClick={() => setShowProfilePopup(!showProfilePopup)}

                    >

                        {/* Tamanho do Avatar responsivo */}

                        <Avatar className="h-7 w-7 sm:h-8 sm:w-8">

                            <AvatarImage src="/placeholder-avatar.jpg" alt="Utilizador" />

                            <AvatarFallback>JS</AvatarFallback>

                        </Avatar>

                        {/* Nome e status Online: OCULTOS em telas pequenas, visíveis a partir de MD. */}

                        <div className="text-left hidden md:block">

                            <div className="text-sm font-medium">João Silva</div>

                            <div className="flex items-center space-x-1">

                                <div className="w-2 h-2 rounded-full status-online"></div>

                                <span className="text-xs text-text-light-secondary">Online</span>

                            </div>

                        </div>

                        {/* Seta ChevronDown: OCULTA em telas muito pequenas, visível a partir de SM. */}

                        <ChevronDown size={14} className="text-text-light-secondary hidden sm:block" />

                    </motion.button>



                    {/* Pop-up perfil */}

                    <ProfilePopup

                        isVisible={showProfilePopup}

                        onClose={() => setShowProfilePopup(false)}

                        onLogout={handleLogout}

                    />

                </div>

            </div>

        </motion.header>

    );

};



export default Header;