/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  Calendar as CalendarIcon, 
  List, 
  Users, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  MoreVertical,
  LogOut,
  LayoutDashboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  parseISO,
  isToday
} from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from './lib/utils';
import { Session, Student, Mentor, SessionStatus } from './types';
import { INITIAL_SESSIONS, INITIAL_STUDENTS, INITIAL_MENTORS } from './constants';

export default function App() {
  const [sessions, setSessions] = useState<Session[]>(() => {
    const saved = localStorage.getItem('sessions');
    return saved ? JSON.parse(saved) : INITIAL_SESSIONS;
  });
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });
  
  const [currentView, setCurrentView] = useState<'dashboard' | 'calendar' | 'sessions' | 'students'>('dashboard');
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 3, 1)); // April 2026 for demo consistency
  
  const [searchTerm, setSearchTerm] = useState('');
  const [studentFilter, setStudentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<SessionStatus | ''>('');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  
  const [newSession, setNewSession] = useState<Partial<Session>>({
    date: format(new Date(), 'yyyy-MM-dd'),
    status: 'Realizada',
    sessionNumber: '1',
  });
  const [newStudentName, setNewStudentName] = useState('');

  useEffect(() => {
    localStorage.setItem('sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('students', JSON.stringify(students));
  }, [students]);

  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      const student = students.find(s => s.id === session.studentId);
      const matchesSearch = student?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           session.observation.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStudent = studentFilter ? session.studentId === studentFilter : true;
      const matchesStatus = statusFilter ? session.status === statusFilter : true;
      
      return matchesSearch && matchesStudent && matchesStatus;
    }).sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
  }, [sessions, searchTerm, studentFilter, statusFilter, students]);

  const stats = useMemo(() => {
    return {
      total: sessions.length,
      realizadas: sessions.filter(s => s.status === 'Realizada').length,
      ausencias: sessions.filter(s => s.status === 'No se conectó').length,
      aplazadas: sessions.filter(s => s.status === 'Aplazada').length,
    };
  }, [sessions]);

  const handleAddSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSession.studentId || !newSession.date) return;
    
    const session: Session = {
      id: Math.random().toString(36).substr(2, 9),
      studentId: newSession.studentId,
      mentorId: 'm1',
      sessionNumber: newSession.sessionNumber || '1',
      date: new Date(newSession.date).toISOString(),
      status: newSession.status as SessionStatus || 'Realizada',
      observation: newSession.observation || '',
    };
    
    setSessions(prev => [...prev, session]);
    setIsAddModalOpen(false);
    setNewSession({
      date: format(new Date(), 'yyyy-MM-dd'),
      status: 'Realizada',
      sessionNumber: '1',
    });
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;

    const student: Student = {
      id: `s-${Math.random().toString(36).substr(2, 5)}`,
      name: newStudentName.trim(),
      mentorId: 'm1',
    };

    setStudents(prev => [...prev, student]);
    setNewStudentName('');
    setIsAddStudentModalOpen(false);
  };

  const deleteSession = (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta sesión?')) {
      setSessions(prev => prev.filter(s => s.id !== id));
    }
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2 font-bold text-indigo-600 text-xl">
            <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
              <Users size={20} />
            </div>
            <span>Mentora App</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <NavItem 
            icon={<LayoutDashboard size={18} />} 
            label="Dashboard" 
            active={currentView === 'dashboard'} 
            onClick={() => setCurrentView('dashboard')} 
          />
          <NavItem 
            icon={<CalendarIcon size={18} />} 
            label="Calendario" 
            active={currentView === 'calendar'} 
            onClick={() => setCurrentView('calendar')} 
          />
          <NavItem 
            icon={<List size={18} />} 
            label="Sesiones" 
            active={currentView === 'sessions'} 
            onClick={() => setCurrentView('sessions')} 
          />
          <NavItem 
            icon={<Users size={18} />} 
            label="Alumnos" 
            active={currentView === 'students'} 
            onClick={() => setCurrentView('students')} 
          />
        </nav>
        
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold">
              LI
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Luis Arcia</p>
              <p className="text-xs text-slate-500 truncate">Mentor</p>
            </div>
            <button className="text-slate-400 hover:text-slate-600 transition-colors">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <h1 className="text-lg font-semibold">
            {currentView === 'dashboard' && 'Resumen General'}
            {currentView === 'calendar' && 'Vista de Calendario'}
            {currentView === 'sessions' && 'Historial de Sesiones'}
            {currentView === 'students' && 'Mis Alumnos'}
          </h1>
          
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Buscar sesión o alumno..." 
                className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm w-64 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all shadow-sm shadow-indigo-200"
            >
              <Plus size={18} />
              <span>Nueva Sesión</span>
            </button>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {currentView === 'dashboard' && (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard label="Total Sesiones" value={stats.total} color="bg-indigo-500" icon={<List size={20} />} />
                  <StatCard label="Realizadas" value={stats.realizadas} color="bg-emerald-500" icon={<CheckCircle2 size={20} />} />
                  <StatCard label="Ausencias" value={stats.ausencias} color="bg-rose-500" icon={<XCircle size={20} />} />
                  <StatCard label="Aplazadas" value={stats.aplazadas} color="bg-amber-500" icon={<Clock size={20} />} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Recent Sessions */}
                  <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                      <h3 className="font-semibold">Sesiones Recientes</h3>
                      <button onClick={() => setCurrentView('sessions')} className="text-xs text-indigo-600 font-medium hover:underline">Ver todas</button>
                    </div>
                    <div className="divide-y divide-slate-50">
                      {filteredSessions.slice(0, 6).map(session => (
                        <SessionRow key={session.id} session={session} students={students} onDelete={deleteSession} />
                      ))}
                      {filteredSessions.length === 0 && (
                        <div className="p-8 text-center text-slate-500">No hay sesiones que coincidan con los filtros.</div>
                      )}
                    </div>
                  </div>

                  {/* Students List mini */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100">
                      <h3 className="font-semibold">Mis Alumnos</h3>
                    </div>
                    <div className="p-4 space-y-4">
                      {students.map(student => (
                        <div key={student.id} className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold uppercase">
                            {student.name.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{student.name}</p>
                            <p className="text-xs text-slate-500">
                              {sessions.filter(s => s.studentId === student.id).length} sesiones registradas
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {currentView === 'calendar' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <Calendar 
                  currentMonth={currentMonth} 
                  setCurrentMonth={setCurrentMonth} 
                  sessions={sessions} 
                  students={students}
                />
              </div>
            )}

            {currentView === 'sessions' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex flex-wrap gap-4 items-center justify-between">
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                       <Filter size={16} className="text-slate-400" />
                       <select 
                         value={studentFilter} 
                         onChange={(e) => setStudentFilter(e.target.value)}
                         className="text-sm bg-slate-50 border-none rounded-lg py-2 pl-3 pr-8 focus:ring-2 focus:ring-indigo-500"
                       >
                         <option value="">Todos los alumnos</option>
                         {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                       </select>
                    </div>
                    <select 
                       value={statusFilter} 
                       onChange={(e) => setStatusFilter(e.target.value as SessionStatus | '')}
                       className="text-sm bg-slate-50 border-none rounded-lg py-2 pl-3 pr-8 focus:ring-2 focus:ring-indigo-500"
                    >
                       <option value="">Cualquier estado</option>
                       <option value="Realizada">Realizada</option>
                       <option value="No se conectó">No se conectó</option>
                       <option value="Aplazada">Aplazada</option>
                    </select>
                  </div>
                  <div className="text-sm text-slate-500">
                    Mostrando {filteredSessions.length} resultados
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                        <th className="px-6 py-4">Fecha</th>
                        <th className="px-6 py-4">Alumno</th>
                        <th className="px-6 py-4 text-center">Sesión</th>
                        <th className="px-6 py-4">Estado</th>
                        <th className="px-6 py-4">Observaciones</th>
                        <th className="px-6 py-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {filteredSessions.map(session => (
                        <tr key={session.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap font-medium">{format(parseISO(session.date), 'dd MMM yyyy', { locale: es })}</td>
                          <td className="px-6 py-4">{students.find(s => s.id === session.studentId)?.name}</td>
                          <td className="px-6 py-4 text-center">
                            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-bold">{session.sessionNumber}</span>
                          </td>
                          <td className="px-6 py-4">
                             <StatusBadge status={session.status} />
                          </td>
                          <td className="px-6 py-4 text-slate-500 italic max-w-xs truncate">{session.observation || '-'}</td>
                          <td className="px-6 py-4 text-right">
                             <button onClick={() => deleteSession(session.id)} className="text-rose-500 hover:text-rose-700 transition-colors">
                               Eliminar
                             </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {currentView === 'students' && (
               <div className="space-y-6">
                 <div className="flex justify-end">
                    <button 
                      onClick={() => setIsAddStudentModalOpen(true)}
                      className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all"
                    >
                      <Plus size={18} />
                      <span>Añadir Alumno</span>
                    </button>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {students.map(student => (
                      <div key={student.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4 mb-6">
                           <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl font-bold">
                             {student.name.charAt(0)}
                           </div>
                           <div>
                              <h3 className="font-bold text-lg">{student.name}</h3>
                              <p className="text-sm text-slate-500">ID: {student.id}</p>
                           </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                           <div className="bg-slate-50 p-3 rounded-xl">
                              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Sesiones</p>
                              <p className="font-bold text-xl">{sessions.filter(s => s.studentId === student.id).length}</p>
                           </div>
                           <div className="bg-slate-50 p-3 rounded-xl">
                              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Última</p>
                              <p className="font-bold">
                                 {sessions.filter(s => s.studentId === student.id).sort((a,b) => parseISO(b.date).getTime() - parseISO(a.date).getTime())[0] 
                                    ? format(parseISO(sessions.filter(s => s.studentId === student.id).sort((a,b) => parseISO(b.date).getTime() - parseISO(a.date).getTime())[0].date), 'dd/MM/yy')
                                    : 'N/A'
                                 }
                              </p>
                           </div>
                        </div>
                        <button 
                          onClick={() => {
                            setStudentFilter(student.id);
                            setCurrentView('sessions');
                          }}
                          className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
                         >
                          Ver Historial Completo
                        </button>
                      </div>
                    ))}
                 </div>
               </div>
            )}
          </div>
        </div>
      </main>

      {/* Add Session Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-xl font-bold">Registrar Sesión</h2>
                <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
                  <XCircle size={20} />
                </button>
              </div>
              <form onSubmit={handleAddSession} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Alumno</label>
                  <select 
                    required
                    className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={newSession.studentId || ''}
                    onChange={(e) => setNewSession({...newSession, studentId: e.target.value})}
                  >
                    <option value="">Seleccionar alumno...</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Fecha</label>
                    <input 
                      type="date" 
                      required
                      className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={newSession.date || ''}
                      onChange={(e) => setNewSession({...newSession, date: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Sesión #</label>
                    <input 
                      type="text" 
                      placeholder="Ej: 1"
                      className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={newSession.sessionNumber || ''}
                      onChange={(e) => setNewSession({...newSession, sessionNumber: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Estado</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Realizada', 'No se conectó', 'Aplazada'].map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setNewSession({...newSession, status: status as SessionStatus})}
                        className={cn(
                          "py-2 px-1 text-[10px] font-bold rounded-lg border-2 transition-all",
                          newSession.status === status 
                            ? "bg-indigo-50 border-indigo-600 text-indigo-700" 
                            : "bg-white border-slate-100 text-slate-500 hover:border-slate-200"
                        )}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Observación</label>
                  <textarea 
                    className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none min-h-[80px]"
                    placeholder="Detalles de la sesión..."
                    value={newSession.observation || ''}
                    onChange={(e) => setNewSession({...newSession, observation: e.target.value})}
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-indigo-200 mt-4 transition-all"
                >
                  Guardar Sesión
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Student Modal */}
      <AnimatePresence>
        {isAddStudentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddStudentModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-xl font-bold">Añadir Alumno</h2>
                <button onClick={() => setIsAddStudentModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
                  <XCircle size={20} />
                </button>
              </div>
              <form onSubmit={handleAddStudent} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nombre Completo</label>
                  <input 
                    type="text" 
                    required
                    autoFocus
                    placeholder="Ej: Juan Pérez"
                    className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-indigo-200 mt-4 transition-all"
                >
                  Registrar Alumno
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

const NavItem: React.FC<{ icon: React.ReactNode, label: string, active: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
        active 
          ? "bg-indigo-50 text-indigo-700" 
          : "text-slate-400 hover:bg-slate-50 hover:text-slate-700"
      )}
    >
      <span className={cn(active ? "text-indigo-600" : "text-slate-400")}>{icon}</span>
      {label}
    </button>
  );
}

const StatCard: React.FC<{ label: string, value: number, color: string, icon: React.ReactNode }> = ({ label, value, color, icon }) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-slate-500 text-sm font-medium mb-1">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-100", color)}>
        {icon}
      </div>
    </div>
  );
}

const SessionRow: React.FC<{ session: Session, students: Student[], onDelete: (id: string) => void }> = ({ session, students, onDelete }) => {
  const student = students.find(s => s.id === session.studentId);
  return (
    <div className="p-4 flex items-center gap-4 group">
      <div className="bg-slate-50 p-2 rounded-lg text-slate-400">
        <CalendarIcon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm font-semibold truncate">{student?.name}</p>
          <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold">S-{session.sessionNumber}</span>
        </div>
        <p className="text-xs text-slate-500">{format(parseISO(session.date), 'EEEE, d MMMM', { locale: es })}</p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <StatusBadge status={session.status} />
        <button onClick={() => onDelete(session.id)} className="text-[10px] text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">Eliminar</button>
      </div>
    </div>
  );
}

const StatusBadge: React.FC<{ status: SessionStatus }> = ({ status }) => {
  const styles = {
    'Realizada': 'status-realizada',
    'No se conectó': 'status-no-conecto',
    'Aplazada': 'status-aplazada',
    'Pendiente': 'status-pendiente'
  };
  return (
    <span className={cn("text-[10px] font-bold px-2 py-1 rounded-full border border-opacity-30 whitespace-nowrap", styles[status])}>
      {status}
    </span>
  );
}

type CalendarProps = {
  currentMonth: Date;
  setCurrentMonth: (date: Date) => void;
  sessions: Session[];
  students: Student[];
};

const Calendar: React.FC<CalendarProps> = ({ currentMonth, setCurrentMonth, sessions, students }) => {
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const rows = [];
  let days = [];
  let day = startDate;

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
        const dayCopy = day; // for closure
        const daySessions = sessions.filter(s => isSameDay(parseISO(s.date), dayCopy));
        
        days.push(
          <div 
            key={day.toString()} 
            className={cn(
              "min-h-[120px] p-2 border-slate-100 border-r border-b relative",
              !isSameMonth(day, monthStart) && "bg-slate-50/50 text-slate-300",
              isToday(day) && "bg-indigo-50/30"
            )}
          >
            <span className={cn(
              "text-xs font-bold mb-2 inline-block w-6 h-6 leading-6 text-center rounded-full",
              isToday(day) && "bg-indigo-600 text-white"
            )}>
              {format(day, 'd')}
            </span>
            <div className="space-y-1">
              {daySessions.map(s => {
                const sessionStudent = students.find(std => std.id === s.studentId);
                const statusColor = s.status === 'Realizada' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 
                                   s.status === 'No se conectó' ? 'bg-rose-100 text-rose-700 border-rose-200' : 
                                   'bg-amber-100 text-amber-700 border-amber-200';
                return (
                  <div key={s.id} className={cn("text-[8px] p-1 rounded border truncate font-medium", statusColor)}>
                    {sessionStudent?.name.split(' ')[0]}: S{s.sessionNumber}
                  </div>
                );
              })}
            </div>
          </div>
        );
        day = addDays(day, 1);
    }
    rows.push(
      <div className="grid grid-cols-7" key={day.toString()}>
        {days}
      </div>
    );
    days = [];
  }

  const weekDayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          {format(currentMonth, 'MMMM yyyy', { locale: es })}
        </h2>
        <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600">
                <ChevronLeft size={20} />
            </button>
            <button onClick={() => setCurrentMonth(new Date())} className="px-3 py-1 text-xs border border-slate-200 rounded-lg hover:bg-slate-50 font-medium">
                Hoy
            </button>
            <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600">
                <ChevronRight size={20} />
            </button>
        </div>
      </div>
      <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm">
        <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-100">
           {weekDayNames.map(d => (
             <div key={d} className="py-2 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">{d}</div>
           ))}
        </div>
        {rows}
      </div>
    </div>
  );
}
