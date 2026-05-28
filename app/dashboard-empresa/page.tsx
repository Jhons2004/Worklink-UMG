'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Base de datos de estudiantes (incluyendo biografías fijas y nombres de archivos CV)
const INITIAL_STUDENTS = [
  { id: 1, name: 'Carlos Mendoza', career: 'Ingeniería en Sistemas de Información', carnet: '0901-21-4321', phone: '5544-3322', biography: 'Estudiante de octavo ciclo apasionado por el desarrollo web y las bases de datos relacionales. Busco oportunidad como desarrollador junior.', cvName: 'Carlos_Mendoza_CV.pdf', avatar: '👨‍💻', location: 'Guatemala' },
  { id: 2, name: 'Ana García', career: 'Licenciatura en Administración', carnet: '0901-20-8877', phone: '4433-2211', biography: 'Enfoque en control financiero, gestión de presupuestos y desarrollo de talento humano. Experiencia organizada en entornos comerciales.', cvName: 'Ana_Garcia_Contable.pdf', avatar: '👩‍💼', location: 'Mixco' },
  { id: 3, name: 'Luis Pérez', career: 'Ingeniería en Sistemas de Información', carnet: '0901-19-5544', phone: '3322-1100', biography: 'Desarrollador backend junior con dominio de Python, Django y despliegues básicos en la nube. Proactivo y autodidacta.', cvName: 'Luis_Perez_Backend.pdf', avatar: '👨‍💻', location: 'Villa Nueva' }
];

// Base de datos inicial de las plazas con coordenadas simuladas
const INITIAL_PLAZAS = [
  { id: 'PLZ-01', title: 'Desarrollador Web Junior', type: 'Híbrido', salary: 'Q8,500', location: 'Guatemala (Zona 10)', coords: '14.6033, -90.5167', description: 'Buscamos estudiante de Sistemas para apoyar en el mantenimiento de aplicaciones en React y Node.js.', applicantsIds: [1, 3] },
  { id: 'PLZ-02', title: 'Asistente de Recursos Humanos / Administración', type: 'Tiempo Completo', salary: 'Q6,000', location: 'Mixco (San Cristóbal)', coords: '14.6333, -90.6000', description: 'Apoyo en el proceso de reclutamiento universitario, inducción de personal y control de expedientes.', applicantsIds: [2] },
];

