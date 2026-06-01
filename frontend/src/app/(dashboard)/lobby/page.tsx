'use client';
import { useState, useEffect } from 'react';
import Topbar from '@/components/layout/Topbar';
import { lobby, TrackingRow, Minute } from '@/lib/api';

const STATUS_LABELS: Record<string, { label:string; badge:string }> = {
  'PENDING':    { label:'Pendiente',  badge:'badge-amber' },
  'IN_PROGRESS':{ label:'En curso',   badge:'badge-cyan'  },
  'COMPLETED':  { label:'Completado', badge:'badge-green' },
  'EXPIRED':    { label:'Vencida',    badge:'badge-red'   },
};

export default function LobbyPage() {
  const [tracking, setTracking] = useState<TrackingRow[]>([]);
  const [tab,      setTab]      = useState<'tracking'|'new'>('tracking');
  const [loading,  setLoading]  = useState(true);
  const [form, setForm] = useState({
    entity:'', subject:'', date:'',
    participants:'',
    agreements: [{ text:'', responsible:'', deadline:'' }],
    alertDate:'',
  });

  useEffect(() => {
    lobby.tracking().then(setTracking).catch(()=>{}).finally(() => setLoading(false));
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    await lobby.create({
      entity: form.entity,
      subject: form.subject,
      date: form.date,
      participants: form.participants.split(',').map(p => p.trim()),
      agreements: form.agreements,
      alertDate: form.alertDate || undefined,
    });
    const updated = await lobby.tracking();
    setTracking(updated);
    setTab('tracking');
    setForm({ entity:'', subject:'', date:'', participants:'', agreements:[{ text:'', responsible:'', deadline:'' }], alertDate:'' });
  };

  const urgent = tracking.filter(t => t.urgent);
  const pending = tracking.filter(t => t.status === 'PENDING');
  const completed = tracking.filter(t => t.status === 'COMPLETED');

  return (
    <div>
      <Topbar
        title="Módulo Lobbyistas"
        subtitle="Minutas, acuerdos y seguimiento"
        actions={
          <button className="btn btn-primary" onClick={() => setTab(tab === 'new' ? 'tracking' : 'new')}>
            {tab === 'new' ? '← Volver' : '+ Nueva minuta'}
          </button>
        }
      />

      <div style={{ padding:'1.75rem', display:'flex', flexDirection:'column', gap:'1.5rem' }}>

        {/* KPIs */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:'1rem' }}>
          {[
            { label:'Total minutas',    value: tracking.length,   icon:'📄', color:'#0891B2', bg:'#CFFAFE' },
            { label:'Pendientes',       value: pending.length,    icon:'⏳', color:'#D97706', bg:'#FEF3C7' },
            { label:'Alertas urgentes', value: urgent.length,     icon:'🚨', color:'#E82429', bg:'#FEE2E2' },
            { label:'Completadas',      value: completed.length,  icon:'✅', color:'#16A34A', bg:'#DCFCE7' },
          ].map(k => (
            <div key={k.label} className="stat-card">
              <div className="stat-icon" style={{ background:k.bg, color:k.color }}>{k.icon}</div>
              <div>
                <p style={{ fontSize:'.73rem', color:'#6B7280', fontWeight:500 }}>{k.label}</p>
                <p style={{ fontSize:'1.5rem', fontWeight:700, fontFamily:'Rajdhani,sans-serif', color:'#1E1E1E' }}>{k.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Alertas urgentes */}
        {urgent.length > 0 && (
          <div style={{
            background:'#FEF2F2', border:'1px solid #FECACA',
            borderRadius:12, padding:'1rem 1.25rem',
          }}>
            <p style={{ fontWeight:700, color:'#E82429', marginBottom:'.75rem' }}>
              🚨 Alertas urgentes ({urgent.length})
            </p>
            {urgent.map(t => (
              <div key={t.id} style={{
                background:'white', borderRadius:8, padding:'.75rem 1rem', marginBottom:'.5rem',
                border:'1px solid #FECACA', display:'flex', justifyContent:'space-between', alignItems:'center',
              }}>
                <div>
                  <p style={{ fontWeight:600, fontSize:'.875rem' }}>{t.entity} — {t.subject}</p>
                  <p style={{ fontSize:'.75rem', color:'#6B7280' }}>Lobbyista: {t.lobbyist}</p>
                </div>
                <span style={{ fontWeight:700, color:'#E82429', fontSize:'.875rem' }}>
                  {t.daysToAlert === 0 ? 'HOY' : `${t.daysToAlert}d`}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Tab: Tabla de seguimiento */}
        {tab === 'tracking' && (
          <div className="card" style={{ padding:0, overflow:'hidden' }}>
            <div style={{ padding:'1rem 1.5rem', borderBottom:'1px solid #F0F0F0' }}>
              <h3 style={{ fontFamily:'Rajdhani,sans-serif', fontWeight:700 }}>Tabla de seguimiento</h3>
            </div>

            {loading ? (
              <div style={{ padding:'3rem', textAlign:'center', color:'#9CA3AF' }}>Cargando minutas...</div>
            ) : tracking.length === 0 ? (
              <div style={{ padding:'3rem', textAlign:'center', color:'#9CA3AF' }}>
                <p style={{ fontSize:'2rem' }}>🤝</p>
                <p style={{ fontWeight:600, marginTop:'.75rem' }}>No hay minutas registradas.</p>
                <button className="btn btn-primary" style={{ marginTop:'1rem' }} onClick={() => setTab('new')}>
                  + Cargar primera minuta
                </button>
              </div>
            ) : (
              <div style={{ overflowX:'auto' }}>
                <table className="atom-table">
                  <thead>
                    <tr>
                      <th>Entidad</th>
                      <th>Asunto</th>
                      <th>Fecha</th>
                      <th>Estado</th>
                      <th>Acuerdos</th>
                      <th>Alerta</th>
                      <th>Lobbyista</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {tracking.map(t => (
                      <tr key={t.id} style={{ background: t.urgent ? '#FFF8F8' : undefined }}>
                        <td style={{ fontWeight:600 }}>{t.entity}</td>
                        <td style={{ fontSize:'.85rem' }}>{t.subject}</td>
                        <td style={{ fontSize:'.8rem', color:'#6B7280' }}>
                          {new Date(t.date).toLocaleDateString('es-CL')}
                        </td>
                        <td>
                          <span className={`badge ${STATUS_LABELS[t.status]?.badge ?? 'badge-gray'}`}>
                            {STATUS_LABELS[t.status]?.label ?? t.status}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize:'.8rem', color:'#6B7280' }}>
                            {t.pendingAgreements}/{t.agreementCount} pendientes
                          </span>
                        </td>
                        <td>
                          {t.daysToAlert !== null ? (
                            <span style={{
                              fontWeight:700, fontSize:'.85rem',
                              color: t.urgent ? '#E82429' : t.daysToAlert <= 7 ? '#D97706' : '#16A34A',
                            }}>
                              {t.daysToAlert <= 0 ? '⚠️ Vencida' : `${t.daysToAlert}d`}
                            </span>
                          ) : '—'}
                        </td>
                        <td style={{ fontSize:'.78rem', color:'#6B7280' }}>{t.lobbyist}</td>
                        <td>
                          <select
                            className="atom-input" style={{ width:130, padding:'.25rem .5rem', fontSize:'.75rem' }}
                            value={t.status}
                            onChange={async e => {
                              await lobby.updateStatus(t.id, e.target.value);
                              const updated = await lobby.tracking();
                              setTracking(updated);
                            }}
                          >
                            {Object.entries(STATUS_LABELS).map(([v,l]) => (
                              <option key={v} value={v}>{l.label}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab: Nueva minuta */}
        {tab === 'new' && (
          <div style={{ maxWidth:680 }}>
            <form onSubmit={save} className="card" style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
              <h3 style={{ fontFamily:'Rajdhani,sans-serif', fontWeight:700, fontSize:'1.25rem' }}>Nueva minuta de reunión</h3>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
                <div>
                  <label style={{ fontSize:'.8rem', fontWeight:600, display:'block', marginBottom:4 }}>Entidad *</label>
                  <input className="atom-input" required value={form.entity} onChange={e=>setForm({...form,entity:e.target.value})} placeholder="Ministerio del Trabajo"/>
                </div>
                <div>
                  <label style={{ fontSize:'.8rem', fontWeight:600, display:'block', marginBottom:4 }}>Fecha *</label>
                  <input className="atom-input" type="date" required value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/>
                </div>
              </div>

              <div>
                <label style={{ fontSize:'.8rem', fontWeight:600, display:'block', marginBottom:4 }}>Asunto *</label>
                <input className="atom-input" required value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})} placeholder="Propuesta licitación capacitación"/>
              </div>

              <div>
                <label style={{ fontSize:'.8rem', fontWeight:600, display:'block', marginBottom:4 }}>Participantes (separados por coma)</label>
                <input className="atom-input" value={form.participants} onChange={e=>setForm({...form,participants:e.target.value})} placeholder="Juan Pérez, María González"/>
              </div>

              <div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                  <label style={{ fontSize:'.8rem', fontWeight:600 }}>Acuerdos</label>
                  <button type="button" className="btn btn-ghost" style={{ padding:'.25rem .75rem', fontSize:'.75rem' }}
                    onClick={() => setForm({...form, agreements:[...form.agreements,{text:'',responsible:'',deadline:''}]})}>
                    + Agregar
                  </button>
                </div>
                {form.agreements.map((a, i) => (
                  <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr auto auto', gap:'.75rem', marginBottom:'.5rem', alignItems:'start' }}>
                    <input className="atom-input" placeholder="Descripción del acuerdo" value={a.text}
                      onChange={e=>{const n=[...form.agreements];n[i]={...n[i],text:e.target.value};setForm({...form,agreements:n});}}/>
                    <input className="atom-input" style={{width:140}} placeholder="Responsable" value={a.responsible}
                      onChange={e=>{const n=[...form.agreements];n[i]={...n[i],responsible:e.target.value};setForm({...form,agreements:n});}}/>
                    <input className="atom-input" type="date" style={{width:140}} value={a.deadline}
                      onChange={e=>{const n=[...form.agreements];n[i]={...n[i],deadline:e.target.value};setForm({...form,agreements:n});}}/>
                  </div>
                ))}
              </div>

              <div>
                <label style={{ fontSize:'.8rem', fontWeight:600, display:'block', marginBottom:4 }}>Fecha de alerta</label>
                <input className="atom-input" type="date" value={form.alertDate} onChange={e=>setForm({...form,alertDate:e.target.value})}/>
                <p style={{ fontSize:'.72rem', color:'#9CA3AF', marginTop:4 }}>Se enviará recordatorio 3 días antes si no se marca como completada.</p>
              </div>

              <div style={{ display:'flex', gap:'.75rem' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setTab('tracking')}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar minuta</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
