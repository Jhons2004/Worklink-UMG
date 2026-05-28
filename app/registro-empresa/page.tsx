'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function RegistroEmpresas() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert('Validando datos de la empresa con el sistema de reclutamiento...');
    }, 1500);
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-6 bg-white overflow-hidden">
      
      {/* Fondo decorativo idéntico a tu Home y Login de Estudiantes */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-blue-800 filter blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-red-600 filter blur-3xl"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      </div>

      {/* Tarjeta de Acceso Empresa */}
      <div className="relative z-10 bg-white/90 backdrop-blur-md border border-slate-100 p-8 sm:p-12 rounded-2xl shadow-xl max-w-md w-full text-center">
        
        {/* Botón flotante para regresar al Home */}
        <Link 
          href="/" 
          className="absolute top-4 left-4 text-slate-400 hover:text-red-600 flex items-center gap-1 text-xs font-bold transition-colors bg-slate-100 px-3 py-1.5 rounded-lg"
        >
          ← Volver
        </Link>

        {/* Logo Institucional */}
        <div className="flex flex-col items-center justify-center gap-2 mb-6 mt-4">
          <Image 
            src="/logoumg.png" 
            alt="Logo Universidad Mariano Gálvez"
            width={150}          
            height={150}         
            priority           
            className="h-auto w-auto object-contain"
          />
          <span className="text-xs font-bold tracking-widest text-slate-400 mt-2">UNIVERSIDAD MARIANO GÁLVEZ</span>
        </div>

        <h2 className="text-2xl font-extrabold text-red-600 tracking-tight mb-1">
          Acceso Empresas
        </h2>
        <p className="text-xs text-slate-400 uppercase tracking-wider mb-6">
          Portal de Reclutamiento Corporativo
        </p>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Correo Electrónico Corporativo
            </label>
            <input 
              type="email" 
              required
              placeholder="ejemplo@empresa.com"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-600 text-slate-700 text-sm bg-slate-50 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Contraseña
            </label>
            <input 
              type="password" 
              required
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-600 text-slate-700 text-sm bg-slate-50 focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <label className="flex items-center cursor-pointer select-none">
              <input type="checkbox" className="mr-1.5 rounded border-slate-300 text-red-600 focus:ring-0" /> 
              Recordarme
            </label>
            <a href="#" className="hover:underline text-blue-600 font-medium">¿Olvidaste tu contraseña?</a>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-red-600 text-white font-bold text-sm rounded-xl shadow-md hover:bg-red-700 transition-all active:scale-[0.98] mt-2 disabled:opacity-70"
          >
            {loading ? 'Iniciando sesión...' : 'Entrar al Portal'}
          </button>
        </form>

        <div className="border-t border-slate-100 pt-5 mt-6 text-xs text-slate-400">
          ¿Tu empresa no está registrada?{' '}
          <a href="#" className="text-red-600 font-bold hover:underline">
            Solicita una cuenta
          </a>
        </div>

      </div>
    </main>
  );
}