'use client';
import { useState, useEffect } from 'react';
import Topbar from '@/components/layout/Topbar';
import { finance, FinanceDashboard } from '@/lib/api';
import { DEMO_FINANCE } from '@/lib/demo-data';

const fmt  = (n: number) => new Intl.NumberFormat('es-CL', { style:'currency', currency:'CLP', maximumFractionDigits:0 }).format(n);
const fmtM = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`;
const isDemo = () => typeof window !== 'undefined' && localStorage.getItem('atom_token') === 'demo-token-no-backend';

type Tab = 'resumen'|'cashflow'|'rrhh'|'costos'|'equilibrio'|'escenarios'|'metas';

const TABS: { key: Tab; label: string }[] = [
  { key:'resumen',    label:'📊 Resumen'         },
  { key:'cashflow',   label:'💧 Flujo de Caja'   },
  { key:'rrhh',       label:'👥 RRHH / Sueldos'  },
  { key:'costos',     label:'📦 Costos'           },
  { key:'equilibrio', label:'⚖️ Punto Equilibrio' },
  { key:'escenarios', label:'🔭 Escenarios'       },
  { key:'metas',      label:'🎯 Metas'            },
];

export default function FinancePage() {
  const [tab, setTab] = useState<Tab>('resumen');
  const [data, setData] = useState<FinanceDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const d = DEMO_FINANCE;

  useEffect(() => {
    if (isDemo()) { setLoading(false); return; }
    finance.dashboard()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const summary = isDemo() ? d.summary : data?.summary;

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', padding:'4rem', color:'#9CA3AF' }}>
      Cargando módulo financiero...
    </div>
  );

  return (
    <div>
      <Topbar
        title="Análisis Financiero"
        subtitle="RRHH · Costos · Flujo de Caja · Escenarios · Metas"
      />

      <div style={{ padding:'1.5rem', display:'flex', flexDirection:'column', gap:'1.25rem' }}>

        {/* KPI header */}
        {summary && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))', gap:'1rem' }}>
            {[
              { label:'Ingresos totales',  value:fmt(summary.totalRevenue),  icon:'📈', color:'#16A34A', bg:'#DCFCE7' },
              { label:'Costos totales',    value:fmt(summary.totalExpenses), icon:'📉', color:'#E82429', bg:'#FEE2E2' },
              { label:'Utilidad neta',     value:fmt(summary.netProfit),     icon:'💵', color:'#0891B2', bg:'#CFFAFE' },
              { label:'Margen neto',       value:fmtM(summary.avgNetMargin), icon:'📊', color:'#7C3AED', bg:'#EDE9FE' },
            ].map(k => (
              <div key={k.label} className="stat-card">
                <div className="stat-icon" style={{ background:k.bg, color:k.color }}>{k.icon}</div>
                <div>
                  <p style={{ fontSize:'.72rem', color:'#6B7280', fontWeight:500 }}>{k.label}</p>
                  <p style={{ fontSize:'1.25rem', fontWeight:700, fontFamily:'Rajdhani,sans-serif', color:'#1E1E1E' }}>{k.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display:'flex', gap:'.25rem', flexWrap:'wrap', borderBottom:'2px solid #E5E7EB' }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{
                padding:'.55rem 1rem', border:'none', background:'none', cursor:'pointer',
                fontWeight:600, fontSize:'.8rem', whiteSpace:'nowrap',
                color: tab === t.key ? '#E82429' : '#6B7280',
                borderBottom: tab === t.key ? '2px solid #E82429' : '2px solid transparent',
                marginBottom:-2, transition:'all .15s',
              }}>{t.label}
            </button>
          ))}
        </div>

        {/* ── RESUMEN ─────────────────────────────────────────────────────── */}
        {tab === 'resumen' && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.25rem' }}>

            <div className="card">
              <h4 style={{ fontFamily:'Rajdhani,sans-serif', fontWeight:700, marginBottom:'1rem' }}>
                Estructura de ingresos 2026
              </h4>
              {[
                { label:'Contratos sector público', monto:24_800_000, pct:58 },
                { label:'Empresas privadas',         monto:12_400_000, pct:29 },
                { label:'Inscripciones directas',    monto:4_200_000,  pct:10 },
                { label:'Otros',                     monto:1_400_000,  pct:3  },
              ].map(r => (
                <div key={r.label} style={{ marginBottom:'.875rem' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                    <span style={{ fontSize:'.8rem', fontWeight:500 }}>{r.label}</span>
                    <span style={{ fontSize:'.8rem', fontWeight:700 }}>{fmt(r.monto)}</span>
                  </div>
                  <div style={{ height:6, background:'#F0F0F0', borderRadius:3 }}>
                    <div style={{ height:'100%', borderRadius:3, background:'#E82429', width:`${r.pct}%` }}/>
                  </div>
                  <p style={{ fontSize:'.7rem', color:'#9CA3AF', marginTop:2 }}>{r.pct}% del total</p>
                </div>
              ))}
            </div>

            <div className="card">
              <h4 style={{ fontFamily:'Rajdhani,sans-serif', fontWeight:700, marginBottom:'1rem' }}>
                Distribución de costos
              </h4>
              {d.costos.map(c => (
                <div key={c.categoria} style={{ marginBottom:'.75rem' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                    <span style={{ fontSize:'.78rem' }}>{c.categoria}</span>
                    <span style={{ fontSize:'.78rem', fontWeight:700 }}>{fmt(c.monto)}</span>
                  </div>
                  <div style={{ height:5, background:'#F0F0F0', borderRadius:3 }}>
                    <div style={{ height:'100%', borderRadius:3, background:'#00C8E0', width:`${c.porcentaje * 3.5}%` }}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── FLUJO DE CAJA ────────────────────────────────────────────────── */}
        {tab === 'cashflow' && (
          <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:'1rem' }}>
              {[
                { label:'Saldo actual (Jun)', value: fmt(d.cashflow[5].saldo), color:'#16A34A' },
                { label:'Proyección Dic',     value: fmt(d.cashflow[11].saldo), color:'#0891B2' },
                { label:'Crecimiento proyect.',value:'+151%', color:'#7C3AED' },
              ].map(k => (
                <div key={k.label} className="card" style={{ textAlign:'center' }}>
                  <p style={{ fontSize:'.75rem', color:'#6B7280' }}>{k.label}</p>
                  <p style={{ fontFamily:'Rajdhani,sans-serif', fontSize:'1.75rem', fontWeight:700, color:k.color, marginTop:4 }}>{k.value}</p>
                </div>
              ))}
            </div>

            <div className="card" style={{ padding:0, overflow:'hidden' }}>
              <div style={{ padding:'1rem 1.5rem', borderBottom:'1px solid #F0F0F0' }}>
                <h4 style={{ fontFamily:'Rajdhani,sans-serif', fontWeight:700 }}>
                  Flujo de caja mensual 2026 — Real + Proyectivo
                </h4>
              </div>
              <div style={{ overflowX:'auto' }}>
                <table className="atom-table">
                  <thead>
                    <tr>
                      <th>Mes</th>
                      <th>Ingresos</th>
                      <th>Egresos</th>
                      <th>Flujo neto</th>
                      <th>Saldo acum.</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {d.cashflow.map((m, i) => {
                      const flujo = m.ingresos - m.egresos;
                      const proyectado = i >= 6;
                      return (
                        <tr key={m.mes} style={{ opacity: proyectado ? .75 : 1 }}>
                          <td>
                            <span style={{ fontWeight:600 }}>{m.mes}</span>
                            {proyectado && <span className="badge badge-cyan" style={{ marginLeft:6, fontSize:'.6rem' }}>proy.</span>}
                          </td>
                          <td style={{ color:'#16A34A', fontWeight:600 }}>{fmt(m.ingresos)}</td>
                          <td style={{ color:'#E82429', fontWeight:600 }}>{fmt(m.egresos)}</td>
                          <td style={{ fontWeight:700, color: flujo >= 0 ? '#16A34A' : '#E82429' }}>
                            {fmt(flujo)}
                          </td>
                          <td style={{ fontWeight:700 }}>{fmt(m.saldo)}</td>
                          <td>
                            <div style={{ width:80, height:6, background:'#F0F0F0', borderRadius:3 }}>
                              <div style={{
                                height:'100%', borderRadius:3,
                                background: proyectado ? '#00C8E0' : '#E82429',
                                width:`${Math.min((flujo / 4_000_000) * 100, 100)}%`,
                              }}/>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── RRHH / SUELDOS ──────────────────────────────────────────────── */}
        {tab === 'rrhh' && (
          <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:'1rem' }}>
              {[
                { label:'Trabajadores planta',  value: d.rrhh.totalPlanta,                            icon:'👤', color:'#0891B2' },
                { label:'Honorarios activos',   value: d.rrhh.totalHonorarios,                         icon:'📄', color:'#7C3AED' },
                { label:'Costo mensual total',  value: fmt(d.rrhh.costoMensualTotal),                  icon:'💰', color:'#E82429' },
                { label:'Previsión social total',value: fmt(d.rrhh.previsionSocial.total),             icon:'🏥', color:'#16A34A' },
              ].map(k => (
                <div key={k.label} className="stat-card">
                  <div className="stat-icon" style={{ background:'#F4F4F6', color:k.color, fontSize:'1.1rem' }}>{k.icon}</div>
                  <div>
                    <p style={{ fontSize:'.72rem', color:'#6B7280' }}>{k.label}</p>
                    <p style={{ fontFamily:'Rajdhani,sans-serif', fontSize:'1.2rem', fontWeight:700, color:'#1E1E1E' }}>{k.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Sueldos planta */}
            <div className="card" style={{ padding:0, overflow:'hidden' }}>
              <div style={{ padding:'1rem 1.5rem', borderBottom:'1px solid #F0F0F0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <h4 style={{ fontFamily:'Rajdhani,sans-serif', fontWeight:700 }}>Remuneraciones — Planta</h4>
                <span className="badge badge-gray">{d.rrhh.totalPlanta} trabajadores</span>
              </div>
              <table className="atom-table">
                <thead><tr><th>Cargo</th><th>Bruto</th><th>Previsión</th><th>Líquido</th></tr></thead>
                <tbody>
                  {d.rrhh.sueldos.map(s => (
                    <tr key={s.cargo}>
                      <td style={{ fontWeight:600 }}>{s.cargo}</td>
                      <td>{fmt(s.bruto)}</td>
                      <td style={{ color:'#E82429' }}>{fmt(s.prevision)}</td>
                      <td style={{ fontWeight:700, color:'#16A34A' }}>{fmt(s.liquido)}</td>
                    </tr>
                  ))}
                  <tr style={{ background:'#F9FAFB', fontWeight:700 }}>
                    <td>TOTAL</td>
                    <td>{fmt(d.rrhh.sueldos.reduce((s,r)=>s+r.bruto,0))}</td>
                    <td style={{ color:'#E82429' }}>{fmt(d.rrhh.sueldos.reduce((s,r)=>s+r.prevision,0))}</td>
                    <td style={{ color:'#16A34A' }}>{fmt(d.rrhh.sueldos.reduce((s,r)=>s+r.liquido,0))}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Honorarios */}
            <div className="card" style={{ padding:0, overflow:'hidden' }}>
              <div style={{ padding:'1rem 1.5rem', borderBottom:'1px solid #F0F0F0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <h4 style={{ fontFamily:'Rajdhani,sans-serif', fontWeight:700 }}>Honorarios — Relatores y Consultores</h4>
                <span className="badge badge-cyan">{d.rrhh.totalHonorarios} contratos</span>
              </div>
              <table className="atom-table">
                <thead><tr><th>Nombre / Rol</th><th>Honorario bruto</th><th>Retención 10%</th><th>Líquido a pagar</th></tr></thead>
                <tbody>
                  {d.rrhh.honorarios.map(h => (
                    <tr key={h.nombre}>
                      <td style={{ fontWeight:600 }}>{h.nombre}</td>
                      <td>{fmt(h.monto)}</td>
                      <td style={{ color:'#D97706' }}>{fmt(h.retencion)}</td>
                      <td style={{ fontWeight:700 }}>{fmt(h.monto - h.retencion)}</td>
                    </tr>
                  ))}
                  <tr style={{ background:'#F9FAFB', fontWeight:700 }}>
                    <td>TOTAL</td>
                    <td>{fmt(d.rrhh.honorarios.reduce((s,h)=>s+h.monto,0))}</td>
                    <td style={{ color:'#D97706' }}>{fmt(d.rrhh.honorarios.reduce((s,h)=>s+h.retencion,0))}</td>
                    <td>{fmt(d.rrhh.honorarios.reduce((s,h)=>s+h.monto-h.retencion,0))}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Previsión Social */}
            <div className="card">
              <h4 style={{ fontFamily:'Rajdhani,sans-serif', fontWeight:700, marginBottom:'1rem' }}>
                Previsión Social — Resumen mensual
              </h4>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:'1rem' }}>
                {[
                  { label:'AFP', value:d.rrhh.previsionSocial.afp },
                  { label:'Salud (FONASA/Isapre)', value:d.rrhh.previsionSocial.salud },
                  { label:'Mutual de Seguridad', value:d.rrhh.previsionSocial.mutual },
                  { label:'Seguro Cesantía', value:d.rrhh.previsionSocial.seguroCesantia },
                ].map(p => (
                  <div key={p.label} style={{ background:'#F9FAFB', borderRadius:10, padding:'1rem', textAlign:'center', border:'1px solid #F0F0F0' }}>
                    <p style={{ fontSize:'.75rem', color:'#6B7280', marginBottom:4 }}>{p.label}</p>
                    <p style={{ fontFamily:'Rajdhani,sans-serif', fontSize:'1.3rem', fontWeight:700, color:'#E82429' }}>{fmt(p.value)}</p>
                  </div>
                ))}
              </div>
              <div style={{ marginTop:'1rem', padding:'.875rem 1rem', background:'#FEE2E2', borderRadius:8, display:'flex', justifyContent:'space-between' }}>
                <span style={{ fontWeight:700 }}>TOTAL previsión social mensual</span>
                <span style={{ fontWeight:700, color:'#E82429', fontFamily:'Rajdhani,sans-serif', fontSize:'1.1rem' }}>{fmt(d.rrhh.previsionSocial.total)}</span>
              </div>
            </div>
          </div>
        )}

        {/* ── COSTOS ──────────────────────────────────────────────────────── */}
        {tab === 'costos' && (
          <div className="card">
            <h4 style={{ fontFamily:'Rajdhani,sans-serif', fontWeight:700, marginBottom:'1.25rem' }}>
              Estructura de costos operacionales mensuales
            </h4>
            <table className="atom-table">
              <thead><tr><th>Categoría</th><th>Monto mensual</th><th>% del total</th><th>Distribución</th></tr></thead>
              <tbody>
                {d.costos.map(c => (
                  <tr key={c.categoria}>
                    <td style={{ fontWeight:600 }}>{c.categoria}</td>
                    <td style={{ fontWeight:700 }}>{fmt(c.monto)}</td>
                    <td>
                      <span className="badge badge-gray">{c.porcentaje}%</span>
                    </td>
                    <td style={{ width:160 }}>
                      <div style={{ height:8, background:'#F0F0F0', borderRadius:4 }}>
                        <div style={{ height:'100%', borderRadius:4, background:'#E82429', width:`${c.porcentaje * 3}%` }}/>
                      </div>
                    </td>
                  </tr>
                ))}
                <tr style={{ background:'#FEF2F2' }}>
                  <td style={{ fontWeight:700 }}>TOTAL COSTOS MENSUALES</td>
                  <td style={{ fontWeight:700, color:'#E82429', fontFamily:'Rajdhani,sans-serif', fontSize:'1.1rem' }}>
                    {fmt(d.costos.reduce((s,c)=>s+c.monto,0))}
                  </td>
                  <td><span className="badge badge-red">100%</span></td>
                  <td/>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* ── PUNTO DE EQUILIBRIO ──────────────────────────────────────────── */}
        {tab === 'equilibrio' && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.25rem' }}>

            <div className="card">
              <h4 style={{ fontFamily:'Rajdhani,sans-serif', fontWeight:700, marginBottom:'1.25rem' }}>
                ⚖️ Punto de equilibrio
              </h4>
              {[
                { label:'Costos fijos mensuales',        value: fmt(d.puntoEquilibrio.costosFijos) },
                { label:'Costos variables (% ingresos)', value: `${d.puntoEquilibrio.costosVariablesPct}%` },
                { label:'Precio prom. por actividad',    value: fmt(d.puntoEquilibrio.precioPromedioActividad) },
                { label:'Margen de contribución',        value: fmt(d.puntoEquilibrio.margenContribucion) },
              ].map(r => (
                <div key={r.label} style={{
                  display:'flex', justifyContent:'space-between',
                  padding:'.75rem 0', borderBottom:'1px solid #F0F0F0',
                }}>
                  <span style={{ fontSize:'.875rem', color:'#6B7280' }}>{r.label}</span>
                  <span style={{ fontWeight:700, fontFamily:'Rajdhani,sans-serif' }}>{r.value}</span>
                </div>
              ))}
            </div>

            <div className="card" style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              <h4 style={{ fontFamily:'Rajdhani,sans-serif', fontWeight:700 }}>Resultado del cálculo</h4>

              <div style={{ textAlign:'center', padding:'1.5rem', background:'linear-gradient(135deg,#E82429,#C01C20)', borderRadius:12, color:'white' }}>
                <p style={{ fontSize:'.8rem', opacity:.8 }}>Actividades para equilibrio</p>
                <p style={{ fontFamily:'Rajdhani,sans-serif', fontSize:'3.5rem', fontWeight:700, lineHeight:1 }}>
                  {d.puntoEquilibrio.actividadesParaEquilibrio}
                </p>
                <p style={{ fontSize:'.78rem', opacity:.8, marginTop:4 }}>actividades / mes</p>
              </div>

              <div style={{ textAlign:'center', padding:'1rem', background:'#F4F4F6', borderRadius:10 }}>
                <p style={{ fontSize:'.78rem', color:'#6B7280' }}>Ingresos mínimos requeridos</p>
                <p style={{ fontFamily:'Rajdhani,sans-serif', fontSize:'1.5rem', fontWeight:700, color:'#1E1E1E' }}>
                  {fmt(d.puntoEquilibrio.ingresosEquilibrio)}
                </p>
              </div>

              <div style={{ background:'#DCFCE7', borderRadius:10, padding:'1rem', textAlign:'center' }}>
                <p style={{ fontSize:'.78rem', color:'#16A34A', fontWeight:600 }}>
                  ✅ Equilibrio alcanzado en {d.puntoEquilibrio.mesesParaEquilibrio} meses
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── ESCENARIOS ──────────────────────────────────────────────────── */}
        {tab === 'escenarios' && (
          <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
            <div style={{ background:'rgba(0,200,224,.06)', border:'1px solid rgba(0,200,224,.2)', borderRadius:12, padding:'1rem 1.25rem' }}>
              <p style={{ fontWeight:700, color:'#0891B2', fontSize:'.875rem' }}>🔭 Sensibilización de escenarios</p>
              <p style={{ fontSize:'.8rem', color:'#6B7280', marginTop:2 }}>
                Proyección anual bajo diferentes supuestos de negocio para ATOM Capacitaciones.
              </p>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:'1rem' }}>
              {d.escenarios.map(e => (
                <div key={e.nombre} className="card" style={{ borderTop:`4px solid ${e.color}` }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'.875rem' }}>
                    <h4 style={{ fontFamily:'Rajdhani,sans-serif', fontWeight:700, fontSize:'1.1rem', color:e.color }}>
                      {e.nombre}
                    </h4>
                    <span className="badge" style={{ background:`${e.color}20`, color:e.color }}>
                      {fmtM(e.margen)}
                    </span>
                  </div>
                  <p style={{ fontSize:'.75rem', color:'#9CA3AF', marginBottom:'1rem', fontStyle:'italic' }}>
                    "{e.supuesto}"
                  </p>
                  {[
                    { label:'Ingresos', value:fmt(e.ingresos), color:'#16A34A' },
                    { label:'Costos',   value:fmt(e.costos),   color:'#E82429' },
                    { label:'Resultado',value:fmt(e.resultado), color:e.resultado >= 0 ? '#16A34A' : '#E82429' },
                  ].map(r => (
                    <div key={r.label} style={{ display:'flex', justifyContent:'space-between', padding:'.5rem 0', borderBottom:'1px solid #F0F0F0' }}>
                      <span style={{ fontSize:'.8rem', color:'#6B7280' }}>{r.label}</span>
                      <span style={{ fontWeight:700, color:r.color, fontSize:'.875rem' }}>{r.value}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── METAS DE CUMPLIMIENTO ────────────────────────────────────────── */}
        {tab === 'metas' && (
          <div className="card">
            <h4 style={{ fontFamily:'Rajdhani,sans-serif', fontWeight:700, marginBottom:'1.25rem' }}>
              🎯 Metas de cumplimiento 2026
            </h4>
            <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
              {d.metas.map(m => {
                const pct = Math.min((m.actual / m.meta) * 100, 100);
                const color = pct >= 90 ? '#16A34A' : pct >= 60 ? '#D97706' : '#E82429';
                const esMoneda = m.unidad === '$';
                const valFmt = (v: number) => esMoneda ? fmt(v) : `${v.toLocaleString('es-CL')} ${m.unidad}`;
                return (
                  <div key={m.nombre}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6, alignItems:'center' }}>
                      <span style={{ fontWeight:600, fontSize:'.875rem' }}>{m.nombre}</span>
                      <div style={{ display:'flex', gap:'.75rem', alignItems:'center' }}>
                        <span style={{ fontSize:'.78rem', color:'#9CA3AF' }}>
                          {valFmt(m.actual)} / {valFmt(m.meta)}
                        </span>
                        <span style={{
                          fontFamily:'Rajdhani,sans-serif', fontWeight:700,
                          fontSize:'1rem', color, minWidth:48, textAlign:'right',
                        }}>
                          {pct.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <div style={{ height:10, background:'#F0F0F0', borderRadius:5, overflow:'hidden' }}>
                      <div style={{
                        height:'100%', borderRadius:5,
                        background:`linear-gradient(90deg, ${color}, ${color}99)`,
                        width:`${pct}%`,
                        transition:'width .6s ease',
                      }}/>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Resumen semáforo */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem', marginTop:'1.5rem', paddingTop:'1.25rem', borderTop:'2px solid #F0F0F0' }}>
              {[
                { label:'En objetivo',  count: d.metas.filter(m=>(m.actual/m.meta)>=.9).length,  color:'#16A34A', bg:'#DCFCE7', icon:'✅' },
                { label:'En riesgo',    count: d.metas.filter(m=>(m.actual/m.meta)>=.6&&(m.actual/m.meta)<.9).length, color:'#D97706', bg:'#FEF3C7', icon:'⚠️' },
                { label:'Crítico',      count: d.metas.filter(m=>(m.actual/m.meta)<.6).length,   color:'#E82429', bg:'#FEE2E2', icon:'🚨' },
              ].map(s => (
                <div key={s.label} style={{ background:s.bg, borderRadius:10, padding:'1rem', textAlign:'center' }}>
                  <p style={{ fontSize:'1.5rem' }}>{s.icon}</p>
                  <p style={{ fontFamily:'Rajdhani,sans-serif', fontSize:'2rem', fontWeight:700, color:s.color }}>{s.count}</p>
                  <p style={{ fontSize:'.75rem', color:s.color, fontWeight:600 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
