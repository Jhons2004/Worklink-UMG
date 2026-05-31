'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Toaster, toast } from 'react-hot-toast';
import dynamic from 'next/dynamic';

const LocationMap = dynamic(() => import('@/components/LocationMap'), { ssr: false });

export default function EmployerDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'aspirantes' | 'publicar' | 'mis-plazas'>('aspirantes');
  
  // Estados de los filtros de alumnos
  const [searchName, setSearchName] = useState('');
  const [searchCareer, setSearchCareer] = useState('');
  const [filterLocation, setFilterLocation] = useState('');

  const [estudiantes, setEstudiantes] = useState<any[]>([]);
  const [plazas, setPlazas] = useState<any[]>([]);
  const [selectedPlazaId, setSelectedPlazaId] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [companyName, setCompanyName] = useState('Cargando...');
  const [token, setToken] = useState<string | null>(null);
  const [hasLocation, setHasLocation] = useState(true);

  // ESTADO DEL FORMULARIO EXTENDIDO CON COORDENADAS DEL MAPA
  const [formPlaza, setFormPlaza] = useState({ 
    title: '', 
    salary: '', 
    type: 'Tiempo Completo', 
    location: 'Guatemala (Centro)', 
    coords: '14.6133, -90.5367',
    description: '' 
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Carga inicial y redirección si no hay sesión
  useEffect(() => {
    const savedToken = localStorage.getItem('worklink_token');
    const role = localStorage.getItem('worklink_role');
    
    if (!savedToken || role !== 'empresa') {
      localStorage.clear();
      router.push('/registro-empresa');
      return;
    }
    
    setToken(savedToken);
  }, [router]);

  // Cargar datos de la API cuando el token esté disponible
  useEffect(() => {
    if (!token) return;

    // 1. Obtener perfil de la empresa
    const fetchCompanyProfile = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setCompanyName(data.profile.name);
          if (data.profile.latitude === null) setHasLocation(false);
          else setHasLocation(true);
        }
      } catch (err) {
        console.error('Error al cargar perfil de empresa:', err);
      }
    };

    // 2. Obtener lista de estudiantes (Banco de Talentos)
    const fetchStudents = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/profile/students', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          const mapped = data.map((s: any) => {
            let locationStr = 'Guatemala';
            if (s.latitude === 14.6333) locationStr = 'Mixco';
            else if (s.latitude === 14.5264) locationStr = 'Villa Nueva';

            return {
              id: s.id,
              name: s.name,
              career: s.career || 'Estudiante UMG',
              carnet: s.carnet,
              phone: s.phone || 'N/A',
              biography: s.biography || '',
              cvName: s.cv_url || 'Sin_CV.pdf',
              avatar: '👨‍💻',
              location: locationStr
            };
          });
          setEstudiantes(mapped);
        }
      } catch (err) {
        console.error('Error al cargar estudiantes:', err);
      }
    };

    // 3. Obtener vacantes de la empresa
    const fetchMyJobs = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/jobs/my-jobs', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          const mapped = data.map((j: any) => ({
            id: j.id,
            title: j.title,
            type: j.type,
            salary: `Q${parseInt(j.salary).toLocaleString()}`,
            salary_raw: j.salary,
            location: j.location_name,
            coords: `${j.latitude}, ${j.longitude}`,
            description: j.description,
            applicantsIds: []
          }));
          setPlazas(mapped);
        }
      } catch (err) {
        console.error('Error al cargar vacantes:', err);
      }
    };

    fetchCompanyProfile();
    fetchStudents();
    fetchMyJobs();
  }, [token]);

  // Cargar candidatos cuando se selecciona una vacante
  useEffect(() => {
    if (!token || !selectedPlazaId) {
      setCandidates([]);
      return;
    }

    const fetchCandidates = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/applications/job/${selectedPlazaId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setCandidates(data);
        }
      } catch (err) {
        console.error('Error al cargar candidatos de la plaza:', err);
      }
    };

    fetchCandidates();
  }, [selectedPlazaId, token]);

  const handleLocationSelect = (lat: number, lng: number) => {
    setFormPlaza(prev => ({ 
      ...prev, 
      location: 'Ubicación seleccionada en Mapa', 
      coords: `${lat.toFixed(4)}, ${lng.toFixed(4)}` 
    }));
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('La geolocalización no es soportada por tu navegador');
      return;
    }
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        const res = await fetch('http://localhost:8000/api/profile/company', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ latitude, longitude })
        });
        if (res.ok) {
          setHasLocation(true);
          alert('¡Ubicación de la empresa actualizada correctamente!');
        } else {
          alert('Error al guardar la ubicación en el servidor.');
        }
      } catch (err) {
        console.error(err);
        alert('Error de red al actualizar ubicación.');
      }
    }, () => {
      alert('No se pudo obtener la ubicación. Asegúrate de dar permisos en el navegador.');
    });
  };

  const handleCreatePlaza = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!formPlaza.title || !formPlaza.salary || !formPlaza.description) return;

    setIsSubmitting(true);
    const toastId = toast.loading('Guardando vacante y georreferenciando...');

    const [latStr, lngStr] = formPlaza.coords.split(', ');
    const latitude = parseFloat(latStr);
    const longitude = parseFloat(lngStr);

    try {
      const res = await fetch('http://localhost:8000/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formPlaza.title,
          type: formPlaza.type,
          salary: parseFloat(formPlaza.salary),
          description: formPlaza.description,
          location_name: formPlaza.location,
          latitude: latitude,
          longitude: longitude
        })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(`¡Plaza Publicada! Coordenadas: ${formPlaza.coords}`, { id: toastId });
        setFormPlaza({ title: '', salary: '', type: 'Tiempo Completo', location: 'Guatemala (Centro)', coords: '14.6133, -90.5367', description: '' });
        
        // Recargar vacantes
        const resJobs = await fetch('http://localhost:8000/api/jobs/my-jobs', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const jobsData = await resJobs.json();
        if (resJobs.ok) {
          const mapped = jobsData.map((j: any) => ({
            id: j.id,
            title: j.title,
            type: j.type,
            salary: `Q${parseInt(j.salary).toLocaleString()}`,
            salary_raw: j.salary,
            location: j.location_name,
            coords: `${j.latitude}, ${j.longitude}`,
            description: j.description,
            applicantsIds: []
          }));
          setPlazas(mapped);
        }
        
        setActiveTab('mis-plazas');
      } else {
        toast.error(`Error al publicar plaza: ${data.detail || 'Error desconocido'}`, { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error('Error de red al publicar plaza.', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (applicationId: string, status: string, studentName: string) => {
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:8000/api/applications/status-update/${applicationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        alert(`Estado de postulación de ${studentName} actualizado a: ${status}`);
        
        // Recargar candidatos de la vacante seleccionada
        const resCand = await fetch(`http://localhost:8000/api/applications/job/${selectedPlazaId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await resCand.json();
        if (resCand.ok) {
          setCandidates(data);
        }
      } else {
        const errData = await res.json();
        alert(`Error al actualizar estado: ${errData.detail || 'Error desconocido'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Error de red al actualizar estado.');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/');
  };

  const estudiantesFiltrados = estudiantes.filter(est => {
    const matchesNombre = est.name.toLowerCase().includes(searchName.toLowerCase());
    const matchesCarrera = est.career.toLowerCase().includes(searchCareer.toLowerCase());
    const matchesUbicacion = filterLocation === '' || est.location.toLowerCase().includes(filterLocation.toLowerCase());
    return matchesNombre && matchesCarrera && matchesUbicacion;
  });

  const plazaSeleccionada = plazas.find(p => p.id === selectedPlazaId);

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-700 font-sans">
      <Toaster position="top-right" />
      
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
          <p className="font-extrabold text-sm text-white truncate">{companyName}</p>
          {!hasLocation && (
            <button onClick={handleGetLocation} className="mt-3 w-full py-2 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase rounded-lg transition-all">
              📍 Actualizar Ubicación
            </button>
          )}
        </div>

        <nav className="flex-1 space-y-2">
          <button onClick={() => { setActiveTab('aspirantes'); setSelectedPlazaId(null); }} className={`w-full text-left px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95 ${activeTab === 'aspirantes' ? 'bg-red-600 text-white shadow-lg' : 'hover:bg-white/10 text-white/80'}`}>👥 Banco de Talentos</button>
          <button onClick={() => { setActiveTab('publicar'); setSelectedPlazaId(null); }} className={`w-full text-left px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95 ${activeTab === 'publicar' ? 'bg-red-600 text-white shadow-lg' : 'hover:bg-white/10 text-white/80'}`}>📢 Publicar Plaza</button>
          <button onClick={() => { setActiveTab('mis-plazas'); setSelectedPlazaId(null); }} className={`w-full text-left px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95 ${activeTab === 'mis-plazas' ? 'bg-red-600 text-white shadow-lg' : 'hover:bg-white/10 text-white/80'}`}>📋 Mis Publicaciones</button>
        </nav>
        <button onClick={handleLogout} className="mt-auto pt-4 border-t border-white/10 text-left text-xs font-bold text-red-400">❌ Salir del Portal</button>
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
                      <button onClick={() => alert(`[Visualizador de Documentos]\nAbriendo vista previa en línea para: ${est.cvName}`)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#003057] rounded-xl transition-all active:scale-95">👁️ Ver CV</button>
                      <button onClick={() => alert(`[Descarga Iniciada]\nSe ha descargado el archivo "${est.cvName}".`)} className="px-4 py-2 bg-[#003057] hover:bg-[#00223f] text-white rounded-xl shadow-sm transition-all active:scale-95">📥 Descargar CV</button>
                    </div>
                  </div>
                </div>
              ))}
              {estudiantesFiltrados.length === 0 && (
                <p className="text-center text-xs font-bold text-slate-400 py-10 bg-white rounded-2xl border border-slate-200">No se encontraron estudiantes que coincidan con la búsqueda.</p>
              )}
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
                <div className="w-full h-64">
                  <LocationMap 
                    initialLat={parseFloat(formPlaza.coords.split(', ')[0])} 
                    initialLng={parseFloat(formPlaza.coords.split(', ')[1])} 
                    onLocationSelect={handleLocationSelect} 
                  />
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
              <button disabled={isSubmitting} type="submit" className={`w-full py-3 text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-[0.97] ${isSubmitting ? 'bg-slate-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}>
                {isSubmitting ? '⏳ Guardando y Publicando...' : '🚀 Lanzar Vacante en la Red UMG'}
              </button>
            </form>
          </div>
        )}

        {/* PESTAÑA 3: MIS PUBLICACIONES */}
        {activeTab === 'mis-plazas' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-black text-[#003057]">Control de Ofertas Publicadas</h2>
              <p className="text-sm text-slate-500">Plazas activas creadas por <span className="font-extrabold text-[#003057]">{companyName}</span>.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {plazas.map(plaza => (
                <div key={plaza.id} onClick={() => setSelectedPlazaId(plaza.id)} className={`p-5 rounded-2xl border transition-all cursor-pointer relative active:scale-[0.99] ${selectedPlazaId === plaza.id ? 'bg-red-50 border-red-400 shadow-md ring-1 ring-red-400' : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'}`}>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md">{plaza.id.slice(0, 8)}</span>
                  <h3 className="text-lg font-bold text-[#003057] mt-1.5">{plaza.title}</h3>
                  <p className="text-xs font-bold text-red-600 mb-1">Oferta: {plaza.salary} | Modo: {plaza.type}</p>
                  <p className="text-xs font-bold text-slate-400 mb-2">📍 Mapa: <span className="text-[#003057]">{plaza.location}</span></p>
                  <div className="flex justify-between items-center border-t border-slate-100 pt-2">
                    <span className="text-xs font-bold text-slate-400">👥 {plaza.applicants_count || 0} postulados</span>
                    <button className={`text-xs font-black px-3 py-1.5 rounded-lg transition-all ${selectedPlazaId === plaza.id ? 'bg-red-600 text-white shadow-sm' : 'bg-slate-100 text-[#003057]'}`}>{selectedPlazaId === plaza.id ? 'Viendo' : 'Ver Lista →'}</button>
                  </div>
                </div>
              ))}
              {plazas.length === 0 && (
                <p className="text-center text-xs font-bold text-slate-400 py-10 bg-white rounded-2xl border border-slate-200 col-span-2">No has publicado ninguna plaza todavía.</p>
              )}
            </div>

            {/* SECCIÓN DETALLE: POSTULANTES */}
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
                  {candidates.length > 0 ? (
                    candidates.map(postulante => {
                      const estData = estudiantes.find(e => e.id === postulante.student_id);
                      const loc = estData?.location || 'Guatemala';
                      return (
                        <div key={postulante.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-extrabold text-[#003057] text-sm">{postulante.student_name}</p>
                              <span className={`px-2 py-0.5 border text-[9px] font-black rounded-full ${
                                postulante.status === 'ACEPTADA' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                                postulante.status === 'RECHAZADA' ? 'bg-red-50 border-red-200 text-red-700' :
                                postulante.status === 'EN_REVISION' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                                'bg-slate-50 border-slate-200 text-slate-600'
                              }`}>
                                {postulante.status === 'ACEPTADA' ? '✅ Aceptado' :
                                 postulante.status === 'RECHAZADA' ? '❌ Rechazado' :
                                 postulante.status === 'EN_REVISION' ? '⏳ En Revisión' :
                                 '📩 Enviado'}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-red-600">{postulante.student_career}</p>
                            <p className="text-xs text-slate-400 mt-1">📍 Residencia: {loc} | Tel: {postulante.student_phone || 'N/A'}</p>
                            {postulante.student_aptitudes && (
                              <p className="text-[10px] font-bold text-slate-500 mt-2 bg-slate-100 p-2 rounded-lg">
                                <span className="uppercase text-slate-400 tracking-wider">🌟 Aptitudes:</span> {postulante.student_aptitudes}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 border-t sm:border-0 pt-2 sm:pt-0 justify-end">
                            {postulante.student_cv && postulante.student_cv.includes('/uploads/') ? (
                              <a 
                                href={`http://localhost:8000${postulante.student_cv}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#003057] font-bold text-xs rounded-lg active:scale-95 transition-all shadow-sm border border-slate-200 flex items-center gap-1"
                              >
                                👁️ Ver CV (PDF)
                              </a>
                            ) : (
                              <button 
                                onClick={() => alert(`[Visor PDF Simulado]\n\nAbriendo vista previa de:\n📁 ${postulante.student_cv || 'Sin_CV.pdf'}`)} 
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#003057] font-bold text-xs rounded-lg active:scale-95 transition-all shadow-sm border border-slate-200"
                              >
                                👁️ Ver CV
                              </button>
                            )}
  
                            {postulante.status !== 'ACEPTADA' && (
                              <button 
                                onClick={() => handleUpdateStatus(postulante.id, 'ACEPTADA', postulante.student_name)} 
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-lg active:scale-95 transition-all shadow-md"
                              >
                                ✅ Aceptar Postulante
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
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