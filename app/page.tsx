import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-6 bg-white overflow-hidden">
      
      {/* Fondo decorativo sutil con temática tecnológica/redes usando los colores UMG */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-blue-800 filter blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-red-600 filter blur-3xl"></div>
        {/* Patrón de cuadrícula tecnológica */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      </div>

      {/* Contenedor Principal (Tarjeta Blanca Limpia) */}
      <div className="relative z-10 bg-white/90 backdrop-blur-md border border-slate-100 p-8 sm:p-12 rounded-2xl shadow-xl max-w-2xl w-full text-center">
        
       {/* Logo Oficial UMG */}
<     div className="flex flex-col items-center justify-center gap-2 mb-6">
      <Image 
      src="/logoumg.png" 
      alt="Logo Universidad Mariano Gálvez"
      width={200}          
      height={200}         
      priority           
      className="h-auto w-auto object-contain"
  />
  <span className="text-xs font-bold tracking-widest text-slate-400 mt-2">UNIVERSIDAD MARIANO GÁLVEZ</span>
</div>

        {/* Títulos */}
        <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-900 tracking-tight mb-2">
          WorkLink <span className="text-red-600">UMG</span>
        </h1>
        <p className="text-xs uppercase font-semibold text-blue-800 tracking-wider mb-6">
          Conectando Talento 
        </p>
        
        <p className="text-slate-600 text-base sm:text-lg mb-10 leading-relaxed">
          La plataforma exclusiva de vinculación laboral para estudiantes, egresados y empresas asociadas a la comunidad universitaria.
        </p>

        {/* Botones de Acceso Principal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto mb-8">
          <Link 
            href="/login" 
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-800 text-white font-medium rounded-xl shadow-md hover:bg-blue-900 hover:shadow-lg active:scale-95 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path></svg>
            Para Estudiantes
          </Link>
          
          <Link 
            href="/registro-empresa" 
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-red-600 text-white font-medium rounded-xl shadow-md hover:bg-red-700 hover:shadow-lg active:scale-95 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            Para Empresas
          </Link>
        </div>

        {/* Footer de la tarjeta */}
        <div className="border-t border-slate-100 pt-5 text-xs text-slate-400 flex flex-col items-center gap-2">
          <span>¿No tienes cuenta de MiUMG? Contáctanos | © {new Date().getFullYear()} UMG</span>
          <Link href="/admin" className="text-[10px] text-slate-300 hover:text-red-500 transition-all font-bold uppercase tracking-wider">
            🛡️ Panel Administrativo
          </Link>
        </div>

      </div>
    </main>
  );
}