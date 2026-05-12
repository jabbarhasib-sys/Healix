import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import useStore from '../store/useStore'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import GaugeChart from '../components/GaugeChart'
import SeverityBadge from '../components/SeverityBadge'
import SectionReveal from '../components/SectionReveal'
import { MiniDNA } from '../components/DNA3D'
import ProgressTracker from '../components/ProgressTracker'
import { useDarkMode } from '../hooks/useDarkMode'

const COLORS = ['#0B1F3D', '#2E4F78', '#5A769A', '#D4AF37', '#E8D48B']
const TT = { background: '#0B1F3D', border: 'none', borderRadius: 10, fontSize: 11, color: '#F5F3F0', fontFamily: "'DM Mono', monospace" }

const F = "'Times New Roman', Georgia, serif"
const FM = "'DM Mono', monospace"

export default function Dashboard() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { result, reset } = useStore()
  const [isDark] = useDarkMode()

  if (!result) return (
    <div style={{ minHeight: '100vh', background: '#F5F3F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F }}>
      <Navbar />
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: '#6B7B8D', marginBottom: 16, fontSize: 15 }}>{t('dashboard.noAnalysis')}</p>
        <button onClick={() => navigate('/')} className="btn-primary" style={{ padding: '12px 28px' }}>{t('dashboard.goHome')}</button>
      </div>
    </div>
  )

  const { clinical = {}, risk = {}, hospitals = [], confidence, explanation = {}, meta = {} } = result
  const urgency = risk?.urgency_level || 'routine'
  const conds = clinical?.conditions || []
  const top = conds[0]
  const confPct = Math.round((confidence?.percentage || 0))

  const condData = conds.map(c => ({
    name: c.name?.length > 25 ? c.name.slice(0, 23) + '…' : c.name,
    prob: Math.round((c.probability || 0) * 100),
  }))

  const topCost = hospitals[0]?.cost_estimate
  const costMin = topCost?.min || 0
  const costMax = topCost?.max || 0
  const costEst = topCost?.estimate || 0

  return (
    <div style={{ minHeight: '100vh', fontFamily: F, background: isDark ? '#1e2229' : '#F5F3F0' }}>
      <Navbar />

      <div style={{ maxWidth: 1140, margin: '0 auto', padding: '80px 24px 48px' }}>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <button onClick={() => navigate('/input')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#6B7B8D', fontFamily: F, display: 'flex', alignItems: 'center', gap: 6 }}>
            {t('dashboard.backToAssessment')}
          </button>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <span style={{ fontFamily: FM, fontSize: 10, color: 'rgba(11,31,61,0.3)', letterSpacing: 1.5 }}>CASE REF: HX-{Math.floor(Math.random() * 9000 + 1000)}-A</span>
            <span style={{ fontFamily: FM, fontSize: 10, color: 'rgba(11,31,61,0.3)', letterSpacing: 1 }}>{t('dashboard.confidential')}</span>
          </div>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.6fr', gap: 24, marginBottom: 32 }}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card" style={{ padding: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <SeverityBadge level={urgency} />
              <span className="badge-navy">{t('dashboard.synthesisComplete')}</span>
              <div style={{ marginLeft: 'auto', transform: 'scale(0.8)', opacity: 0.8 }}><MiniDNA /></div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 28 }}>
              <GaugeChart value={confPct} size={120} label={t('dashboard.confidence')} />
              <div style={{ flex: 1 }}>
                <h1 style={{ fontFamily: F, fontSize: 32, fontWeight: 700, color: '#0B1F3D', letterSpacing: -1, lineHeight: 1.15, marginBottom: 8 }}>
                  {top?.name || t('dashboard.analysisResult')}
                </h1>
                {top?.icd10_code && (
                  <p style={{ fontFamily: FM, fontSize: 10, color: 'rgba(11,31,61,0.35)', marginBottom: 12 }}>
                    ICD-10: {top.icd10_code} · Specialty: {top.recommended_specialty}
                  </p>
                )}
                <p style={{ fontSize: 15, color: '#6B7B8D', lineHeight: 1.75 }}>
                  {explanation?.patient_summary || t('dashboard.analysisComplete')}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card" style={{ padding: 28 }}>
            <div className="label-muted" style={{ marginBottom: 16 }}>{t('dashboard.financialSpectrum')}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
              <div>
                <div className="data-label" style={{ marginBottom: 4 }}>{t('dashboard.range')}</div>
                <div style={{ fontFamily: F, fontSize: 26, fontWeight: 700, color: '#0B1F3D' }}>
                  ₹{Math.round(costMin / 1000)}K – ₹{Math.round(costMax / 1000)}K
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="data-label" style={{ marginBottom: 4 }}>{t('dashboard.estimate')}</div>
                <div style={{ fontFamily: F, fontSize: 22, fontWeight: 700, color: '#D4AF37' }}>
                  ₹{Math.round(costEst / 1000)}K
                </div>
              </div>
            </div>
            <div style={{ height: 1, background: 'rgba(11,31,61,0.06)', margin: '0 0 16px' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { label: t('dashboard.consult'), val: Math.round(costEst * 0.12), id: 'C' },
                { label: t('dashboard.diagnostics'), val: Math.round(costEst * 0.28), id: 'D' },
                { label: t('dashboard.procedures'), val: Math.round(costEst * 0.45), id: 'P' },
                { label: t('dashboard.ancillary'), val: Math.round(costEst * 0.15), id: 'A' },
              ].map(c => (
                <div key={c.label} style={{ background: '#F5F3F0', borderRadius: 10, padding: '10px 12px', border: '1px solid rgba(11,31,61,0.03)' }}>
                  <div className="data-label" style={{ marginBottom: 3 }}>{c.label}</div>
                  <div style={{ fontFamily: F, fontSize: 16, fontWeight: 700, color: '#0B1F3D' }}>₹{(c.val / 1000).toFixed(1)}K</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {risk?.is_emergency && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: '#FFF5F5', border: '1px solid #FECACA', borderRadius: 14, padding: '16px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 4px 12px rgba(198,40,40,0.08)' }}>
            <div className="icon-3d" style={{ width: 40, height: 40, background: '#C62828', color: 'white', fontSize: 14 }}>!</div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#C62828', margin: '0 0 4px' }}>{t('dashboard.emergencyProtocol')}</p>
              <p style={{ fontSize: 13, color: '#6B7B8D', margin: 0 }}>{t('dashboard.emergencyDesc')} {risk.recommended_action}</p>
            </div>
          </motion.div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.7fr', gap: 24, marginBottom: 24 }}>
          <SectionReveal delay={0.1}>
            <div className="card" style={{ padding: 28 }}>
              <div className="label" style={{ marginBottom: 6 }}>{t('dashboard.differentialSpectrum')}</div>
              <p className="data-label" style={{ marginBottom: 20 }}>
                {t('dashboard.urgency')}: <span style={{ color: urgency.toLowerCase() === 'emergency' ? '#C62828' : urgency.toLowerCase() === 'urgent' ? '#E65100' : '#2E7D32', fontWeight: 700 }}>{urgency.toUpperCase()}</span>
              </p>
              <ResponsiveContainer width="100%" height={conds.length * 56 + 10}>
                <BarChart data={condData} layout="vertical" margin={{ left: 4, right: 40, top: 0, bottom: 0 }}>
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: 'rgba(11,31,61,0.3)', fontFamily: FM }} tickFormatter={v => `${v}%`} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 13, fill: '#0B1F3D', fontFamily: F }} width={150} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={TT} formatter={v => [`${v}%`, t('dashboard.probability')]} />
                  <Bar dataKey="prob" radius={[0, 6, 6, 0]} maxBarSize={22}>
                    {condData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.85} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionReveal>

          <SectionReveal delay={0.2}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Progress Tracker */}
              <ProgressTracker currentPath="/dashboard" />

              <div className="card" style={{ padding: 28 }}>
              <div className="label" style={{ marginBottom: 24 }}>{t('dashboard.recommendations')}</div>
              {[
                { id: 'C', title: t('dashboard.rec_c_title'), desc: t('dashboard.rec_c_desc') },
                { id: 'D', title: t('dashboard.rec_d_title'), desc: t('dashboard.rec_d_desc') },
                { id: 'T', title: t('dashboard.rec_t_title'), desc: t('dashboard.rec_t_desc') },
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: i < 2 ? 20 : 0, paddingBottom: i < 2 ? 20 : 0, borderBottom: i < 2 ? '1px solid rgba(11,31,61,0.06)' : 'none' }}>
                    <div className="icon-3d-navy" style={{ width: 36, height: 36, fontSize: 12, flexShrink: 0 }}>{r.id}</div>
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 700, color: '#0B1F3D', marginBottom: 4 }}>{r.title}</p>
                      <p style={{ fontSize: 13, color: '#6B7B8D', lineHeight: 1.6, margin: 0 }}>{r.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SectionReveal>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <motion.button onClick={() => navigate('/hospital-matches')} className="btn-primary"
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            style={{ padding: '16px 48px', fontSize: 16, marginRight: 12 }}>
            {t('dashboard.viewHospitals')}
          </motion.button>
          <button onClick={() => { reset(); navigate('/') }}
            className="btn-outline" style={{ padding: '15px 32px', fontSize: 15 }}>
            {t('dashboard.newCase')}
          </button>
        </div>

        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: FM, fontSize: 10, color: 'rgba(11,31,61,0.2)', letterSpacing: 1 }}>
            {meta?.duration_ms}ms · {meta?.hospital_count} hospitals · {meta?.llm_source} · HEALIX AI
          </p>
        </div>
      </div>

      <Footer />
    </div>
  )
}
