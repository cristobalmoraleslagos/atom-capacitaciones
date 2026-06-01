'use client';
import { useState, useEffect } from 'react';
import Topbar from '@/components/layout/Topbar';
import { professor, Course, GradeScore } from '@/lib/api';

export default function ProfessorPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [tab, setTab]         = useState<'courses'|'calculator'|'grades'|'attendance'>('courses');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showNewCourse, setShowNewCourse] = useState(false);

  // Calculadora de notas
  const [scores, setScores]   = useState<GradeScore[]>([
    { label:'Prueba 1', score:0, weight:0.33 },
    { label:'Prueba 2', score:0, weight:0.33 },
    { label:'Examen',   score:0, weight:0.34 },
  ]);
  const [result, setResult]   = useState<number | null>(null);

  useEffect(() => {
    professor.courses().then(setCourses).catch(()=>{});
  }, []);

  const calcGrade = async () => {
    const { finalGrade } = await professor.calculateGrade(scores);
    setResult(finalGrade);
  };

  const gradeColor = (g: number) => g >= 4 ? '#16A34A' : g >= 3 ? '#D97706' : '#E82429';

  return (
    <div>
      <Topbar
        title="Módulo Profesores"
        subtitle="Cursos, notas, asistencia y calculadora"
        actions={
          tab === 'courses' ? (
            <button className="btn btn-primary" onClick={() => setShowNewCourse(true)}>
              + Nuevo curso
            </button>
          ) : undefined
        }
      />

      <div style={{ padding:'1.75rem', display:'flex', flexDirection:'column', gap:'1.5rem' }}>

        {/* Tabs */}
        <div style={{ display:'flex', gap:'.5rem', borderBottom:'2px solid #E5E7EB' }}>
          {[
            { key:'courses',    label:'🎓 Mis cursos' },
            { key:'calculator', label:'🧮 Calculadora' },
            { key:'grades',     label:'📝 Notas' },
            { key:'attendance', label:'✅ Asistencia' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as any)}
              style={{
                padding:'.6rem 1.25rem', border:'none', background:'none', cursor:'pointer',
                fontWeight:600, fontSize:'.875rem',
                color: tab === t.key ? '#E82429' : '#6B7280',
                borderBottom: tab === t.key ? '2px solid #E82429' : '2px solid transparent',
                marginBottom:-2, transition:'all .2s',
              }}>{t.label}
            </button>
          ))}
        </div>

        {/* ── Cursos ──────────────────────────────────────────────────── */}
        {tab === 'courses' && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'1rem' }}>
            {courses.length === 0 && (
              <div className="card" style={{ gridColumn:'1/-1', textAlign:'center', color:'#9CA3AF', padding:'3rem' }}>
                <p style={{ fontSize:'2rem' }}>🎓</p>
                <p style={{ fontWeight:600, marginTop:'.75rem' }}>No hay cursos cargados aún.</p>
              </div>
            )}
            {courses.map(c => (
              <div key={c.id} className="card" style={{ borderTop:'3px solid #E82429' }}>
                <h4 style={{ fontFamily:'Rajdhani,sans-serif', fontWeight:700, fontSize:'1.1rem' }}>{c.name}</h4>
                <p style={{ fontSize:'.78rem', color:'#6B7280', marginTop:4 }}>
                  ⏱ {c.totalHours}h académicas
                </p>
                {c.program && (
                  <p style={{ fontSize:'.78rem', color:'#6B7280', marginTop:2 }}>📋 {c.program}</p>
                )}
                <div style={{ display:'flex', gap:'.5rem', marginTop:'1rem' }}>
                  <button className="btn btn-ghost" style={{ flex:1, justifyContent:'center', fontSize:'.78rem' }}
                    onClick={() => { setSelectedCourse(c); setTab('grades'); }}>
                    📝 Notas
                  </button>
                  <button className="btn btn-ghost" style={{ flex:1, justifyContent:'center', fontSize:'.78rem' }}
                    onClick={() => { setSelectedCourse(c); setTab('attendance'); }}>
                    ✅ Asistencia
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Calculadora inmediata ────────────────────────────────── */}
        {tab === 'calculator' && (
          <div style={{ maxWidth:560 }}>
            <div className="card">
              <h3 style={{ fontFamily:'Rajdhani,sans-serif', fontWeight:700, fontSize:'1.25rem', marginBottom:'1.25rem' }}>
                🧮 Calculadora de nota final
              </h3>
              <p style={{ fontSize:'.8rem', color:'#6B7280', marginBottom:'1.25rem' }}>
                Ingresa las notas y su ponderación. La suma de ponderaciones debe ser 1 (100%).
              </p>

              {scores.map((s, i) => (
                <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr auto auto', gap:'.75rem', marginBottom:'.75rem', alignItems:'center' }}>
                  <input className="atom-input" value={s.label}
                    onChange={e => { const n=[...scores]; n[i]={...n[i],label:e.target.value}; setScores(n); }}
                    placeholder="Nombre evaluación"/>
                  <input className="atom-input" type="number" min={1} max={7} step={0.1} value={s.score}
                    style={{ width:80 }}
                    onChange={e => { const n=[...scores]; n[i]={...n[i],score:parseFloat(e.target.value)||0}; setScores(n); }}
                    placeholder="Nota"/>
                  <input className="atom-input" type="number" min={0} max={1} step={0.01} value={s.weight}
                    style={{ width:90 }}
                    onChange={e => { const n=[...scores]; n[i]={...n[i],weight:parseFloat(e.target.value)||0}; setScores(n); }}
                    placeholder="Pond."/>
                </div>
              ))}

              <div style={{ display:'flex', gap:'.75rem', marginTop:'1rem' }}>
                <button className="btn btn-ghost" onClick={() => setScores([...scores, {label:`Evaluación ${scores.length+1}`,score:0,weight:0}])}>
                  + Agregar
                </button>
                <button className="btn btn-primary" onClick={calcGrade}>
                  Calcular nota final
                </button>
              </div>

              {result !== null && (
                <div style={{
                  marginTop:'1.5rem', padding:'1.25rem',
                  borderRadius:12, textAlign:'center',
                  background: result >= 4 ? '#DCFCE7' : result >= 3 ? '#FEF3C7' : '#FEE2E2',
                }}>
                  <p style={{ fontSize:'.8rem', fontWeight:600, color:'#6B7280' }}>NOTA FINAL CALCULADA</p>
                  <p style={{
                    fontFamily:'Rajdhani,sans-serif', fontSize:'4rem', fontWeight:700,
                    color: gradeColor(result), lineHeight:1, marginTop:'.25rem',
                  }}>{result.toFixed(1)}</p>
                  <p style={{ fontSize:'.8rem', color:'#6B7280', marginTop:'.5rem' }}>
                    {result >= 4 ? '✅ Aprobado' : '❌ Reprobado'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Notas del curso seleccionado ─────────────────────────── */}
        {tab === 'grades' && (
          <div className="card">
            {!selectedCourse ? (
              <div style={{ textAlign:'center', color:'#9CA3AF', padding:'2rem' }}>
                Selecciona un curso desde la pestaña "Mis cursos".
              </div>
            ) : (
              <>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
                  <h3 style={{ fontFamily:'Rajdhani,sans-serif', fontWeight:700 }}>
                    📝 Notas — {selectedCourse.name}
                  </h3>
                  <label className="btn btn-outline" style={{ cursor:'pointer' }}>
                    📥 Importar Excel
                    <input type="file" accept=".xlsx,.xls" style={{ display:'none' }} onChange={async e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const form = new FormData();
                      form.append('file', file);
                      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/professor/courses/${selectedCourse.id}/grades/import`, {
                        method:'POST',
                        headers:{ Authorization:`Bearer ${localStorage.getItem('atom_token')}` },
                        body: form,
                      });
                    }}/>
                  </label>
                </div>
                <p style={{ fontSize:'.85rem', color:'#6B7280' }}>
                  Las notas se cargarán aquí cuando se conecte el backend.
                </p>
              </>
            )}
          </div>
        )}

        {/* ── Asistencia ───────────────────────────────────────────── */}
        {tab === 'attendance' && (
          <div className="card">
            {!selectedCourse ? (
              <div style={{ textAlign:'center', color:'#9CA3AF', padding:'2rem' }}>
                Selecciona un curso desde "Mis cursos".
              </div>
            ) : (
              <div style={{ textAlign:'center', color:'#9CA3AF', padding:'2rem' }}>
                Módulo de asistencia para <strong>{selectedCourse.name}</strong>.<br/>
                Conectar con backend para ver el resumen.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal nuevo curso */}
      {showNewCourse && (
        <NewCourseModal onClose={() => setShowNewCourse(false)} onSave={async (data) => {
          await professor.createCourse(data);
          const updated = await professor.courses();
          setCourses(updated);
          setShowNewCourse(false);
        }}/>
      )}
    </div>
  );
}

function NewCourseModal({ onClose, onSave }: { onClose:()=>void; onSave:(d:any)=>void }) {
  const [form, setForm] = useState({ name:'', program:'', totalHours:'', startDate:'', endDate:'' });
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100 }}>
      <div className="card" style={{ width:480, maxWidth:'95vw' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
          <h3 style={{ fontFamily:'Rajdhani,sans-serif', fontWeight:700, fontSize:'1.25rem' }}>Nuevo curso</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:'1.2rem', cursor:'pointer' }}>✕</button>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          <input className="atom-input" placeholder="Nombre del curso *" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
          <input className="atom-input" placeholder="Programa (opcional)" value={form.program} onChange={e=>setForm({...form,program:e.target.value})}/>
          <input className="atom-input" type="number" placeholder="Horas académicas *" value={form.totalHours} onChange={e=>setForm({...form,totalHours:e.target.value})}/>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
            <div>
              <label style={{ fontSize:'.75rem', fontWeight:600, display:'block', marginBottom:4 }}>Fecha inicio</label>
              <input className="atom-input" type="date" value={form.startDate} onChange={e=>setForm({...form,startDate:e.target.value})}/>
            </div>
            <div>
              <label style={{ fontSize:'.75rem', fontWeight:600, display:'block', marginBottom:4 }}>Fecha término</label>
              <input className="atom-input" type="date" value={form.endDate} onChange={e=>setForm({...form,endDate:e.target.value})}/>
            </div>
          </div>
          <div style={{ display:'flex', gap:'.75rem', marginTop:'.5rem' }}>
            <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button className="btn btn-primary" onClick={() => onSave({ ...form, totalHours: Number(form.totalHours) })}>
              Crear curso
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
