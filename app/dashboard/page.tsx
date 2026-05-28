'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Datos falsos (Mock Data) para simular los trabajos disponibles en Guatemala
const MOCK_JOBS = [
  { id: 1, title: 'Desarrollador Frontend Junior', company: 'TechSolutions Guatemala', salary: 'Q8,500', type: 'Tiempo Completo', location: 'Zona 10, Ciudad de Guatemala', posted: 'Hace 2 días' },
  { id: 2, title: 'Analista de Sistemas / DBA', company: 'Banco Corporativo', salary: 'Q12,000', type: 'Híbrido', location: 'Zona 4, Ciudad de Guatemala', posted: 'Hace 1 día' },
  { id: 3, title: 'Soporte Técnico TI', company: 'Distribuidora Global', salary: 'Q5,500', type: 'Medio Tiempo', location: 'Mixco, Guatemala', posted: 'Hace 5 horas' },
];

export default function StudentDashboard() {
  // Control de la sección activa: 'empleos' | 'perfil' | 'mapa'
  const [activeTab, setActiveTab] = useState<'empleos' | 'perfil' | 'mapa'>('empleos');

  // Estados para los filtros de búsqueda
  const [search, setSearch] = useState('');
  const [salaryFilter, setSalaryFilter] = useState('');
  const [scheduleFilter, setScheduleFilter] = useState('');

  // Estado para los datos del perfil del estudiante
  const [profile, setProfile] = useState({
    name: 'Carlos Mendoza',
    career: 'Ingeniería en Sistemas de Información',
    carnet: '0901-21-4321',
    phone: '5544-3322',
    biography: 'Estudiante de octavo ciclo apasionado por el desarrollo web y las bases de datos. Buscando mi primera oportunidad laboral.',
    cvName: 'Carlos_Mendoza_CV.pdf'
  });

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-700 font-sans">
      
      {/* ================= SIDEBAR (BARRA LATERAL) ================= */}
      <aside className="w-full md:w-64 bg-[#003057] text-white flex flex-col p-6 z-20 shadow-xl md:sticky md:top-0 md:h-screen">
        {/* Header del Sidebar */}
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/10">
          <Image src="/logoumg.png" alt="Logo UMG" width={45} height={45} className="object-contain" />
          <div>
            <h1 className="font-black text-sm tracking-tight">WorkLink <span className="text-red-500">UMG</span></h1>
            <p className="text-[10px] opacity-60 font-semibold uppercase">Panel Estudiante</p>
          </div>
        </div>

        {/* Info del Alumno Logueado */}
        <div className="mb-8 p-3 bg-white/5 rounded-xl text-left">
          <p className="font-bold text-xs text-blue-300 uppercase tracking-wider">Bienvenido,</p>
          <p className="font-extrabold text-sm text-white truncate">{profile.name}</p>
          <p className="text-[11px] opacity-70 truncate">{profile.career}</p>
        </div>

        {/* Menú de Navegación */}
        <nav className="flex-1 space-y-2">
          <button
            onClick={() => setActiveTab('empleos')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'empleos' ? 'bg-red-600 text-white shadow-lg' : 'hover:bg-white/10 text-white/80'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            Bolsa de Empleos
          </button>

          <button
            onClick={() => setActiveTab('mapa')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'mapa' ? 'bg-red-600 text-white shadow-lg' : 'hover:bg-white/10 text-white/80'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Mapa de Vacantes
          </button>

          <button
            onClick={() => setActiveTab('perfil')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'perfil' ? 'bg-red-600 text-white shadow-lg' : 'hover:bg-white/10 text-white/80'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            Mi Perfil Profesional
          </button>
        </nav>

        {/* Botón Cerrar Sesión */}
        <Link href="/" className="mt-auto pt-4 border-t border-white/10 text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-2">
          ❌ Cerrar Sesión
        </Link>
      </aside>

      {/* ================= CONTENIDO CENTRAL DINÁMICO ================= */}
      <section className="flex-1 p-6 md:p-10 max-w-6xl mx-auto w-full overflow-y-auto">
        
        {/* ====== PESTAÑA 1: BOLSA DE EMPLEOS (CON FILTROS) ====== */}
        {activeTab === 'empleos' && (
          <div>
            <div className="mb-6">
              <h2 className="text-3xl font-black text-[#003057]">Plazas Disponibles</h2>
              <p className="text-sm text-slate-500">Encuentra tu próximo reto profesional adaptado a tus horarios de estudio.</p>
            </div>

            {/* Barra de Filtros */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Puesto o Palabra Clave</label>
                <input 
                  type="text" 
                  placeholder="ej. Desarrollador, DBA..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-4 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-800"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Rango Salarial</label>
                <select 
                  value={salaryFilter}
                  onChange={(e) => setSalaryFilter(e.target.value)}
                  className="w-full px-4 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-800 text-slate-600 font-medium"
                >
                  <option value="">Cualquier salario</option>
                  <option value="Q5k">Q5,000 - Q8,000</option>
                  <option value="Q8k">Q8,000 - Q12,000</option>
                  <option value="Q12k">Más de Q12,000</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Horario / Jornada</label>
                <select 
                  value={scheduleFilter}
                  onChange={(e) => setScheduleFilter(e.target.value)}
                  className="w-full px-4 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-800 text-slate-600 font-medium"
                >
                  <option value="">Cualquier jornada</option>
                  <option value="Completo">Tiempo Completo</option>
                  <option value="Medio">Medio Tiempo</option>
                  <option value="Hibrido">Híbrido / Remoto</option>
                </select>
              </div>
            </div>

            {/* Tarjetas de Trabajos */}
            <div className="space-y-4">
              {MOCK_JOBS.map((job) => (
                <div key={job.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md transition-shadow">
                  <div>
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-800 text-[10px] font-bold uppercase rounded-md tracking-wider">{job.type}</span>
                    <h3 className="text-xl font-bold text-[#003057] mt-1.5">{job.title}</h3>
                    <p className="text-sm font-semibold text-slate-600">{job.company}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400 mt-2 font-medium">
                      <span className="flex items-center gap-1">📍 {job.location}</span>
                      <span className="flex items-center gap-1">💰 {job.salary} / mes</span>
                      <span className="flex items-center gap-1">🕒 {job.posted}</span>
                    </div>
                  </div>
                  <button className="w-full sm:w-auto px-6 py-2.5 bg-[#003057] hover:bg-[#002544] text-white text-sm font-bold rounded-xl transition-colors shadow-sm active:scale-95">
                    Aplicar Ahora
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ====== PESTAÑA 2: MAPA GEOGRÁFICO DE TRABAJOS ====== */}
        {activeTab === 'mapa' && (
          <div className="h-full flex flex-col">
            <div className="mb-6">
              <h2 className="text-3xl font-black text-[#003057]">Mapa de Oportunidades</h2>
              <p className="text-sm text-slate-500">Visualiza geográficamente dónde están las oficinas de las empresas reclutadoras.</p>
            </div>

            {/* Contenedor Mock del Mapa */}
            <div className="bg-slate-200 border-2 border-dashed border-slate-300 rounded-2xl flex-1 min-h-[450px] flex flex-col items-center justify-center p-8 text-center relative overflow-hidden bg-cover bg-center shadow-inner">
              <div className="absolute inset-0 bg-slate-900/10 pointer-events-none"></div>
              {/* Icono de ubicación simulando el pin */}
              <div className="z-10 bg-white p-4 rounded-full shadow-2xl animate-bounce mb-3 text-2xl">📍</div>
              <h3 className="text-lg font-bold text-[#003057] z-10">Espacio Reservado para Mapa</h3>
              <p className="text-sm text-slate-500 max-w-sm z-10 mt-1">Aquí integraremos Leaflet.js / Google Maps API en el siguiente sprint para renderizar los pines de empresas en Guatemala.</p>
            </div>
          </div>
        )}

        {/* ====== PESTAÑA 3: PERFIL DE USUARIO Y SUBIDA DE CV ====== */}
        {activeTab === 'perfil' && (
          <div className="max-w-3xl">
            <div className="mb-6">
              <h2 className="text-3xl font-black text-[#003057]">Mi Perfil Profesional</h2>
              <p className="text-sm text-slate-500">Mantén tus datos actualizados para que las empresas de Guatemala te encuentren rápido.</p>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
              {/* Inputs de información */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Nombre Completo</label>
                  <input type="text" value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} className="w-full px-4 py-2.5 text-sm bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-800 text-slate-700 font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Carnet UMG</label>
                  <input type="text" disabled value={profile.carnet} className="w-full px-4 py-2.5 text-sm bg-slate-100 rounded-xl border border-slate-200 outline-none text-slate-500 font-medium cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Carrera Académica</label>
                  <input type="text" disabled value={profile.career} className="w-full px-4 py-2.5 text-sm bg-slate-100 rounded-xl border border-slate-200 outline-none text-slate-500 font-medium cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Teléfono de Contacto</label>
                  <input type="text" value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} className="w-full px-4 py-2.5 text-sm bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-800 text-slate-700 font-medium" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Extracto / Biografía Profesional</label>
                <textarea rows={4} value={profile.biography} onChange={(e) => setProfile({...profile, biography: e.target.value})} className="w-full px-4 py-2.5 text-sm bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-800 text-slate-700 font-medium resize-none" />
              </div>

              {/* Apartado de subir CV */}
              <div className="border-t border-slate-100 pt-6">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Currículum Vitae (CV)</label>
                <div className="border-2 border-dashed border-slate-200 bg-slate-50 p-6 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">📄</span>
                    <div className="text-left">
                      <p className="text-sm font-bold text-[#003057]">{profile.cvName}</p>
                      <p className="text-xs text-slate-400">PDF máximo 5MB</p>
                    </div>
                  </div>
                  <label className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 shadow-sm cursor-pointer transition-colors active:scale-95">
                    Reemplazar Archivo
                    <input type="file" accept=".pdf" className="hidden" onChange={(e) => {
                      if(e.target.files?.[0]) setProfile({...profile, cvName: e.target.files[0].name});
                    }} />
                  </label>
                </div>
              </div>

              {/* Botón Guardar */}
              <div className="flex justify-end pt-4">
                <button onClick={() => alert('¡Perfil actualizado con éxito localmente!')} className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl shadow-md transition-colors active:scale-95">
                  Guardar Cambios
                </button>
              </div>

            </div>
          </div>
        )}

      </section>
    </main>
  );
}