import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const isProd = import.meta.env.PROD
const API_BASE = import.meta.env.VITE_API_URL || (isProd ? 'https://healix-026p.onrender.com' : 'http://localhost:8000')

export default function AdminDashboard() {
  const [runs, setRuns] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_BASE}/api/admin/runs`)
      .then(res => res.json())
      .then(data => {
        setRuns(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#F5F3F0', fontFamily: "'Times New Roman', Georgia, serif" }}>
      <Navbar />
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '140px 24px 80px' }}>
        <h1 style={{ fontSize: 36, color: '#0B1F3D', marginBottom: 32 }}>Prototype Users Data</h1>
        
        {loading ? (
          <p>Loading user data from database...</p>
        ) : runs.length === 0 ? (
          <p>No users have tested the prototype yet.</p>
        ) : (
          <div style={{ background: '#FFF', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.05)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 15 }}>
              <thead>
                <tr style={{ background: '#0B1F3D', color: '#FFF' }}>
                  <th style={{ padding: '16px 20px', fontWeight: 600 }}>Date</th>
                  <th style={{ padding: '16px 20px', fontWeight: 600 }}>Name</th>
                  <th style={{ padding: '16px 20px', fontWeight: 600 }}>Age</th>
                  <th style={{ padding: '16px 20px', fontWeight: 600 }}>Symptoms</th>
                  <th style={{ padding: '16px 20px', fontWeight: 600 }}>Emergency?</th>
                  <th style={{ padding: '16px 20px', fontWeight: 600 }}>Matched Conditions</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((run, i) => (
                  <tr key={run.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', background: i % 2 === 0 ? '#FFF' : '#F9F9F9' }}>
                    <td style={{ padding: '16px 20px', color: '#6B7B8D', fontSize: 13, fontFamily: "'DM Mono', monospace" }}>
                      {new Date(run.created_at).toLocaleString()}
                    </td>
                    <td style={{ padding: '16px 20px', fontWeight: 700, color: '#0B1F3D' }}>{run.patient_name || 'N/A'}</td>
                    <td style={{ padding: '16px 20px' }}>{run.patient_age ? `${run.patient_age} (${run.patient_gender || '?'})` : 'N/A'}</td>
                    <td style={{ padding: '16px 20px', maxWidth: 250, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={run.raw_input}>
                      {run.raw_input}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      {run.is_emergency ? <span style={{ color: '#C62828', fontWeight: 'bold' }}>Yes</span> : 'No'}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      {run.conditions.length > 0 ? run.conditions.slice(0, 2).join(', ') : 'None'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
