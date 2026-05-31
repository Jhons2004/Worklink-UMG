'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

export default function LoginEstudiantes() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/api/auth/google-login-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_token: credentialResponse.credential }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Error en validación de Google');
      
      localStorage.setItem('worklink_token', data.access_token);
      localStorage.setItem('worklink_role', data.role);
      localStorage.setItem('worklink_user_id', data.id);
      localStorage.setItem('worklink_user_name', data.name);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/api/auth/login-student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Error al iniciar sesión');
      }

      // Guardar información en localStorage
      localStorage.setItem('worklink_token', data.access_token);
      localStorage.setItem('worklink_role', data.role);
      localStorage.setItem('worklink_user_id', data.id);
      localStorage.setItem('worklink_user_name', data.name);

      // Redirigir al dashboard de estudiantes
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId="161691246-i3f4vl2r1ftjbs9uumqlrige6g24p79h.apps.googleusercontent.com">
      <main className="relative flex min-h-screen flex-col items-center justify-center p-6 bg-white overflow-hidden">
        
      {/* Fondo decorativo idéntico a tu Home */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-blue-800 filter blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-red-600 filter blur-3xl"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      </div>

      {/* Tarjeta de Login */}
      <div className="relative z-10 bg-white/90 backdrop-blur-md border border-slate-100 p-8 sm:p-12 rounded-2xl shadow-xl max-w-md w-full text-center">
        
        {/* Botón flotante para regresar al Home */}
        <Link 
          href="/" 
          className="absolute top-4 left-4 text-slate-400 hover:text-blue-900 flex items-center gap-1 text-xs font-bold transition-colors bg-slate-100 px-3 py-1.5 rounded-lg"
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

        <h2 className="text-2xl font-extrabold text-blue-900 tracking-tight mb-1">
          Acceso Estudiantes
        </h2>
        <p className="text-xs text-slate-400 uppercase tracking-wider mb-6">
          Portal Académico MiUMG
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 border border-red-200 text-xs font-bold p-3 rounded-xl mb-4 text-left">
            ⚠️ {error}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Correo MiUMG 
            </label>
            <input 
              type="email" 
              required
              placeholder="ej. miusuario@miumg.edu.gt"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-800 text-slate-700 text-sm bg-slate-50 focus:bg-white transition-all"
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-800 text-slate-700 text-sm bg-slate-50 focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <label className="flex items-center cursor-pointer select-none">
              <input type="checkbox" className="mr-1.5 rounded border-slate-300 text-blue-800 focus:ring-0" /> 
              Recordarme
            </label>
            <a href="#" className="hover:underline text-blue-600 font-medium">¿Olvidaste tu contraseña?</a>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-800 text-white font-bold text-sm rounded-xl shadow-md hover:bg-blue-900 transition-all active:scale-[0.98] mt-2 disabled:opacity-70"
          >
            {loading ? 'Validando credenciales...' : 'Iniciar Sesión'}
          </button>
          
          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-medium">O continúa con</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>
          
          <div className="flex justify-center w-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Fallo al iniciar sesión con Google')}
              shape="rectangular"
              size="large"
              theme="outline"
              text="continue_with"
            />
          </div>
        </form>

        <div className="border-t border-slate-100 pt-5 mt-6 text-xs text-slate-400">
          ¿Necesitas ayuda con tu cuenta? Contáctanos
        </div>

      </div>
    </main>
    </GoogleOAuthProvider>
  );
}