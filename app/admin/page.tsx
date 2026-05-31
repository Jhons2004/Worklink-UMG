'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Toaster, toast } from 'react-hot-toast';
import dynamic from 'next/dynamic';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export default function AdminDashboard() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [isLogging, setIsLogging] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'students' | 'companies' | 'jobs'>('dashboard');
  const [token, setToken] = useState<string | null>(null);

  // Data states
  const [stats, setStats] = useState<any>(null);
  const [byCareer, setByCareer] = useState<any[]>([]);
  const [topCompanies, setTopCompanies] = useState<any[]>([]);
  const [byLocation, setByLocation] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);

  const PIE_COLORS = ['#003057', '#ef4444', '#f59e0b', '#10b981', '#6366f1', '#ec4899'];

  // Check existing token
  useEffect(() => {
    const savedToken = localStorage.getItem('worklink_admin_token');
    if (savedToken) {
      setToken(savedToken);
      setIsLoggedIn(true);
    }
  }, []);

  // Fetch all data when token available
  useEffect(() => {
    if (!token) return;
    const headers = { 'Authorization': `Bearer ${token}` };

    const fetchAll = async () => {
      try {
        const [statsRes, careerRes, compRes, locRes, studRes, companyRes, jobRes] = await Promise.all([
          fetch('http://localhost:8000/api/admin/stats', { headers }),
          fetch('http://localhost:8000/api/admin/reports/by-career', { headers }),
          fetch('http://localhost:8000/api/admin/reports/top-companies', { headers }),
          fetch('http://localhost:8000/api/admin/reports/by-location', { headers }),
          fetch('http://localhost:8000/api/admin/students', { headers }),
          fetch('http://localhost:8000/api/admin/companies', { headers }),
          fetch('http://localhost:8000/api/admin/jobs', { headers }),
        ]);
        if (statsRes.ok) setStats(await statsRes.json());
        if (careerRes.ok) setByCareer(await careerRes.json());
        if (compRes.ok) setTopCompanies(await compRes.json());
        if (locRes.ok) setByLocation(await locRes.json());
        if (studRes.ok) setStudents(await studRes.json());
        if (companyRes.ok) setCompanies(await companyRes.json());
        if (jobRes.ok) setJobs(await jobRes.json());
      } catch (err) {
        console.error('Error al cargar datos admin:', err);
      }
    };
    fetchAll();
  }, [token]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLogging(true);
    try {
      const res = await fetch('http://localhost:8000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('worklink_admin_token', data.access_token);
        setToken(data.access_token);
        setIsLoggedIn(true);
        toast.success('Acceso concedido al Panel Administrativo');
      } else {
        toast.error(data.detail || 'Contraseña incorrecta');
      }
    } catch (err) {
      toast.error('Error de conexión con el servidor');
    } finally {
      setIsLogging(false);
    }
  };

  const handleDeleteStudent = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar al estudiante ${name}? Esta acción no se puede deshacer.`)) return;
    try {
      const res = await fetch(`http://localhost:8000/api/admin/students/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success(`Estudiante ${name} eliminado`);
        setStudents(prev => prev.filter(s => s.id !== id));
      }
    } catch (err) {
      toast.error('Error al eliminar');
    }
  };

  const handleDeleteCompany = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar la empresa ${name}? Esto eliminará también sus vacantes.`)) return;
    try {
      const res = await fetch(`http://localhost:8000/api/admin/companies/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success(`Empresa ${name} eliminada`);
        setCompanies(prev => prev.filter(c => c.id !== id));
      }
    } catch (err) {
      toast.error('Error al eliminar');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('worklink_admin_token');
    setToken(null);
    setIsLoggedIn(false);
    router.push('/');
  };

  // ─── LOGIN SCREEN ───────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#001a33] via-[#003057] to-[#001a33] flex items-center justify-center p-6">
        <Toaster position="top-right" />
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 sm:p-12 rounded-3xl shadow-2xl max-w-md w-full text-center">
          <Image src="/logoumg.png" alt="Logo UMG" width={80} height={80} className="mx-auto mb-4 object-contain" />
          <h1 className="text-2xl font-black text-white mb-1">Panel Administrativo</h1>
          <p className="text-xs text-white/50 uppercase font-bold tracking-widest mb-8">WorkLink UMG · Acceso Restringido</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-white/60 uppercase tracking-wider mb-1 text-left">Contraseña de Administrador</label>
              <input
                type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••••"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-sm font-medium outline-none placeholder:text-white/30 focus:border-red-500 transition-all"
              />
            </div>
            <button disabled={isLogging} type="submit" className={`w-full py-3 font-bold text-sm rounded-xl shadow-lg transition-all active:scale-[0.97] ${isLogging ? 'bg-slate-500 cursor-not-allowed text-white/50' : 'bg-red-600 hover:bg-red-700 text-white'}`}>
              {isLogging ? '⏳ Verificando...' : '🔐 Ingresar al Panel'}
            </button>
          </form>

          <a href="/" className="block mt-6 text-xs text-white/40 hover:text-white/70 transition-all">← Volver al inicio</a>
        </div>
      </main>
    );
  }

  // ─── ADMIN DASHBOARD ─────────────────────────────────────
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-700 font-sans">
      <Toaster position="top-right" />

      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-[#001a33] text-white flex flex-col p-6 z-20 shadow-xl md:sticky md:top-0 md:h-screen">
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/10">
          <Image src="/logoumg.png" alt="Logo UMG" width={40} height={40} className="object-contain" />
          <div>
            <h1 className="font-black text-sm tracking-tight">WorkLink <span className="text-red-500">UMG</span></h1>
            <p className="text-[10px] opacity-60 font-bold uppercase">Panel Admin</p>
          </div>
        </div>

        <div className="mb-6 p-3 bg-white/5 rounded-xl text-left border border-white/10">
          <p className="font-bold text-[10px] text-red-400 uppercase tracking-wider">Administrador</p>
          <p className="font-extrabold text-sm text-white truncate">🛡️ Control Total</p>
        </div>

        <nav className="flex-1 space-y-2">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full text-left px-4 py-3.5 rounded-xl text-sm font-bold transition-all active:scale-95 ${activeTab === 'dashboard' ? 'bg-red-600 text-white shadow-lg' : 'hover:bg-white/10 text-white/80'}`}>📊 Dashboard</button>
          <button onClick={() => setActiveTab('students')} className={`w-full text-left px-4 py-3.5 rounded-xl text-sm font-bold transition-all active:scale-95 ${activeTab === 'students' ? 'bg-red-600 text-white shadow-lg' : 'hover:bg-white/10 text-white/80'}`}>🎓 Estudiantes ({students.length})</button>
          <button onClick={() => setActiveTab('companies')} className={`w-full text-left px-4 py-3.5 rounded-xl text-sm font-bold transition-all active:scale-95 ${activeTab === 'companies' ? 'bg-red-600 text-white shadow-lg' : 'hover:bg-white/10 text-white/80'}`}>🏢 Empresas ({companies.length})</button>
          <button onClick={() => setActiveTab('jobs')} className={`w-full text-left px-4 py-3.5 rounded-xl text-sm font-bold transition-all active:scale-95 ${activeTab === 'jobs' ? 'bg-red-600 text-white shadow-lg' : 'hover:bg-white/10 text-white/80'}`}>💼 Vacantes ({jobs.length})</button>
        </nav>

        <button onClick={handleLogout} className="mt-auto pt-4 border-t border-white/10 text-left text-xs font-bold text-red-400">❌ Cerrar Sesión Admin</button>
      </aside>

      {/* CONTENT */}
      <section className="flex-1 p-6 md:p-10 max-w-6xl mx-auto w-full overflow-y-auto">

        {/* TAB: DASHBOARD */}
        {activeTab === 'dashboard' && stats && (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-black text-[#003057]">Dashboard de Empleabilidad</h2>
              <p className="text-sm text-slate-500">Métricas globales de la plataforma WorkLink UMG en tiempo real.</p>
            </div>

            {/* KPI CARDS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Estudiantes', value: stats.total_students, icon: '🎓', color: 'bg-blue-50 border-blue-200 text-blue-700' },
                { label: 'Empresas', value: stats.total_companies, icon: '🏢', color: 'bg-red-50 border-red-200 text-red-700' },
                { label: 'Vacantes', value: stats.total_jobs, icon: '💼', color: 'bg-amber-50 border-amber-200 text-amber-700' },
                { label: 'Postulaciones', value: stats.total_applications, icon: '📩', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
              ].map((kpi, i) => (
                <div key={i} className={`p-5 rounded-2xl border-2 ${kpi.color} text-center shadow-sm`}>
                  <p className="text-3xl mb-1">{kpi.icon}</p>
                  <p className="text-3xl font-black">{kpi.value}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider mt-1">{kpi.label}</p>
                </div>
              ))}
            </div>

            {/* STATUS BREAKDOWN */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-emerald-50 border-2 border-emerald-200 p-4 rounded-2xl text-center">
                <p className="text-2xl font-black text-emerald-700">{stats.applications_accepted}</p>
                <p className="text-[10px] font-bold text-emerald-600 uppercase">Aceptadas</p>
              </div>
              <div className="bg-amber-50 border-2 border-amber-200 p-4 rounded-2xl text-center">
                <p className="text-2xl font-black text-amber-700">{stats.applications_pending}</p>
                <p className="text-[10px] font-bold text-amber-600 uppercase">Pendientes</p>
              </div>
              <div className="bg-red-50 border-2 border-red-200 p-4 rounded-2xl text-center">
                <p className="text-2xl font-black text-red-700">{stats.applications_rejected}</p>
                <p className="text-[10px] font-bold text-red-600 uppercase">Rechazadas</p>
              </div>
            </div>

            {/* CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart: Postulaciones por Carrera */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-black text-[#003057] mb-4">📊 Postulaciones por Carrera</h3>
                {byCareer.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={byCareer}>
                      <XAxis dataKey="career" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="total" fill="#003057" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-xs text-slate-400 text-center py-10">Sin datos de postulaciones aún.</p>
                )}
              </div>

              {/* Chart: Vacantes por Municipio */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-black text-[#003057] mb-4">🗺️ Vacantes por Municipio</h3>
                {byLocation.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={byLocation} dataKey="total" nameKey="location" cx="50%" cy="50%" outerRadius={90} label={({ location, total }) => `${location}: ${total}`} labelLine={true}>
                        {byLocation.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-xs text-slate-400 text-center py-10">Sin datos de ubicaciones aún.</p>
                )}
              </div>

              {/* Chart: Empresas más activas */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
                <h3 className="text-sm font-black text-[#003057] mb-4">🏢 Empresas Más Activas (por Vacantes Publicadas)</h3>
                {topCompanies.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={topCompanies} layout="vertical">
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis dataKey="company" type="category" tick={{ fontSize: 11 }} width={150} />
                      <Tooltip />
                      <Bar dataKey="total_jobs" fill="#ef4444" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-xs text-slate-400 text-center py-10">Sin datos de empresas aún.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB: STUDENTS */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-black text-[#003057]">Gestión de Estudiantes</h2>
              <p className="text-sm text-slate-500">Lista completa de estudiantes registrados en la plataforma.</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-[10px] font-black text-slate-400 uppercase">Nombre</th>
                    <th className="text-left px-4 py-3 text-[10px] font-black text-slate-400 uppercase">Email</th>
                    <th className="text-left px-4 py-3 text-[10px] font-black text-slate-400 uppercase">Carnet</th>
                    <th className="text-left px-4 py-3 text-[10px] font-black text-slate-400 uppercase">Carrera</th>
                    <th className="text-right px-4 py-3 text-[10px] font-black text-slate-400 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50 transition-all">
                      <td className="px-4 py-3 font-bold text-[#003057]">{s.name}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs font-mono">{s.email}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs font-mono">{s.carnet}</td>
                      <td className="px-4 py-3 text-xs font-medium text-slate-600">{s.career || 'N/A'}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => handleDeleteStudent(s.id, s.name)} className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold rounded-lg transition-all active:scale-95">🗑️ Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {students.length === 0 && <p className="text-center text-xs text-slate-400 py-10">No hay estudiantes registrados.</p>}
            </div>
          </div>
        )}

        {/* TAB: COMPANIES */}
        {activeTab === 'companies' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-black text-[#003057]">Gestión de Empresas</h2>
              <p className="text-sm text-slate-500">Todas las empresas asociadas a la plataforma.</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-[10px] font-black text-slate-400 uppercase">Empresa</th>
                    <th className="text-left px-4 py-3 text-[10px] font-black text-slate-400 uppercase">Email</th>
                    <th className="text-left px-4 py-3 text-[10px] font-black text-slate-400 uppercase">Sitio Web</th>
                    <th className="text-right px-4 py-3 text-[10px] font-black text-slate-400 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {companies.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-all">
                      <td className="px-4 py-3 font-bold text-[#003057]">{c.name}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs font-mono">{c.email}</td>
                      <td className="px-4 py-3 text-xs font-medium text-blue-600">{c.website || 'N/A'}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => handleDeleteCompany(c.id, c.name)} className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold rounded-lg transition-all active:scale-95">🗑️ Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {companies.length === 0 && <p className="text-center text-xs text-slate-400 py-10">No hay empresas registradas.</p>}
            </div>
          </div>
        )}

        {/* TAB: JOBS */}
        {activeTab === 'jobs' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-black text-[#003057]">Todas las Vacantes</h2>
              <p className="text-sm text-slate-500">Historial de plazas publicadas en la plataforma.</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-[10px] font-black text-slate-400 uppercase">Título</th>
                    <th className="text-left px-4 py-3 text-[10px] font-black text-slate-400 uppercase">Empresa</th>
                    <th className="text-left px-4 py-3 text-[10px] font-black text-slate-400 uppercase">Modalidad</th>
                    <th className="text-left px-4 py-3 text-[10px] font-black text-slate-400 uppercase">Salario</th>
                    <th className="text-left px-4 py-3 text-[10px] font-black text-slate-400 uppercase">Ubicación</th>
                    <th className="text-left px-4 py-3 text-[10px] font-black text-slate-400 uppercase">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {jobs.map(j => (
                    <tr key={j.id} className="hover:bg-slate-50 transition-all">
                      <td className="px-4 py-3 font-bold text-[#003057]">{j.title}</td>
                      <td className="px-4 py-3 text-xs font-medium text-slate-600">{j.company}</td>
                      <td className="px-4 py-3"><span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-md">{j.type}</span></td>
                      <td className="px-4 py-3 text-xs font-bold text-emerald-600">Q{j.salary?.toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">📍 {j.location}</td>
                      <td className="px-4 py-3"><span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-md">{j.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {jobs.length === 0 && <p className="text-center text-xs text-slate-400 py-10">No hay vacantes publicadas.</p>}
            </div>
          </div>
        )}

      </section>
    </main>
  );
}
