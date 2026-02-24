'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Simulate login delay
        setTimeout(() => {
            setIsLoading(false);
            if (email === 'admin@biofy.es' && password === '123456') {
                router.push('/');
            } else {
                setError('Credenciales incorrectas');
            }
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">

            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#a78bfa]/20 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#7dd3fc]/20 rounded-full blur-[100px]"></div>
            </div>

            <div className="w-full max-w-md bg-white rounded-[2rem] shadow-xl border border-slate-100 p-8 md:p-12 z-10 relative">
                <div className="text-center mb-10">
                    <img src="/logo.png" alt="Culligan Biofy" className="h-16 mx-auto mb-6 object-contain" />
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">Acceso a dashboard</h1>
                    <p className="text-slate-500">Bienvenido de nuevo, por favor inicia sesión.</p>
                    {error && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-500 text-sm font-medium">
                            {error}
                        </div>
                    )}
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-2">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="tu@email.com"
                                className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#a78bfa] transition-all"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-2">Contraseña</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#a78bfa] transition-all"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#0f172a] hover:bg-slate-800 text-white font-bold py-4 rounded-2xl transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 group"
                    >
                        {isLoading ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        ) : (
                            <>
                                Entrar
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>
            </div>

            <div className="mt-12 text-center space-y-2 z-10">
                <p className="text-sm font-semibold text-slate-400">Powered by <span className="text-slate-900 font-bold">Hulkes</span></p>
                <p className="text-[10px] text-slate-300">© 2026 BIOFY. Todos los derechos reservados.</p>
            </div>
        </div>
    );
}
