'use client';
import { useState, useEffect } from 'react';
import Topbar from '@/components/layout/Topbar';
import { social, SocialMetric, WeeklyContent, Campaign } from '@/lib/api';

const PLATFORM_COLORS: Record<string, string> = {
  instagram: '#E1306C', facebook: '#1877F2', linkedin: '#0A66C2', twitter: '#1DA1F2',
};
const PLATFORM_ICONS: Record<string, string> = {
  instagram: '📷', facebook: '👤', linkedin: '💼', twitter: '🐦',
};

export default function SocialPage() {
  const [metrics,   setMetrics]   = useState<SocialMetric[]>([]);
  const [content,   setContent]   = useState<WeeklyContent[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [generating, setGenerating] = useState(false);
  const [tab, setTab] = useState<'metrics'|'content'|'campaigns'>('metrics');

  useEffect(() => {
    social.metrics().then(r => setMetrics(r.metrics)).catch(()=>{});
    social.weeklyContent().then(r => setContent(r)).catch(()=>{});
    social.campaigns().then(r => setCampaigns(r.data ?? [])).catch(()=>{});
  }, []);

  const generate = async () => {
    setGenerating(true);
    try {
      const res = await social.generateContent();
      setContent(prev => [res, ...prev]);
    } finally { setGenerating(false); }
  };

  const latest = content[0];

  return (
    <div>
      <Topbar
        title="Redes Sociales"
        subtitle="Métricas, campañas y contenido generado con IA"
        actions={
          <button className="btn btn-cyan" onClick={generate} disabled={generating}>
            {generating ? '⏳ Generando...' : '✨ Generar contenido IA'}
          </button>
        }
      />

      <div style={{ padding:'1.75rem', display:'flex', flexDirection:'column', gap:'1.5rem' }}>

        {/* Tarjetas de métricas por plataforma */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:'1rem' }}>
          {metrics.length === 0
            ? ['instagram','facebook','linkedin'].map(p => (
                <div key={p} className="stat-card" style={{ opacity:.5 }}>
                  <div className="stat-icon" style={{ background:'#F4F4F6' }}>{PLATFORM_ICONS[p]}</div>
                  <div>
                    <p style={{ fontSize:'.75rem', color:'#6B7280', textTransform:'capitalize' }}>{p}</p>
                    <p style={{ fontSize:'1.2rem', fontWeight:700, fontFamily:'Rajdhani,sans-serif', color:'#9CA3AF' }}>Sin datos</p>
                  </div>
                </div>
              ))
            : metrics.map(m => (
                <div key={m.id} className="stat-card">
                  <div className="stat-icon" style={{
                    background: PLATFORM_COLORS[m.platform] + '20',
                    color: PLATFORM_COLORS[m.platform] ?? '#6B7280',
                  }}>
                    {PLATFORM_ICONS[m.platform] ?? '📱'}
                  </div>
                  <div>
                    <p style={{ fontSize:'.75rem', color:'#6B7280', textTransform:'capitalize', fontWeight:500 }}>{m.platform}</p>
                    <p style={{ fontSize:'1.4rem', fontWeight:700, fontFamily:'Rajdhani,sans-serif', color:'#1E1E1E' }}>
                      {m.followers.toLocaleString('es-CL')}
                    </p>
                    <p style={{ fontSize:'.72rem', fontWeight:600,
                      color: m.percentageGrowth >= 0 ? '#16A34A' : '#E82429',
                    }}>
                      {m.percentageGrowth >= 0 ? '▲' : '▼'} {Math.abs(m.percentageGrowth)}% sem.
                    </p>
                  </div>
                </div>
              ))
          }
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:'.5rem', borderBottom:'2px solid #E5E7EB' }}>
          {(['metrics','content','campaigns'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{
                padding:'.6rem 1.25rem', border:'none', background:'none', cursor:'pointer',
                fontWeight:600, fontSize:'.875rem',
                color: tab === t ? '#E82429' : '#6B7280',
                borderBottom: tab === t ? '2px solid #E82429' : '2px solid transparent',
                marginBottom:-2, transition:'all .2s',
              }}>
              {t === 'metrics' ? '📊 Métricas' : t === 'content' ? '✍️ Contenido semanal' : '📣 Campañas'}
            </button>
          ))}
        </div>

        {/* Contenido semanal generado por IA */}
        {tab === 'content' && (
          <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
            {!latest ? (
              <div className="card" style={{ textAlign:'center', padding:'3rem', color:'#9CA3AF' }}>
                <p style={{ fontSize:'2rem', marginBottom:'.75rem' }}>✨</p>
                <p style={{ fontWeight:600 }}>No hay contenido generado aún.</p>
                <p style={{ fontSize:'.875rem', marginTop:4 }}>Haz clic en "Generar contenido IA" para crear el plan de la semana.</p>
              </div>
            ) : (
              <>
                {/* Hero del contenido de la semana */}
                <div style={{
                  background:'linear-gradient(135deg, #00C8E0 0%, #009DB0 100%)',
                  borderRadius:16, padding:'1.75rem 2rem', color:'white',
                }}>
                  <p style={{ fontSize:'.75rem', opacity:.8, textTransform:'uppercase', letterSpacing:'.1em' }}>
                    Semana del {new Date(latest.week).toLocaleDateString('es-CL')}
                  </p>
                  <h2 style={{ fontFamily:'Rajdhani,sans-serif', fontSize:'1.75rem', fontWeight:700, marginTop:'.25rem' }}>
                    {latest.theme}
                  </h2>
                  <div style={{
                    marginTop:'1rem', background:'rgba(255,255,255,.15)',
                    borderRadius:8, padding:'.75rem 1rem',
                    fontStyle:'italic', fontSize:'.95rem',
                    backdropFilter:'blur(10px)',
                  }}>
                    " {latest.slogan} "
                  </div>
                </div>

                {/* Frases */}
                <div className="card">
                  <h4 style={{ fontFamily:'Rajdhani,sans-serif', fontWeight:700, marginBottom:'1rem' }}>
                    💬 Frases para publicar
                  </h4>
                  <div style={{ display:'flex', flexDirection:'column', gap:'.75rem' }}>
                    {latest.phrases.map((f, i) => (
                      <div key={i} style={{
                        background:'#F4F4F6', borderRadius:8, padding:'.75rem 1rem',
                        borderLeft:'3px solid #00C8E0', fontSize:'.875rem', color:'#374151',
                      }}>
                        {f}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Setlist de posts */}
                <div className="card">
                  <h4 style={{ fontFamily:'Rajdhani,sans-serif', fontWeight:700, marginBottom:'1rem' }}>
                    📅 Plan de posts semanal
                  </h4>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:'1rem' }}>
                    {((latest.topics as any[]) ?? []).map((t: any, i: number) => (
                      <div key={i} style={{
                        background:'white', borderRadius:10, padding:'1rem',
                        border:'1px solid #F0F0F0',
                        borderTop:`3px solid ${PLATFORM_COLORS[t.plataforma?.toLowerCase()] ?? '#E82429'}`,
                      }}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'.5rem' }}>
                          <span style={{ fontWeight:700, fontSize:'.875rem' }}>{t.dia}</span>
                          <span className="badge badge-cyan" style={{ fontSize:'.65rem' }}>{t.plataforma}</span>
                        </div>
                        <p style={{ fontWeight:600, fontSize:'.875rem', marginBottom:'.25rem' }}>{t.titulo}</p>
                        <p style={{ fontSize:'.78rem', color:'#6B7280' }}>{t.descripcion_breve}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Campañas */}
        {tab === 'campaigns' && (
          <div className="card">
            {campaigns.length === 0 ? (
              <div style={{ textAlign:'center', padding:'2rem', color:'#9CA3AF' }}>
                Sin campañas registradas.
              </div>
            ) : (
              <table className="atom-table">
                <thead><tr>
                  <th>Campaña</th><th>Plataforma</th><th>Estado</th>
                  <th>Inicio</th><th>Presupuesto</th><th>Impresiones</th><th>Clics</th>
                </tr></thead>
                <tbody>
                  {campaigns.map(c => (
                    <tr key={c.id}>
                      <td style={{ fontWeight:600 }}>{c.name}</td>
                      <td>{PLATFORM_ICONS[c.platform] ?? '📱'} {c.platform}</td>
                      <td>
                        <span className={`badge ${c.status === 'ACTIVE' ? 'badge-green' : 'badge-gray'}`}>
                          {c.status}
                        </span>
                      </td>
                      <td style={{ fontSize:'.8rem' }}>{new Date(c.startDate).toLocaleDateString('es-CL')}</td>
                      <td>{c.budget ? `$${c.budget.toLocaleString('es-CL')}` : '—'}</td>
                      <td>{c.impressions.toLocaleString()}</td>
                      <td>{c.clicks.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
