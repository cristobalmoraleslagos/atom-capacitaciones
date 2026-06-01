'use client';
import { useState, useEffect } from 'react';
import Topbar from '@/components/layout/Topbar';
import { tenders, Tender } from '@/lib/api';

const STATUS_BADGE: Record<string, string> = {
  'Activo': 'badge-green', 'Publicada': 'badge-green',
  'Cerrada': 'badge-gray', 'Adjudicada': 'badge-cyan',
  'Desierta': 'badge-red',
};

const fmt = (n: number) => new Intl.NumberFormat('es-CL', { style:'currency', currency:'CLP', maximumFractionDigits:0 }).format(n);

export default function TendersPage() {
  const [list,     setList]     = useState<Tender[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [running,  setRunning]  = useState(false);
  const [filter,   setFilter]   = useState('');
  const [search,   setSearch]   = useState('');

  const load = async (status?: string) => {
    setLoading(true);
    try { setList(await tenders.list(status || undefined)); }
    catch { setList([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const runNow = async () => {
    setRunning(true);
    try {
      const res = await tenders.run();
      alert(`✅ Búsqueda completada. ${res.found} licitaciones nuevas encontradas.`);
      load();
    } catch { alert('Error al ejecutar búsqueda.'); }
    finally { setRunning(false); }
  };

  const filtered = list.filter(t =>
    (!filter || t.status === filter) &&
    (!search || t.name.toLowerCase().includes(search.toLowerCase()) || t.entity.toLowerCase().includes(search.toLowerCase()))
  );

  const statuses = Array.from(new Set(list.map(t => t.status)));

  return (
    <div>
      <Topbar
        title="Licitaciones"
        subtitle="Mercado Público — monitoreo automático 9:00 y 15:00 hrs"
        actions={
          <div style={{ display:'flex', gap:'.75rem' }}>
            <a href={tenders.export()} target="_blank" rel="noreferrer" className="btn btn-outline">
              📥 Exportar Excel
            </a>
            <button className="btn btn-primary" onClick={runNow} disabled={running}>
              {running ? '🔍 Buscando...' : '🔍 Buscar ahora'}
            </button>
          </div>
        }
      />

      <div style={{ padding:'1.75rem', display:'flex', flexDirection:'column', gap:'1.5rem' }}>

        {/* KPIs rápidos */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:'1rem' }}>
          {[
            { label:'Total licitaciones', value: list.length, icon:'📋', color:'#E82429' },
            { label:'Activas',  value: list.filter(t => t.status === 'Activo' || t.status === 'Publicada').length, icon:'🟢', color:'#16A34A' },
            { label:'Cerradas', value: list.filter(t => t.status === 'Cerrada').length, icon:'🔴', color:'#6B7280' },
          ].map(k => (
            <div key={k.label} className="card" style={{ textAlign:'center' }}>
              <p style={{ fontSize:'1.5rem' }}>{k.icon}</p>
              <p style={{ fontFamily:'Rajdhani,sans-serif', fontSize:'2rem', fontWeight:700, color: k.color }}>{k.value}</p>
              <p style={{ fontSize:'.75rem', color:'#6B7280' }}>{k.label}</p>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap' }}>
          <input
            className="atom-input" style={{ maxWidth:300 }}
            placeholder="🔍 Buscar por nombre u organismo..."
            value={search} onChange={e => setSearch(e.target.value)}
          />
          <select className="atom-input" style={{ maxWidth:200 }} value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="">Todos los estados</option>
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Tabla */}
        <div className="card" style={{ padding:0, overflow:'hidden' }}>
          <div style={{ padding:'1rem 1.5rem', borderBottom:'1px solid #F0F0F0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <h3 style={{ fontFamily:'Rajdhani,sans-serif', fontWeight:700 }}>
              Licitaciones registradas
            </h3>
            <span style={{ fontSize:'.8rem', color:'#6B7280' }}>{filtered.length} resultados</span>
          </div>

          {loading ? (
            <div style={{ padding:'3rem', textAlign:'center', color:'#9CA3AF' }}>Cargando licitaciones...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding:'3rem', textAlign:'center', color:'#9CA3AF' }}>
              <p style={{ fontSize:'2rem' }}>📋</p>
              <p style={{ fontWeight:600, marginTop:'.75rem' }}>
                {list.length === 0 ? 'Sin licitaciones. Ejecuta una búsqueda para obtener datos.' : 'Sin resultados para el filtro aplicado.'}
              </p>
            </div>
          ) : (
            <div style={{ overflowX:'auto' }}>
              <table className="atom-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Licitación</th>
                    <th>Organismo</th>
                    <th>Tipo</th>
                    <th>Estado</th>
                    <th>Monto estimado</th>
                    <th>Cierre</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(t => {
                    const daysLeft = t.closeDate
                      ? Math.ceil((new Date(t.closeDate).getTime() - Date.now()) / 86400000)
                      : null;

                    return (
                      <tr key={t.id}>
                        <td style={{ fontFamily:'monospace', fontSize:'.78rem', color:'#6B7280' }}>{t.externalId}</td>
                        <td style={{ maxWidth:280 }}>
                          <p style={{ fontWeight:600, fontSize:'.875rem', lineClamp:2 }}>{t.name}</p>
                        </td>
                        <td style={{ fontSize:'.8rem', color:'#374151' }}>{t.entity}</td>
                        <td style={{ fontSize:'.78rem', color:'#6B7280' }}>{t.type ?? '—'}</td>
                        <td>
                          <span className={`badge ${STATUS_BADGE[t.status] ?? 'badge-gray'}`}>
                            {t.status}
                          </span>
                        </td>
                        <td style={{ fontWeight:600, fontSize:'.875rem' }}>
                          {t.amount ? fmt(t.amount) : '—'}
                        </td>
                        <td>
                          {t.closeDate ? (
                            <div>
                              <p style={{ fontSize:'.8rem' }}>{new Date(t.closeDate).toLocaleDateString('es-CL')}</p>
                              {daysLeft !== null && (
                                <p style={{
                                  fontSize:'.7rem', fontWeight:600,
                                  color: daysLeft <= 3 ? '#E82429' : daysLeft <= 7 ? '#D97706' : '#16A34A',
                                }}>
                                  {daysLeft <= 0 ? 'Cerrada' : `${daysLeft} días`}
                                </p>
                              )}
                            </div>
                          ) : '—'}
                        </td>
                        <td>
                          {t.url && (
                            <a href={t.url} target="_blank" rel="noreferrer"
                              style={{ fontSize:'.78rem', color:'#E82429', fontWeight:600, textDecoration:'none' }}>
                              Ver →
                            </a>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info automatización */}
        <div style={{
          background:'rgba(0,200,224,.06)', border:'1px solid rgba(0,200,224,.2)',
          borderRadius:12, padding:'1rem 1.25rem', display:'flex', gap:'1rem', alignItems:'flex-start',
        }}>
          <span style={{ fontSize:'1.25rem' }}>🤖</span>
          <div>
            <p style={{ fontWeight:700, fontSize:'.875rem', color:'#0891B2', marginBottom:2 }}>
              Automatización activa
            </p>
            <p style={{ fontSize:'.8rem', color:'#6B7280', lineHeight:1.5 }}>
              El sistema busca automáticamente en Mercado Público a las <strong>09:00</strong> y <strong>15:00 hrs</strong>, lunes a viernes.
              Solo envía alertas por email cuando hay licitaciones <strong>nuevas</strong> relacionadas con capacitación, coaching, liderazgo y recursos humanos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
