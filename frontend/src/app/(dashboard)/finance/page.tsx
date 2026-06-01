'use client';
import { useState, useEffect } from 'react';
import Topbar from '@/components/layout/Topbar';
import { finance, FinanceDashboard } from '@/lib/api';

const fmt = (n: number) => new Intl.NumberFormat('es-CL', { style:'currency', currency:'CLP', maximumFractionDigits:0 }).format(n);
const fmtP = (n: number) => `${n.toFixed(1)}%`;

export default function FinancePage() {
  const [data, setData]       = useState<FinanceDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]       = useState({ period:'', revenue:'', expenses:'', description:'' });

  const load = async () => {
    try {
      setLoading(true);
      setData(await finance.dashboard());
    } catch { setError('Sin acceso. Se requiere rol FINANCE o ADMIN.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    await finance.createRecord({
      period: form.period,
      revenue: Number(form.revenue),
      expenses: Number(form.expenses),
      description: form.description,
    });
    setShowForm(false);
    setForm({ period:'', revenue:'', expenses:'', description:'' });
    load();
  };

  const summary = data?.summary;

  return (
    <div>
      <Topbar
        title="Análisis Financiero"
        subtitle="Módulo restringido — roles ADMIN y FINANCE"
        actions={
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            + Nuevo registro
          </button>
        }
      />

      <div style={{ padding:'1.75rem', display:'flex', flexDirection:'column', gap:'1.5rem' }}>

        {error && (
          <div style={{ background:'#FEE2E2', border:'1px solid #FECACA', borderRadius:10, padding:'1rem 1.25rem', color:'#E82429' }}>
            🔒 {error}
          </div>
        )}

        {loading && !data && (
          <div style={{ display:'flex', justifyContent:'center', padding:'3rem' }}>
            <div style={{ color:'#6B7280' }}>Cargando datos financieros...</div>
          </div>
        )}

        {summary && (
          <>
            {/* KPI cards */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'1rem' }}>
              {[
                { label:'Ingresos totales',   value: fmt(summary.totalRevenue),   icon:'📈', color:'#16A34A', bg:'#DCFCE7' },
                { label:'Gastos totales',      value: fmt(summary.totalExpenses),  icon:'📉', color:'#E82429', bg:'#FEE2E2' },
                { label:'Utilidad neta',       value: fmt(summary.netProfit),      icon:'💵', color:'#0891B2', bg:'#CFFAFE' },
                { label:'Margen neto prom.',   value: fmtP(summary.avgNetMargin),  icon:'📊', color:'#7C3AED', bg:'#EDE9FE' },
              ].map(k => (
                <div key={k.label} className="stat-card">
                  <div className="stat-icon" style={{ background:k.bg, color:k.color }}>{k.icon}</div>
                  <div>
                    <p style={{ fontSize:'.73rem', color:'#6B7280', fontWeight:500 }}>{k.label}</p>
                    <p style={{ fontSize:'1.3rem', fontWeight:700, fontFamily:'Rajdhani,sans-serif', color:'#1E1E1E' }}>{k.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Tabla de registros */}
            <div className="card">
              <h3 style={{ fontFamily:'Rajdhani,sans-serif', fontWeight:700, fontSize:'1.1rem', marginBottom:'1rem' }}>
                Registros financieros
              </h3>
              <div style={{ overflowX:'auto' }}>
                <table className="atom-table">
                  <thead>
                    <tr>
                      <th>Período</th>
                      <th>Ingresos</th>
                      <th>Gastos</th>
                      <th>Margen</th>
                      <th>Descripción</th>
                      <th>Registrado por</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data!.records.map(r => (
                      <tr key={r.id}>
                        <td><span style={{ fontWeight:600 }}>{r.period}</span></td>
                        <td style={{ color:'#16A34A', fontWeight:600 }}>{fmt(r.revenue)}</td>
                        <td style={{ color:'#E82429', fontWeight:600 }}>{fmt(r.expenses)}</td>
                        <td>
                          <span className={`badge ${r.netMargin >= 0 ? 'badge-green' : 'badge-red'}`}>
                            {fmtP(r.netMargin)}
                          </span>
                        </td>
                        <td style={{ color:'#6B7280', fontSize:'.8rem' }}>{r.description ?? '—'}</td>
                        <td style={{ fontSize:'.78rem', color:'#9CA3AF' }}>{r.generatedBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal nuevo registro */}
      {showForm && (
        <div style={{
          position:'fixed', inset:0, background:'rgba(0,0,0,.5)',
          display:'flex', alignItems:'center', justifyContent:'center', zIndex:100,
        }}>
          <div className="card" style={{ width:480, maxWidth:'95vw' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
              <h3 style={{ fontFamily:'Rajdhani,sans-serif', fontWeight:700, fontSize:'1.25rem' }}>Nuevo registro financiero</h3>
              <button onClick={() => setShowForm(false)} style={{ background:'none', border:'none', fontSize:'1.2rem', cursor:'pointer' }}>✕</button>
            </div>
            <form onSubmit={save} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              <div>
                <label style={{ fontSize:'.8rem', fontWeight:600, display:'block', marginBottom:4 }}>Período (ej: 2026-Q1)</label>
                <input className="atom-input" value={form.period} onChange={e => setForm({...form, period:e.target.value})} required placeholder="2026-Q1"/>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
                <div>
                  <label style={{ fontSize:'.8rem', fontWeight:600, display:'block', marginBottom:4 }}>Ingresos ($)</label>
                  <input className="atom-input" type="number" value={form.revenue} onChange={e => setForm({...form, revenue:e.target.value})} required placeholder="0"/>
                </div>
                <div>
                  <label style={{ fontSize:'.8rem', fontWeight:600, display:'block', marginBottom:4 }}>Gastos ($)</label>
                  <input className="atom-input" type="number" value={form.expenses} onChange={e => setForm({...form, expenses:e.target.value})} required placeholder="0"/>
                </div>
              </div>
              <div>
                <label style={{ fontSize:'.8rem', fontWeight:600, display:'block', marginBottom:4 }}>Descripción</label>
                <input className="atom-input" value={form.description} onChange={e => setForm({...form, description:e.target.value})} placeholder="Opcional"/>
              </div>
              <div style={{ display:'flex', gap:'.75rem', marginTop:'.5rem' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar registro</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
