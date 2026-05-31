'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Toaster, toast } from 'react-hot-toast';
import dynamic from 'next/dynamic';

const LocationMap = dynamic(() => import('@/components/LocationMap'), { ssr: false });

export default function StudentDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'perfil' | 'empleos' | 'postulaciones'>('empleos');

  // Filtros de búsqueda
  const [filterText, setFilterText] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterMaxSalary, setFilterMaxSalary] = useState(12000);
  const [filterDistance, setFilterDistance] = useState(15);
  const [hasLocation, setHasLocation] = useState(true);

  // Perfil del estudiante
  const [perfil, setPerfil] = useState({
    name: 'Cargando...',
    career: 'Ingeniería en Sistemas de Información',
    carnet: '',
    phone: '',
    biography: '',
    aptitudes: '',
    location: 'Guatemala',
    coords: '14.6133, -90.5367',
    cvName: 'Sin_CV.pdf'
  });
  
  const [cvFile, setCvFile] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [plazas, setPlazas] = useState<any[]>([]);
  const [selectedPlazaCoords, setSelectedPlazaCoords] = useState({ lat: '14.6033', lng: '-90.5167', label: 'Guatemala (Zona 10)', title: 'Desarrollador Web Junior' });
  const [appliedPlazasIds, setAppliedPlazasIds] = useState<string[]>([]);
  const [applicationsList, setApplicationsList] = useState<any[]>([]);
  const [token, setToken] = useState<string | null>(null);

  // Carga inicial y redirección si no hay sesión
  useEffect(() => {
    const savedToken = localStorage.getItem('worklink_token');
    const role = localStorage.getItem('worklink_role');
    
    if (!savedToken || role !== 'estudiante') {
      localStorage.clear();
      router.push('/login');
      return;
    }
    
    setToken(savedToken);
  }, [router]);

  // Carga de datos reales cuando se obtiene el Token JWT
  useEffect(() => {
    if (!token) return;

    // 1. Obtener perfil
    const fetchProfile = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          const lat = data.profile.latitude;
          if (lat === null) setHasLocation(false);
          else setHasLocation(true);

          let locationStr = 'Guatemala';
          if (lat === 14.6333) locationStr = 'Mixco';
          else if (lat === 14.5264) locationStr = 'Villa Nueva';

          setPerfil({
            name: data.profile.name,
            career: data.profile.career || 'Ingeniería en Sistemas de Información',
            carnet: data.profile.carnet,
            phone: data.profile.phone || '',
            biography: data.profile.biography || '',
            aptitudes: data.profile.aptitudes || '',
            location: locationStr,
            coords: `${lat || 14.6133}, ${data.profile.longitude || -90.5367}`,
            cvName: data.profile.cv_url || 'Sin_CV.pdf'
          });
        }
      } catch (err) {
        console.error('Error al cargar perfil:', err);
      }
    };

    // 2. Obtener postulaciones reales
    const fetchApplications = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/applications/my-applications', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setAppliedPlazasIds(data.map((app: any) => app.job_opening_id));
          setApplicationsList(data);
        }
      } catch (err) {
        console.error('Error al cargar postulaciones:', err);
      }
    };

    fetchProfile();
    fetchApplications();
  }, [token]);

  // Carga de vacantes según distancia
  useEffect(() => {
    if (!token) return;
    const fetchJobs = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/jobs/nearby?radius_km=${filterDistance}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          const mapped = data.map((j: any) => ({
            id: j.id,
            company: j.company_name,
            title: j.title,
            type: j.type,
            salary: j.salary,
            salaryLabel: `Q${parseInt(j.salary).toLocaleString()}`,
            location: j.location_name,
            fullLocation: `${j.location_name} (${(j.distance_meters / 1000).toFixed(1)} km de ti)`,
            coords: `${j.latitude}, ${j.longitude}`,
            description: j.description
          }));
          
          setPlazas(mapped);
          
          if (mapped.length > 0) {
            const first = mapped[0];
            setSelectedPlazaCoords({
              lat: first.coords.split(', ')[0],
              lng: first.coords.split(', ')[1],
              label: first.fullLocation,
              title: first.title
            });
          }
        }
      } catch (err) {
        console.error('Error al cargar vacantes:', err);
      }
    };
    fetchJobs();
  }, [token, filterDistance]);

  const handleLocationSelect = (lat: number, lng: number) => {
    setPerfil(prev => ({ 
      ...prev, 
      location: 'Ubicación seleccionada en Mapa', 
      coords: `${lat.toFixed(4)}, ${lng.toFixed(4)}` 
    }));
  };

  // Manejador de GPS Actual
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('La geolocalización no es soportada por tu navegador');
      return;
    }
    const toastId = toast.loading('Obteniendo coordenadas GPS...');
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        const res = await fetch('http://localhost:8000/api/profile/student', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ latitude, longitude })
        });
        if (res.ok) {
          setHasLocation(true);
          toast.success('¡Ubicación de estudiante actualizada correctamente!', { id: toastId });
          setFilterDistance(filterDistance === 15 ? 15.01 : 15); // Forzar recarga de vacantes
        } else {
          toast.error('Error al guardar en el servidor', { id: toastId });
        }
      } catch (err) {
        console.error(err);
        toast.error('Error de red', { id: toastId });
      }
    }, () => {
      toast.error('No se pudo obtener la ubicación. Asegúrate de dar permisos.', { id: toastId });
    });
  };

  // Manejador de Guardar Perfil
  const handleSavePerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsSubmitting(true);
    const toastId = toast.loading('Guardando perfil y georreferencia...');

    const [latStr, lngStr] = perfil.coords.split(', ');
    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);

    try {
      // 1. Subir CV si se seleccionó uno nuevo
      let updatedCvName = perfil.cvName;
      if (cvFile) {
        const formData = new FormData();
        formData.append('file', cvFile);
        const resFile = await fetch('http://localhost:8000/api/profile/student/upload-cv', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
        if (resFile.ok) {
          const fileData = await resFile.json();
          updatedCvName = fileData.cv_url;
        } else {
          toast.error('Error al subir el archivo PDF', { id: toastId });
          setIsSubmitting(false);
          return;
        }
      }

      // 2. Guardar el resto del perfil
      const res = await fetch('http://localhost:8000/api/profile/student', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: perfil.name,
          phone: perfil.phone,
          biography: perfil.biography,
          aptitudes: perfil.aptitudes,
          cvName: updatedCvName,
          latitude: lat,
          longitude: lng
        })
      });

      if (res.ok) {
        toast.success('¡Perfil, CV y georreferencia actualizados!', { id: toastId });
        setHasLocation(true);
        setPerfil(prev => ({ ...prev, cvName: updatedCvName }));
        
        // Recargar vacantes cercanas
        const resJobs = await fetch(`http://localhost:8000/api/jobs/nearby?radius_km=${filterDistance}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await resJobs.json();
        if (resJobs.ok) {
          const mapped = data.map((j: any) => ({
            id: j.id,
            company: j.company_name,
            title: j.title,
            type: j.type,
            salary: j.salary,
            salaryLabel: `Q${parseInt(j.salary).toLocaleString()}`,
            location: j.location_name,
            fullLocation: `${j.location_name} (${(j.distance_meters / 1000).toFixed(1)} km de ti)`,
            coords: `${j.latitude}, ${j.longitude}`,
            description: j.description
          }));
          setPlazas(mapped);
        }
      } else {
        toast.error('Error al guardar el perfil.', { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error('Error de red al guardar el perfil.', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejador de Postularse a una Plaza
  const handleApplyPlaza = async (id: string) => {
    if (!token) return;
    if (appliedPlazasIds.includes(id)) return;

    try {
      const toastId = toast.loading('Enviando postulación...');
      const res = await fetch('http://localhost:8000/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ job_opening_id: id })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('🚀 ¡Tu CV ha sido enviado directamente al buzón de la empresa!', { id: toastId });
        setAppliedPlazasIds([...appliedPlazasIds, id]);
        
        // Recargar postulaciones
        const resApps = await fetch('http://localhost:8000/api/applications/my-applications', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const appsData = await resApps.json();
        if (resApps.ok) {
          setApplicationsList(appsData);
        }
      } else {
        toast.error(`Error al postularse: ${data.detail}`, { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error('Error de red al registrar postulación.');
    }
  };

  // Manejo del archivo CV
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCvFile(file);
      setPerfil(prev => ({ ...prev, cvName: file.name }));
      toast.success(`📁 Archivo "${file.name}" seleccionado. Haz clic en "Guardar Cambios" para subirlo.`);
    }
  };

  // Cerrar sesión
  const handleLogout = () => {
    localStorage.clear();
    router.push('/');
  };

  // Lógica de filtrado en el frontend
  const plazasFiltradas = plazas.filter(p => {
    const matchesTexto = p.title.toLowerCase().includes(filterText.toLowerCase()) || p.company.toLowerCase().includes(filterText.toLowerCase());
    const matchesUbicacion = filterLocation === '' || p.location.toLowerCase() === filterLocation.toLowerCase();
    const matchesSalario = p.salary <= filterMaxSalary;

    return matchesTexto && matchesUbicacion && matchesSalario;
  });

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-700 font-sans">
      <Toaster position="top-right" />
      
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
          <p className="text-[11px] text-slate-300 truncate">📍 Municipio: {perfil.location}</p>
          {!hasLocation && (
            <button onClick={handleGetLocation} className="mt-3 w-full py-2 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase rounded-lg transition-all">
              📍 Obtener Ubicación Actual
            </button>
          )}
        </div>

        <nav className="flex-1 space-y-2">
          <button onClick={() => setActiveTab('empleos')} className={`w-full text-left px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95 ${activeTab === 'empleos' ? 'bg-red-600 text-white shadow-lg' : 'hover:bg-white/10 text-white/80'}`}>💼 Vacantes Disponibles</button>
          <button onClick={() => setActiveTab('postulaciones')} className={`w-full text-left px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95 ${activeTab === 'postulaciones' ? 'bg-red-600 text-white shadow-lg' : 'hover:bg-white/10 text-white/80'}`}>🎯 Mis Postulaciones ({appliedPlazasIds.length})</button>
          <button onClick={() => setActiveTab('perfil')} className={`w-full text-left px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95 ${activeTab === 'perfil' ? 'bg-red-600 text-white shadow-lg' : 'hover:bg-white/10 text-white/80'}`}>👤 Mi Perfil Profesional</button>
        </nav>
        
        <button onClick={handleLogout} className="mt-auto pt-4 border-t border-white/10 text-left text-xs font-bold text-red-400">❌ Cerrar Sesión</button>
      </aside>

      {/* CONTENIDO CENTRAL */}
      <section className="flex-1 p-6 md:p-10 max-w-6xl mx-auto w-full overflow-y-auto">
        
        {/* PESTAÑA 1: VACANTES DISPONIBLES */}
        {activeTab === 'empleos' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-black text-[#003057]">Bolsa de Trabajo Universitaria</h2>
              <p className="text-sm text-slate-500">Vacantes cercanas a ti filtradas mediante coordenadas PostGIS en un radio de 15km.</p>
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
                  <label className="text-[10px] font-black text-slate-400 uppercase">📍 Radio de Búsqueda</label>
                  <span className="text-xs font-black text-[#003057]">{Math.round(filterDistance)} km</span>
                </div>
                <input 
                  type="range" min="1" max="50" step="1" value={filterDistance}
                  onChange={(e) => setFilterDistance(parseFloat(e.target.value))}
                  className="w-full accent-[#003057] h-2 bg-slate-100 rounded-lg cursor-pointer"
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
                  <p className="text-center text-xs font-bold text-slate-400 py-10 bg-white rounded-2xl border border-slate-200">No hay vacantes cercanas en el rango geoespacial seleccionado.</p>
                )}
              </div>

              {/* MAPA GEOGRÁFICO REAL */}
              <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm sticky top-24 space-y-3">
                <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
                  <h4 className="text-sm font-black text-[#003057]">🌐 Georreferencia de Empleos UMG</h4>
                </div>

                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <p className="text-[10px] font-black uppercase text-red-600">Visualizando Oferta:</p>
                  <p className="text-xs font-extrabold text-[#003057] truncate">{selectedPlazaCoords.title}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">📍 {selectedPlazaCoords.label}</p>
                </div>

                <div className="w-full h-64" key={`${selectedPlazaCoords.lat}-${selectedPlazaCoords.lng}`}>
                  <LocationMap
                    initialLat={parseFloat(selectedPlazaCoords.lat)}
                    initialLng={parseFloat(selectedPlazaCoords.lng)}
                    onLocationSelect={() => {}}
                    readOnly={true}
                  />
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
              <p className="text-sm text-slate-500">Historial completo y seguimiento en tiempo real de tu proceso de postulación laboral.</p>
            </div>

            <div className="space-y-3 max-w-3xl">
              {applicationsList.map(app => (
                <div key={app.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md">{app.id.slice(0, 8)}</span>
                    <h3 className="text-lg font-black text-[#003057] mt-1">{app.job_title}</h3>
                    <p className="text-xs font-bold text-slate-400">{app.job_company} • 📍 {app.job_location}</p>
                    <p className="text-xs font-bold text-emerald-600 mt-1">Sueldo Postulado: {app.job_salary}</p>
                  </div>
                  
                  <div className="flex sm:flex-col items-end justify-between gap-2 border-t sm:border-0 pt-2 sm:pt-0">
                    <span className={`px-3 py-1 border text-xs font-black rounded-full ${
                      app.status === 'ACEPTADA' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                      app.status === 'RECHAZADA' ? 'bg-red-50 border-red-200 text-red-700' :
                      app.status === 'EN_REVISION' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                      'bg-slate-50 border-slate-200 text-slate-600'
                    }`}>
                      {app.status === 'ACEPTADA' ? '✅ Aceptado' :
                       app.status === 'RECHAZADA' ? '❌ Rechazado' :
                       app.status === 'EN_REVISION' ? '⏳ En Revisión' :
                       '📩 Enviado'}
                    </span>
                  </div>
                </div>
              ))}

              {applicationsList.length === 0 && (
                <p className="text-center text-xs font-bold text-slate-400 py-10 bg-white rounded-2xl border border-slate-200">No registras postulaciones activas actualmente.</p>
              )}
            </div>
          </div>
        )}

        {/* PESTAÑA 3: MI PERFIL PROFESIONAL */}
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
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">📍 Ubicación Geográfica</label>
                  <div className="w-full h-40">
                    <LocationMap 
                      initialLat={parseFloat(perfil.coords.split(', ')[0])} 
                      initialLng={parseFloat(perfil.coords.split(', ')[1])} 
                      onLocationSelect={handleLocationSelect} 
                    />
                  </div>
                  <input type="text" readOnly value={perfil.location} className="w-full px-3 py-1.5 mt-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-[#003057]" />
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

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Aptitudes (separadas por coma)</label>
                <textarea rows={2} value={perfil.aptitudes} onChange={(e) => setPerfil({ ...perfil, aptitudes: e.target.value })} placeholder="Ej. React, Python, Liderazgo, PostgreSQL" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-medium resize-none leading-relaxed" />
              </div>

              {/* GESTIÓN Y SUBIDA DE ARCHIVO CV */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-400">📄 Archivo CV Actual:</span>
                  <span className="font-mono text-[#003057] bg-white px-2 py-1 rounded border border-slate-100">{perfil.cvName.includes('/uploads/') ? '📄 CV Guardado' : perfil.cvName}</span>
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
                <button disabled={isSubmitting} type="submit" className={`w-full py-3 text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-[0.97] ${isSubmitting ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#003057] hover:bg-[#00223f]'}`}>
                  {isSubmitting ? '⏳ Guardando y Actualizando...' : '💾 Guardar Cambios en la Cuenta'}
                </button>
              </div>
            </form>
          </div>
        )}

      </section>
    </main>
  );
}