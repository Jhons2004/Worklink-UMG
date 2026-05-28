'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const MOCK_JOBS = [
  { id: 1, title: 'Desarrollador Frontend Junior', company: 'TechSolutions Guatemala', salary: 'Q8,500', type: 'Tiempo Completo', location: 'Zona 10, Ciudad de Guatemala', posted: 'Hace 2 días' },
  { id: 2, title: 'Analista de Sistemas / DBA', company: 'Banco Corporativo', salary: 'Q12,000', type: 'Híbrido', location: 'Zona 4, Ciudad de Guatemala', posted: 'Hace 1 día' },
  { id: 3, title: 'Soporte Técnico TI', company: 'Distribuidora Global', salary: 'Q5,500', type: 'Medio Tiempo', location: 'Mixco, Guatemala', posted: 'Hace 5 horas' },
];

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState<'empleos' | 'perfil' | 'mapa'>('empleos');
  const [search, setSearch] = useState('');
  const [salaryFilter, setSalaryFilter] = useState('');
  const [scheduleFilter, setScheduleFilter] = useState('');

  // TUS CAMPOS ORIGINALES COMPLETOS
  const [profile, setProfile] = useState({
    name: 'Carlos Mendoza',
    career: 'Ingeniería en Sistemas de Información',
    carnet: '0901-21-4321',
    phone: '5544-3322',
    biography: 'Estudiante de octavo ciclo apasionado por el desarrollo web y las bases de datos. Buscando mi primera oportunidad laboral.',
    cvName: 'Carlos_Mendoza_CV.pdf'
  });

  // Cargar datos guardados si existen al abrir la página
  useEffect(() => {
    const savedData = localStorage.getItem('umg_shared_student_profile');
    if (savedData) {
      setProfile(JSON.parse(savedData));
    }
  }, []);

  // Función para guardar los campos exactos del estudiante
  const handleSaveProfile = () => {
    localStorage.setItem('umg_shared_student_profile', JSON.stringify(profile));
    alert('¡Perfil actualizado con éxito! Los cambios ya están disponibles para el portal de empresas.');
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-700 font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-[#003057] text-white flex flex-col p-6 z-20 shadow-xl md:sticky md:top-0 md:h-screen">
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/10">
          <Image src="/logoumg.png" alt="Logo UMG" width={45} height={45} className="object-contain" />
          <div>
            <h1 className="font-black text-sm tracking-tight">WorkLink <span className="text-red-500">UMG</span></h1>
            <p className="text-[10px] opacity-60 font-semibold uppercase">Panel Estudiante</p>
          </div>
        </div>

        <div className="mb-8 p-3 bg-white/5 rounded-xl text-left">
          <p className="font-bold text-xs text-blue-300 uppercase tracking-wider">Bienvenido,</p>
          <p className="font-extrabold text-sm text-white truncate">{profile.name}</p>
          <p className="text-[11px] opacity-70 truncate">{profile.career}</p>
        </div>

        <nav className="flex-1 space-y-2">
          <button onClick={() => setActiveTab('empleos')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'empleos' ? 'bg-red-600 text-white shadow-lg' : 'hover:bg-white/10 text-white/80'}`}>Bolsa de Empleos</button>
          <button onClick={() => setActiveTab('mapa')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'mapa' ? 'bg-red-600 text-white shadow-lg' : 'hover:bg-white/10 text-white/80'}`}>Mapa de Vacantes</button>
          <button onClick={() => setActiveTab('perfil')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'perfil' ? 'bg-red-600 text-white shadow-lg' : 'hover:bg-white/10 text-white/80'}`}>Mi Perfil Profesional</button>
        </nav>

        <Link href="/" className="mt-auto pt-4 border-t border-white/10 text-xs font-bold text-red-400">❌ Cerrar Sesión</Link>
      </aside>

      {/* CONTENIDO */}
      <section className="flex-1 p-6 md:p-10 max-w-6xl mx-auto w-full overflow-y-auto">
        
        {activeTab === 'empleos' && (
          <div>
            <h2 className="text-3xl font-black text-[#003057] mb-6">Plazas Disponibles</h2>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <input type="text" placeholder="ej. Desarrollador, DBA..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full px-4 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200 outline-none" />
              <select value={salaryFilter} onChange={(e) => setSalaryFilter(e.target.value)} className="w-full px-4 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200 outline-none text-slate-600 font-medium"><option value="">Cualquier salario</option><option value="Q8.5k">Q8,500</option></select>
              <select value={scheduleFilter} onChange={(e) => setScheduleFilter(e.target.value)} className="w-full px-4 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200 outline-none text-slate-600 font-medium"><option value="">Cualquier jornada</option><option value="Completo">Tiempo Completo</option></select>
            </div>
            <div className="space-y-4">
              {MOCK_JOBS.map((job) => (
                <div key={job.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
                  <div>
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-800 text-[10px] font-bold rounded-md">{job.type}</span>
                    <h3 className="text-xl font-bold text-[#003057] mt-1">{job.title}</h3>
                    <p className="text-sm text-slate-600">{job.company}</p>
                  </div>
                  <button className="px-6 py-2.5 bg-[#003057] text-white text-sm font-bold rounded-xl">Aplicar Ahora</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'mapa' && (
          <div className="bg-slate-200 rounded-2xl min-h-[450px] flex flex-col items-center justify-center p-8 text-center border-2 border-dashed">
            <div className="animate-bounce mb-3 text-2xl">📍</div>
            <h3 className="text-lg font-bold text-[#003057]">Espacio Reservado para Mapa</h3>
          </div>
        )}

        {/* TU FORMULARIO ORIGINAL COMPLETAMENTE PROTEGIDO */}
        {activeTab === 'perfil' && (
          <div className="max-w-3xl">
            <h2 className="text-3xl font-black text-[#003057] mb-6">Mi Perfil Profesional</h2>
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
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

              <div className="border-t border-slate-100 pt-6">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Currículum Vitae (CV)</label>
                <div className="border-2 border-dashed border-slate-200 bg-slate-50 p-6 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-[#003057]">{profile.cvName}</p>
                    <p className="text-xs text-slate-400">PDF máximo 5MB</p>
                  </div>
                  <label className="px-4 py-2 bg-white border border-slate-200 text-xs font-bold rounded-xl cursor-pointer hover:bg-slate-50">
                    Reemplazar Archivo
                    <input type="file" accept=".pdf" className="hidden" onChange={(e) => {
                      if(e.target.files?.[0]) setProfile({...profile, cvName: e.target.files[0].name});
                    }} />
                  </label>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button onClick={handleSaveProfile} className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl shadow-md transition-colors active:scale-95">
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