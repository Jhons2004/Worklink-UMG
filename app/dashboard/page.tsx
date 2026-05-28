'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Base de datos de plazas que coincide exactamente con el formato corporativo
const INITIAL_PLAZAS = [
  { id: 'PLZ-01', company: 'Corporación Multi-TI S.A.', title: 'Desarrollador Web Junior', type: 'Híbrido', salary: 8500, salaryLabel: 'Q8,500', location: 'Guatemala', fullLocation: 'Guatemala (Zona 10)', coords: '14.6033, -90.5167', description: 'Buscamos estudiante de Sistemas para apoyar en el mantenimiento de aplicaciones en React y Node.js. Ofrecemos crecimiento a corto plazo y capacitaciones continuas.' },
  { id: 'PLZ-02', company: 'Corporación Multi-TI S.A.', title: 'Asistente de Recursos Humanos / Administración', type: 'Tiempo Completo', salary: 6000, salaryLabel: 'Q6,000', location: 'Mixco', fullLocation: 'Mixco (San Cristóbal)', coords: '14.6333, -90.6000', description: 'Apoyo en el proceso de reclutamiento universitario, inducción de nuevo personal del área tecnológica y control de expedientes de la sede central.' },
  { id: 'PLZ-03', company: 'Innova Tech', title: 'QA Engineer Junior', type: 'Remoto', salary: 9000, salaryLabel: 'Q9,000', location: 'Guatemala', fullLocation: 'Guatemala (Sede Central)', coords: '14.6133, -90.5367', description: 'Ejecución de pruebas manuales y automatizadas en entornos ágiles. Se requiere conocimiento intermedio de metodologías de pruebas y bases de datos.' }
];

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState<'perfil' | 'empleos' | 'postulaciones'>('empleos');

  // Filtros de búsqueda
  const [filterText, setFilterText] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterMaxSalary, setFilterMaxSalary] = useState(12000);

  // Perfil del estudiante
  const [perfil, setPerfil] = useState({
    name: 'Carlos Mendoza',
    career: 'Ingeniería en Sistemas de Información',
    carnet: '0901-21-4321',
    phone: '5544-3322',
    biography: 'Estudiante de octavo ciclo apasionado por el desarrollo web y las bases de datos relacionales. Busco oportunidad como desarrollador junior.',
    location: 'Guatemala',
    cvName: 'Carlos_Mendoza_CV.pdf'
  });

  const [plazas, setPlazas] = useState(INITIAL_PLAZAS);
  const [selectedPlazaCoords, setSelectedPlazaCoords] = useState({ lat: '14.6033', lng: '-90.5167', label: 'Guatemala (Zona 10)', title: 'Desarrollador Web Junior' });
  const [appliedPlazasIds, setAppliedPlazasIds] = useState<string[]>(['PLZ-02']);

  const handleSavePerfil = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('umg_shared_student_profile', JSON.stringify(perfil));
    alert('¡Perfil y ubicación actualizados con éxito! Las empresas verán tus cambios de inmediato.');
  };

  const handleApplyPlaza = (id: string) => {
    if (appliedPlazasIds.includes(id)) return;
    setAppliedPlazasIds([...appliedPlazasIds, id]);
    alert('🚀 ¡Postulación registrada! Tu CV ha sido enviado directamente al buzón de la empresa.');
  };

  // Manejador simulado para la subida del archivo CV
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPerfil(prev => ({ ...prev, cvName: file.name }));
      alert(`📁 Archivo "${file.name}" cargado exitosamente en el formulario.`);
    }
  };

  // Lógica de filtrado combinada
  const plazasFiltradas = plazas.filter(p => {
    const matchesTexto = p.title.toLowerCase().includes(filterText.toLowerCase()) || p.company.toLowerCase().includes(filterText.toLowerCase());
    const matchesUbicacion = filterLocation === '' || p.location.toLowerCase() === filterLocation.toLowerCase();
    const matchesSalario = p.salary <= filterMaxSalary;

    return matchesTexto && matchesUbicacion && matchesSalario;
  });

  const plazasAplicadas = plazas.filter(p => appliedPlazasIds.includes(p.id));

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-700 font-sans">
      
      {/* SIDEBAR UNIVERSITARIO */}
      <aside className="w-full md:w-64 bg-[#003057] text-white flex flex-col p-6 z-20 shadow-xl md:sticky md:top-0 md:h-screen">
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/10">
          <Image src="/logoumg.png" alt="Logo UMG" width={45} height={45} className="object-contain" />
          <div>
            <h1 className="font-black text-sm tracking-tight">WorkLink <span className="text-red-500">UMG</span></h1>
            <p className="text-[10px] opacity-60 font-bold uppercase">Portal Estudiante</p>
          </div>
        </div>

        <div className="mb-6 p-3 bg-white/5 rounded-xl text-left border border-white/10">
          <p className="font-bold text-[10px] text-red-400 uppercase tracking-wider">Estudiante Activo</p>
          <p className="font-extrabold text-sm text-white truncate">{perfil.name}</p>
          <p className="text-[11px] text-slate-300 truncate">📍 Residencia: {perfil.location}</p>
        </div>

        <nav className="flex-1 space-y-2">
          <button onClick={() => setActiveTab('empleos')} className={`w-full text-left px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95 ${activeTab === 'empleos' ? 'bg-red-600 text-white shadow-lg' : 'hover:bg-white/10 text-white/80'}`}>💼 Vacantes Disponibles</button>
          <button onClick={() => setActiveTab('postulaciones')} className={`w-full text-left px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95 ${activeTab === 'postulaciones' ? 'bg-red-600 text-white shadow-lg' : 'hover:bg-white/10 text-white/80'}`}>🎯 Mis Postulaciones ({appliedPlazasIds.length})</button>
          <button onClick={() => setActiveTab('perfil')} className={`w-full text-left px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95 ${activeTab === 'perfil' ? 'bg-red-600 text-white shadow-lg' : 'hover:bg-white/10 text-white/80'}`}>👤 Mi Perfil Profesional</button>
        </nav>
        
        <Link href="/" className="mt-auto pt-4 border-t border-white/10 text-xs font-bold text-red-400">❌ Cerrar Sesión</Link>
      </aside>

      {/* CONTENIDO CENTRAL */}
      <section className="flex-1 p-6 md:p-10 max-w-6xl mx-auto w-full overflow-y-auto">
        
        {/* PESTAÑA 1: VACANTES DISPONIBLES */}
        {activeTab === 'empleos' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-black text-[#003057]">Bolsa de Trabajo Universitaria</h2>
              <p className="text-sm text-slate-500">Encuentra tu próximo reto profesional utilizando el sistema de segmentación por sueldo y municipio.</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col">
                <label className="text-[10px] font-black text-slate-400 uppercase mb-1">🔍 Buscar Vacante o Empresa</label>
                <input 
                  type="text" placeholder="ej. Desarrollador, Tech..." value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  className="w-full text-sm outline-none bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-slate-700 font-medium"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-[10px] font-black text-slate-400 uppercase mb-1">📍 Filtrar por Municipio</label>
                <select 
                  value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)}
                  className="w-full text-sm outline-none bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-slate-600 font-bold"
                >
                  <option value="">Todos los municipios</option>
                  <option value="Guatemala">Guatemala</option>
                  <option value="Mixco">Mixco</option>
                  <option value="Villa Nueva">Villa Nueva</option>
                </select>
              </div>

              <div className="flex flex-col justify-center">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">💰 Presupuesto Máximo</label>
                  <span className="text-xs font-black text-emerald-600">Q{filterMaxSalary.toLocaleString()}</span>
                </div>
                <input 
                  type="range" min="4000" max="15000" step="500" value={filterMaxSalary}
                  onChange={(e) => setFilterMaxSalary(parseInt(e.target.value))}
                  className="w-full accent-emerald-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7 space-y-4">
                {plazasFiltradas.map(plaza => {
                  const estaAplicada = appliedPlazasIds.includes(plaza.id);
                  return (
                    <div key={plaza.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-3">
                      <div>
                        <span className="text-[10px] font-black uppercase bg-red-50 text-red-600 px-2 py-0.5 rounded-md">{plaza.type}</span>
                        <h3 className="text-xl font-black text-[#003057] mt-1">{plaza.title}</h3>
                        <p className="text-xs font-bold text-slate-400">{plaza.company}</p>
                      </div>

                      <p className="text-sm font-bold text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        💰 Presupuesto Ofrecido: <span className="text-emerald-600 font-extrabold">{plaza.salaryLabel}</span>
                      </p>

                      <p className="text-xs text-slate-500 leading-relaxed font-medium">{plaza.description}</p>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                        <span className="text-slate-400 font-medium">📍 Municipio: {plaza.location}</span>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              const [lat, lng] = plaza.coords.split(', ');
                              setSelectedPlazaCoords({ lat, lng, label: plaza.fullLocation, title: plaza.title });
                            }}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#003057] font-bold rounded-lg transition-all active:scale-95"
                          >
                            🗺️ Ver en Mapa
                          </button>
                          <button 
                            disabled={estaAplicada} onClick={() => handleApplyPlaza(plaza.id)}
                            className={`px-4 py-1.5 font-black rounded-lg transition-all active:scale-95 shadow-sm ${estaAplicada ? 'bg-emerald-100 text-emerald-700 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white'}`}
                          >
                            {estaAplicada ? '✓ Aplicado' : 'Aplicar'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {plazasFiltradas.length === 0 && (
                  <p className="text-center text-xs font-bold text-slate-400 py-10 bg-white rounded-2xl border border-slate-200">No hay vacantes que coincidan con los filtros seleccionados.</p>
                )}
              </div>

              {/* MAPA GEOGRÁFICO */}
              <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm sticky top-24 space-y-3">
                <div className="border-b border-slate-100 pb-2">
                  <h4 className="text-sm font-black text-[#003057]">🌐 Georreferencia de Empleos UMG</h4>
                </div>

                <div 
                  className="w-full h-64 bg-emerald-50 rounded-xl border border-slate-300 relative overflow-hidden shadow-inner flex flex-col justify-between p-3"
                  style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '16px 16px' }}
                >
                  <div className="bg-white/95 p-2 rounded-lg shadow-sm border border-slate-200 z-10">
                    <p className="text-[10px] font-black uppercase text-red-600">Visualizando Oferta:</p>
                    <p className="text-xs font-extrabold text-[#003057] truncate">{selectedPlazaCoords.title}</p>
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-4xl animate-bounce">📍</span>
                  </div>

                  <div className="bg-slate-900/90 text-white p-2 rounded-lg text-[10px] mt-auto z-10 font-mono">
                    <p className="font-bold text-red-400">📍 Referencia: {selectedPlazaCoords.label}</p>
                    <p>Lat: {selectedPlazaCoords.lat} | Lng: {selectedPlazaCoords.lng}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA 2: MIS POSTULACIONES */}
        {activeTab === 'postulaciones' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-black text-[#003057]">Mis Postulaciones Laborales</h2>
              <p className="text-sm text-slate-500">Historial completo y seguimiento de las vacantes donde has enviado tu Curriculum Vitae.</p>
            </div>

            <div className="space-y-3 max-w-3xl">
              {plazasAplicadas.map(plaza => (
                <div key={plaza.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md">{plaza.id}</span>
                    <h3 className="text-lg font-black text-[#003057] mt-1">{plaza.title}</h3>
                    <p className="text-xs font-bold text-slate-400">{plaza.company} • 📍 {plaza.fullLocation}</p>
                    <p className="text-xs font-bold text-emerald-600 mt-1">Sueldo Postulado: {plaza.salaryLabel}</p>
                  </div>
                  
                  <div className="flex sm:flex-col items-end justify-between gap-2 border-t sm:border-0 pt-2 sm:pt-0">
                    <span className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 font-black text-xs rounded-full">⏳ En Revisión</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PESTAÑA 3: MI PERFIL PROFESIONAL (BOTÓN PARA SUBIR CV INTEGRADO) */}
        {activeTab === 'perfil' && (
          <div className="max-w-2xl bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200/60">
            <h2 className="text-2xl font-black text-[#003057] mb-2">Editar Datos de Postulante</h2>
            <p className="text-xs text-slate-400 uppercase font-black tracking-wider mb-6">Configura tu perfil para que sea filtrable en los municipios de cobertura corporativa.</p>

            <form onSubmit={handleSavePerfil} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nombre Completo</label>
                  <input type="text" required value={perfil.name} onChange={(e) => setPerfil({ ...perfil, name: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Carnet Universitario</label>
                  <input type="text" required readOnly value={perfil.carnet} className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl outline-none text-sm font-mono text-slate-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Número de Teléfono</label>
                  <input type="text" required value={perfil.phone} onChange={(e) => setPerfil({ ...perfil, phone: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">📍 Municipio de Residencia</label>
                  <select value={perfil.location} onChange={(e) => setPerfil({ ...perfil, location: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-bold text-slate-600">
                    <option value="Guatemala">Guatemala (Sede Central / Capital)</option>
                    <option value="Mixco">Mixco</option>
                    <option value="Villa Nueva">Villa Nueva</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Carrera Universitaria</label>
                <input type="text" required value={perfil.career} onChange={(e) => setPerfil({ ...perfil, career: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-medium" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Presentación Profesional</label>
                <textarea rows={4} required value={perfil.biography} onChange={(e) => setPerfil({ ...perfil, biography: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-medium resize-none leading-relaxed" />
              </div>

              {/* CONTENEDOR EXCLUSIVO: GESTIÓN Y SUBIDA DE ARCHIVO CV */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-400">📄 Archivo CV Actual:</span>
                  <span className="font-mono text-[#003057] bg-white px-2 py-1 rounded border border-slate-100">{perfil.cvName}</span>
                </div>
                
                <div>
                  <label className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border-2 border-dashed border-[#003057]/30 hover:border-[#003057] bg-white text-[#003057] font-bold text-xs rounded-xl cursor-pointer transition-all active:scale-[0.99] text-center shadow-sm">
                    <span>📤 Subir Nuevo Archivo PDF</span>
                    <input 
                      type="file" 
                      accept=".pdf" 
                      onChange={handleFileChange} 
                      className="hidden" 
                    />
                  </label>
                  <p className="text-[10px] text-slate-400 text-center mt-1 font-medium">Solo se admiten documentos en formato institucional (.pdf)</p>
                </div>
              </div>

              <div className="pt-2">
                <button type="submit" className="w-full py-3 bg-[#003057] hover:bg-[#00223f] text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-[0.97]">
                  💾 Guardar Cambios en la Cuenta
                </button>
              </div>
            </form>
          </div>
        )}

      </section>
    </main>
  );
}