export default function EmployerDashboard() {
  const [activeTab, setActiveTab] = useState<'aspirantes' | 'publicar' | 'mis-plazas'>('aspirantes');
  
  // Estados de los filtros de alumnos
  const [searchName, setSearchName] = useState('');
  const [searchCareer, setSearchCareer] = useState('');
  const [filterLocation, setFilterLocation] = useState('');

  const [estudiantes, setEstudiantes] = useState(INITIAL_STUDENTS);
  const [plazas, setPlazas] = useState(INITIAL_PLAZAS);
  const [selectedPlazaId, setSelectedPlazaId] = useState<string | null>(null);

  // ESTADO DEL FORMULARIO EXTENDIDO CON COORDENADAS DEL MAPA
  const [formPlaza, setFormPlaza] = useState({ 
    title: '', 
    salary: '', 
    type: 'Tiempo Completo', 
    location: 'Guatemala (Centro)', 
    coords: '14.6133, -90.5367',
    description: '' 
  });

  const [mapPin, setMapPin] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const savedStudentData = localStorage.getItem('umg_shared_student_profile');
    if (savedStudentData) {
      const parsedData = JSON.parse(savedStudentData);
      setEstudiantes(prev => prev.map(est => est.id === 1 ? { ...est, ...parsedData } : est));
    }
  }, [activeTab]);

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setMapPin({ x, y });

    const lat = (14.5500 + (100 - y) * 0.0015).toFixed(4);
    const lng = (-90.6500 + x * 0.002).toFixed(4);

    let detectedLocation = "Ubicación Personalizada";
    if (x < 40 && y < 50) {
      detectedLocation = "Mixco (Área Norte)";
    } else if (x < 40 && y >= 50) {
      detectedLocation = "Mixco (San Cristóbal)";
    } else if (x >= 40 && x < 70 && y < 60) {
      detectedLocation = "Guatemala (Zona Central)";
    } else if (x >= 40 && x < 70 && y >= 60) {
      detectedLocation = "Guatemala (Zona Sur / Petapa)";
    } else {
      detectedLocation = "Villa Nueva / Carretera al Pacífico";
    }

    setFormPlaza(prev => ({ ...prev, location: detectedLocation, coords: `${lat}, ${lng}` }));
  };

  const handleCreatePlaza = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPlaza.title || !formPlaza.salary || !formPlaza.description) return;

    const nuevaVacante = {
      id: `PLZ-0${plazas.length + 1}`,
      title: formPlaza.title,
      type: formPlaza.type,
      salary: `Q${parseInt(formPlaza.salary).toLocaleString()}`,
      location: formPlaza.location,
      coords: formPlaza.coords, 
      description: formPlaza.description,
      applicantsIds: []
    };

    setPlazas([nuevaVacante, ...plazas]);
    setFormPlaza({ title: '', salary: '', type: 'Tiempo Completo', location: 'Guatemala (Centro)', coords: '14.6133, -90.5367', description: '' });
    setMapPin({ x: 50, y: 50 });
    setActiveTab('mis-plazas');
    alert(`¡Plaza Publicada! Geolocalizada exitosamente en las coordenadas: ${nuevaVacante.coords}`);
  };

  const estudiantesFiltrados = estudiantes.filter(est => {
    const matchesNombre = est.name.toLowerCase().includes(searchName.toLowerCase());
    const matchesCarrera = est.career.toLowerCase().includes(searchCareer.toLowerCase());
    const matchesUbicacion = filterLocation === '' || est.location.toLowerCase().includes(filterLocation.toLowerCase());
    return matchesNombre && matchesCarrera && matchesUbicacion;
  });

  const plazaSeleccionada = plazas.find(p => p.id === selectedPlazaId);
  const postulantesEspecificos = plazaSeleccionada
    ? estudiantes.filter(est => plazaSeleccionada.applicantsIds.includes(est.id))
    : [];

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-700 font-sans">
      
      {/* SIDEBAR CORPORATIVO */}
      <aside className="w-full md:w-64 bg-[#003057] text-white flex flex-col p-6 z-20 shadow-xl md:sticky md:top-0 md:h-screen">
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/10">
          <Image src="/logoumg.png" alt="Logo UMG" width={45} height={45} className="object-contain" />
          <div>
            <h1 className="font-black text-sm tracking-tight">WorkLink <span className="text-red-500">UMG</span></h1>
            <p className="text-[10px] opacity-60 font-bold uppercase">Panel Empresa</p>
          </div>
        </div>

        <div className="mb-6 p-3 bg-white/5 rounded-xl text-left border border-white/10">
          <p className="font-bold text-[10px] text-red-400 uppercase tracking-wider">Empresa Autenticada</p>
          <p className="font-extrabold text-sm text-white truncate">Corporación Multi-TI S.A.</p>
        </div>

        <nav className="flex-1 space-y-2">
          <button onClick={() => { setActiveTab('aspirantes'); setSelectedPlazaId(null); }} className={`w-full text-left px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95 ${activeTab === 'aspirantes' ? 'bg-red-600 text-white shadow-lg' : 'hover:bg-white/10 text-white/80'}`}>👥 Banco de Talentos</button>
          <button onClick={() => { setActiveTab('publicar'); setSelectedPlazaId(null); }} className={`w-full text-left px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95 ${activeTab === 'publicar' ? 'bg-red-600 text-white shadow-lg' : 'hover:bg-white/10 text-white/80'}`}>📢 Publicar Plaza</button>
          <button onClick={() => { setActiveTab('mis-plazas'); setSelectedPlazaId(null); }} className={`w-full text-left px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95 ${activeTab === 'mis-plazas' ? 'bg-red-600 text-white shadow-lg' : 'hover:bg-white/10 text-white/80'}`}>📋 Mis Publicaciones</button>
        </nav>
        <Link href="/" className="mt-auto pt-4 border-t border-white/10 text-xs font-bold text-red-400">❌ Salir del Portal</Link>
      </aside>

      {/* ÁREA DE CONTENIDO CENTRAL */}
      <section className="flex-1 p-6 md:p-10 max-w-5xl mx-auto w-full overflow-y-auto">
        
        {/* PESTAÑA 1: BANCO DE TALENTOS */}
        {activeTab === 'aspirantes' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-black text-[#003057]">Banco de Alumnos UMG</h2>
              <p className="text-sm text-slate-500">Filtrado selectivo por datos demográficos, académicos y revisión de Curriculum Vitae.</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1">Buscar por Nombre</label>
                <input type="text" placeholder="ej. Carlos..." value={searchName} onChange={(e) => setSearchName(e.target.value)} className="w-full text-sm outline-none bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-700 font-medium" />
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1">Buscar por Carrera</label>
                <input type="text" placeholder="ej. Ingeniería..." value={searchCareer} onChange={(e) => setSearchCareer(e.target.value)} className="w-full text-sm outline-none bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-700 font-medium" />
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1">📍 Ubicación Alumno</label>
                <select value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)} className="w-full text-sm outline-none bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-600 font-bold">
                  <option value="">Todas las ubicaciones</option>
                  <option value="Guatemala">Guatemala</option>
                  <option value="Mixco">Mixco</option>
                  <option value="Villa Nueva">Villa Nueva</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {estudiantesFiltrados.map(est => (
                <div key={est.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 transition-all hover:shadow-md">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-xl shrink-0">{est.avatar}</div>
                      <div>
                        <h3 className="text-xl font-extrabold text-[#003057]">{est.name}</h3>
                        <p className="text-xs font-black text-red-600 uppercase mt-0.5">{est.career} • Carnet: {est.carnet}</p>
                        <p className="text-xs text-slate-400 font-bold mt-1">📍 Municipio: {est.location} • 📞 Tel: {est.phone}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">Sobre el estudiante:</p>
                    <p className="text-sm text-slate-600 font-medium italic">"{est.biography || 'El alumno no ha redactado una descripción de perfil todavía.'}"</p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs font-bold">
                    <div className="flex items-center gap-2 text-slate-400">
                      <span className="text-lg">📄</span>
                      <span className="font-mono text-[11px] text-[#003057]">{est.cvName}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button onClick={() => alert(`[Visualizador de Documentos]\nAriendo vista previa en línea para: ${est.cvName}`)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#003057] rounded-xl transition-all active:scale-95">👁️ Ver CV</button>
                      <button onClick={() => alert(`[Descarga Iniciada]\nSe ha descargado el archivo "${est.cvName}".`)} className="px-4 py-2 bg-[#003057] hover:bg-[#00223f] text-white rounded-xl shadow-sm transition-all active:scale-95">📥 Descargar CV</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PESTAÑA 2: FORMULARIO PUBLICAR PLAZA */}
        {activeTab === 'publicar' && (
          <div className="max-w-2xl bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200/60">
            <h2 className="text-2xl font-black text-[#003057] mb-2">Publicar Nueva Vacante</h2>
            <form onSubmit={handleCreatePlaza} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Título de la Plaza</label>
                <input type="text" required placeholder="ej. Desarrollador Front-End..." value={formPlaza.title} onChange={(e) => setFormPlaza({ ...formPlaza, title: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-medium" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Presupuesto Salarial (Q)</label>
                  <input type="number" required placeholder="ej. 8500" value={formPlaza.salary} onChange={(e) => setFormPlaza({ ...formPlaza, salary: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Modalidad</label>
                  <select value={formPlaza.type} onChange={(e) => setFormPlaza({ ...formPlaza, type: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-bold text-slate-600">
                    <option value="Tiempo Completo">Tiempo Completo</option>
                    <option value="Medio Tiempo">Medio Tiempo</option>
                    <option value="Híbrido">Híbrido / Remoto</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">🗺️ Ubicación Geográfica</label>
                <div onClick={handleMapClick} className="w-full h-48 bg-sky-100 rounded-2xl border border-slate-300 relative overflow-hidden cursor-crosshair shadow-inner" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '16px 16px' }}>
                  <div className="absolute transition-all duration-300 ease-out z-20 flex flex-col items-center" style={{ left: `${mapPin.x}%`, top: `${mapPin.y}%`, transform: 'translate(-50%, -100%)' }}>
                    <span className="text-3xl filter drop-shadow-md animate-bounce">📍</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <input type="text" readOnly value={formPlaza.location} className="w-full px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-[#003057]" />
                  <input type="text" readOnly value={formPlaza.coords} className="w-full px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono text-slate-500" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Descripción del Trabajo</label>
                <textarea rows={3} required placeholder="Describe las responsabilidades..." value={formPlaza.description} onChange={(e) => setFormPlaza({ ...formPlaza, description: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-medium resize-none" />
              </div>
              <button type="submit" className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-[0.97]">🚀 Lanzar Vacante en la Red UMG</button>
            </form>
          </div>
        )}

        {/* PESTAÑA 3: MIS PUBLICACIONES (CON LOS NUEVOS BOTONES DE ACCIÓN PARA POSTULANTES) */}
        {activeTab === 'mis-plazas' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-black text-[#003057]">Control de Ofertas Publicadas</h2>
              <p className="text-sm text-slate-500">Plazas activas creadas por <span className="font-extrabold text-[#003057]">Corporación Multi-TI S.A.</span>.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {plazas.map(plaza => (
                <div key={plaza.id} onClick={() => setSelectedPlazaId(plaza.id)} className={`p-5 rounded-2xl border transition-all cursor-pointer relative active:scale-[0.99] ${selectedPlazaId === plaza.id ? 'bg-red-50 border-red-400 shadow-md ring-1 ring-red-400' : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'}`}>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md">{plaza.id}</span>
                  <h3 className="text-lg font-bold text-[#003057] mt-1.5">{plaza.title}</h3>
                  <p className="text-xs font-bold text-red-600 mb-1">Oferta: {plaza.salary} | Modo: {plaza.type}</p>
                  <p className="text-xs font-bold text-slate-400 mb-2">📍 Mapa: <span className="text-[#003057]">{plaza.location}</span></p>
                  <div className="flex justify-between items-center border-t border-slate-100 pt-2">
                    <span className="text-xs font-bold text-slate-400">👥 {plaza.applicantsIds.length} postulados</span>
                    <button className={`text-xs font-black px-3 py-1.5 rounded-lg transition-all ${selectedPlazaId === plaza.id ? 'bg-red-600 text-white shadow-sm' : 'bg-slate-100 text-[#003057]'}`}>{selectedPlazaId === plaza.id ? 'Viendo' : 'Ver Lista →'}</button>
                  </div>
                </div>
              ))}
            </div>

            {/* SECCIÓN DETALLE: BOTONES NUEVOS AGREGADOS "VER CV" Y "ACEPTAR" */}
            {selectedPlazaId && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-red-100 mt-6 animate-fadeIn">
                <div className="border-b border-slate-100 pb-4 mb-4 flex justify-between items-center">
                  <div>
                    <h4 className="text-lg font-black text-[#003057]">Postulantes para: <span className="text-red-600">{plazaSeleccionada?.title}</span></h4>
                    <p className="text-xs text-slate-400 font-medium">Gestiona y evalúa los perfiles académicos adjuntos.</p>
                  </div>
                  <button onClick={() => setSelectedPlazaId(null)} className="text-xs font-bold text-slate-400 hover:text-slate-600">✕ Cerrar</button>
                </div>

                <div className="space-y-3">
                  {postulantesEspecificos.length > 0 ? (
                    postulantesEspecificos.map(postulante => (
                      <div key={postulante.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                        <div>
                          <p className="font-extrabold text-[#003057] text-sm">{postulante.name}</p>
                          <p className="text-xs font-bold text-red-600">{postulante.career}</p>
                          <p className="text-xs text-slate-400 mt-1">📍 Residencia: {postulante.location} | Tel: {postulante.phone}</p>
                        </div>
                        
                        {/* REQUERIMIENTO: BOTONES INTERACTIVOS SIN ALTERAR EL FLUJO */}
                        <div className="flex items-center gap-2 border-t sm:border-0 pt-2 sm:pt-0 justify-end">
                          {/* Ver CV del alumno */}
                          <button 
                            onClick={() => alert(`[WorkLink UMG - Visor PDF]\n\nAriendo visor del archivo adjunto:\n📁 ${postulante.cvName}\n\nConectado al buzón de almacenamiento institucional.`)} 
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#003057] font-bold text-xs rounded-lg active:scale-95 transition-all shadow-sm border border-slate-200"
                          >
                            👁️ Ver CV
                          </button>

                          {/* Aceptar al alumno en la plaza */}
                          <button 
                            onClick={() => alert(`¡Felicitaciones!\n\nHas ACEPTADO formalmente al estudiante "${postulante.name}" para la vacante "${plazaSeleccionada?.title}".\n\nSe enviará una alerta automática a su Portal de Estudiante.`)} 
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-lg active:scale-95 transition-all shadow-md"
                          >
                            ✅ Aceptar Postulante
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-xs font-bold text-slate-400 py-6">Esta plaza no registra aplicaciones de estudiantes por el momento.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

      </section>
    </main>
  );
}