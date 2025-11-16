import React, { useEffect, useMemo, useState } from 'react'
import { api } from '../utils/api'

interface ServiceReport {
  id: string
  equipmentId: string
  description?: string
  photoPaths: string
  status: string
  internalNotes?: string
  createdAt: string
}

const statusOptions = ['Open', 'In Progress', 'Closed']

const cardStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  borderRadius: 8,
  border: '1px solid #e5e7eb',
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  padding: 20
}

export default function Reports() {
  const [reports, setReports] = useState<ServiceReport[]>([])
  const [filter, setFilter] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const filteredReports = useMemo(() => {
    if (!filter) return reports
    return reports.filter((r) => r.status === filter)
  }, [filter, reports])

  async function loadReports() {
    setLoading(true)
    setError(null)
    try {
      const params = filter ? { status: filter } : undefined
      const response = await api.get<ServiceReport[]>('/admin/reports', { params })
      setReports(response.data)
    } catch (e: any) {
      setError('Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReports()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  async function updateReport(id: string, updates: Partial<ServiceReport>) {
    try {
      const response = await api.patch<ServiceReport>(`/admin/reports/${id}`, updates)
      setReports((prev) => prev.map((report) => (report.id === id ? response.data : report)))
    } catch (e: any) {
      setError('Failed to update report')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <section style={cardStyle}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ color: '#6b7280', margin: 0 }}>Service reports</p>
            <h2 style={{ margin: '4px 0 0' }}>Incoming issues</h2>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#4b5563', fontSize: 14 }}>Status:</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db' }}
            >
              <option value="">All</option>
              {statusOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>
        </header>
        {loading && <p style={{ color: '#6b7280' }}>Loading reports...</p>}
        {error && (
          <div style={{
            marginTop: 12,
            padding: '10px 12px',
            background: '#fef2f2',
            border: '1px solid #fecdd3',
            color: '#b91c1c',
            borderRadius: 8
          }}>
            {error}
          </div>
        )}
        {!loading && filteredReports.length === 0 && (
          <p style={{ color: '#6b7280' }}>No reports found.</p>
        )}
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredReports.map((report) => {
            let photoLinks: string[] = []
            try {
              photoLinks = JSON.parse(report.photoPaths)
            } catch (err) {
              photoLinks = []
            }

            return (
              <article
                key={report.id}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  padding: 12,
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr',
                  gap: 12
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>Report {report.id.slice(0, 6)}</strong>
                    <span style={{ fontSize: 12, color: '#6b7280' }}>
                      {new Date(report.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p style={{ margin: 0, color: '#374151' }}>{report.description || 'No description provided.'}</p>
                  {photoLinks.length > 0 && (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {photoLinks.map((path: string) => (
                        <a
                          key={path}
                          href={path}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            padding: '6px 8px',
                            background: '#eef2ff',
                            borderRadius: 6,
                            textDecoration: 'none',
                            color: '#4338ca',
                            fontSize: 13
                          }}
                        >
                          View photo
                        </a>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span style={{ fontSize: 12, color: '#6b7280' }}>Status</span>
                    <select
                      value={report.status}
                      onChange={(e) => updateReport(report.id, { status: e.target.value })}
                      style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db' }}
                    >
                      {statusOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span style={{ fontSize: 12, color: '#6b7280' }}>Internal notes</span>
                    <textarea
                      value={report.internalNotes || ''}
                      onChange={(e) => updateReport(report.id, { internalNotes: e.target.value })}
                      rows={3}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 6,
                        border: '1px solid #d1d5db',
                        resize: 'vertical'
                      }}
                    />
                  </label>
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}
