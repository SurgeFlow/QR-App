import React, { useMemo, useState } from 'react'
import { API_BASE_URL, api } from '../utils/api'

interface EquipmentForm {
  serialNumber: string
  model: string
  location: string
  installedAt: string
  notes: string
}

interface CreatedEquipmentResponse {
  equipment: {
    id: string
    shortId: string
    serialNumber?: string
    model?: string
    location?: string
    installedAt?: string
    notes?: string
  }
  labelUrl: string
  token: string
}

interface EquipmentWithQr {
  id: string
  shortId: string
  serialNumber?: string
  model?: string
  location?: string
  installedAt?: string
  notes?: string
  createdAt: string
  qrcodes: { id: string; encryptedToken: string }[]
}

const fieldLabels: Record<keyof EquipmentForm, string> = {
  serialNumber: 'Serial number',
  model: 'Model',
  location: 'Location',
  installedAt: 'Installed at',
  notes: 'Notes'
}

const formSectionStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: '12px 16px',
  marginTop: 16
}

const labelStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  fontSize: 14,
  color: '#333'
}

const inputStyle: React.CSSProperties = {
  padding: '10px 12px',
  borderRadius: 6,
  border: '1px solid #d0d7de',
  fontSize: 14
}

const cardStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  borderRadius: 8,
  border: '1px solid #e5e7eb',
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  padding: 20,
  maxWidth: 900
}

export default function EquipmentCreate() {
  const [formData, setFormData] = useState<EquipmentForm>({
    serialNumber: '',
    model: '',
    location: '',
    installedAt: '',
    notes: ''
  })

  const [submitted, setSubmitted] = useState<CreatedEquipmentResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [existing, setExisting] = useState<EquipmentWithQr[]>([])
  const [loadingExisting, setLoadingExisting] = useState(false)

  const requiredFields = useMemo(() => ['serialNumber', 'model'], [])

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const payload = {
        serialNumber: formData.serialNumber || undefined,
        model: formData.model || undefined,
        location: formData.location || undefined,
        installedAt: formData.installedAt ? new Date(formData.installedAt).toISOString() : undefined,
        notes: formData.notes || undefined
      }

      const response = await api.post<CreatedEquipmentResponse>('/admin/equipment', payload)
      setSubmitted(response.data)
      await loadExisting()
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Unable to save equipment details')
    } finally {
      setLoading(false)
    }
  }

  async function loadExisting() {
    setLoadingExisting(true)
    try {
      const response = await api.get<EquipmentWithQr[]>('/admin/equipment')
      setExisting(response.data)
    } catch (e: any) {
      setError('Failed to load existing equipment')
    } finally {
      setLoadingExisting(false)
    }
  }

  React.useEffect(() => {
    loadExisting()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function resetForm() {
    setFormData({
      serialNumber: '',
      model: '',
      location: '',
      installedAt: '',
      notes: ''
    })
    setSubmitted(null)
    setError(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <section style={cardStyle}>
        <header style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <p style={{ color: '#6b7280', margin: 0 }}>Create &amp; Print</p>
            <h2 style={{ margin: '4px 0 0' }}>Enter equipment details</h2>
            <p style={{ margin: '8px 0 0', color: '#4b5563' }}>
              Provide the information you want encoded in the QR code. Required fields
              are marked with an asterisk (*).
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={resetForm}
              style={{
                padding: '10px 14px',
                borderRadius: 8,
                border: '1px solid #d0d7de',
                background: '#fff',
                cursor: 'pointer'
              }}
            >
              Clear form
            </button>
            <button
              type="submit"
              form="equipment-form"
              disabled={loading}
              style={{
                padding: '10px 14px',
                borderRadius: 8,
                border: 'none',
                background: loading ? '#9ca3af' : '#2563eb',
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              {loading ? 'Saving...' : 'Save details'}
            </button>
          </div>
        </header>

        <form
          id="equipment-form"
          onSubmit={handleSubmit}
          style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          <div style={formSectionStyle}>
            {(Object.keys(formData) as (keyof EquipmentForm)[]).map((key) => {
              const isTextArea = key === 'notes'
              const label = requiredFields.includes(key) ? `${fieldLabels[key]} *` : fieldLabels[key]
              return (
                <label key={key} style={labelStyle}>
                  <span>{label}</span>
                  {isTextArea ? (
                    <textarea
                      name={key}
                      value={formData[key]}
                      onChange={handleChange}
                      style={{ ...inputStyle, minHeight: 96, resize: 'vertical' }}
                      placeholder="Include any special instructions or notes"
                    />
                  ) : (
                    <input
                      name={key}
                      type={key === 'installedAt' ? 'date' : 'text'}
                      value={formData[key]}
                      onChange={handleChange}
                      style={inputStyle}
                      placeholder={`Enter ${fieldLabels[key].toLowerCase()}`}
                      required={requiredFields.includes(key)}
                    />
                  )}
                </label>
              )
            })}
          </div>
        </form>

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
      </section>

      {submitted && (
        <section style={cardStyle}>
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0 }}>Equipment created</h3>
              <p style={{ margin: '4px 0 0', color: '#4b5563' }}>
                QR code generated for <strong>{submitted.equipment.shortId}</strong>.
              </p>
            </div>
            <a
              href={submitted.labelUrl.startsWith('http') ? submitted.labelUrl : `${API_BASE_URL}${submitted.labelUrl}`}
              style={{
                padding: '10px 12px',
                borderRadius: 8,
                background: '#2563eb',
                color: '#fff',
                textDecoration: 'none'
              }}
              target="_blank"
              rel="noreferrer"
            >
              Download label
            </a>
          </header>
          <dl
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '8px 16px',
              marginTop: 12
            }}
          >
            {(Object.keys(formData) as (keyof EquipmentForm)[]).map((key) => (
              <div key={key}>
                <dt style={{ fontSize: 12, color: '#6b7280' }}>{fieldLabels[key]}</dt>
                <dd style={{ margin: '2px 0 0', fontWeight: 600 }}>
                  {(submitted.equipment as any)[key] || 'Not provided'}
                </dd>
              </div>
            ))}
          </dl>
          <div style={{ marginTop: 12, color: '#6b7280', fontSize: 13 }}>
            Token stored for this QR code: <code>{submitted.token}</code>
          </div>
        </section>
      )}

      <section style={cardStyle}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ color: '#6b7280', margin: 0 }}>Existing equipment</p>
            <h3 style={{ margin: '4px 0 0' }}>Database records</h3>
          </div>
          <button
            type="button"
            onClick={loadExisting}
            disabled={loadingExisting}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid #d0d7de',
              background: '#fff',
              cursor: 'pointer'
            }}
          >
            {loadingExisting ? 'Refreshing...' : 'Refresh'}
          </button>
        </header>
        {loadingExisting && <p style={{ color: '#6b7280' }}>Loading equipment from database...</p>}
        {!loadingExisting && existing.length === 0 && (
          <p style={{ color: '#6b7280' }}>No equipment found in the database yet.</p>
        )}
        {existing.length > 0 && (
          <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
            {existing.map((item) => (
              <article
                key={item.id}
                style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>{item.shortId}</strong>
                  <span style={{ fontSize: 12, color: '#6b7280' }}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <dl style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 4, margin: 0 }}>
                  <div>
                    <dt style={{ fontSize: 12, color: '#6b7280' }}>Model</dt>
                    <dd style={{ margin: 0 }}>{item.model || '—'}</dd>
                  </div>
                  <div>
                    <dt style={{ fontSize: 12, color: '#6b7280' }}>Serial</dt>
                    <dd style={{ margin: 0 }}>{item.serialNumber || '—'}</dd>
                  </div>
                  <div>
                    <dt style={{ fontSize: 12, color: '#6b7280' }}>Location</dt>
                    <dd style={{ margin: 0 }}>{item.location || '—'}</dd>
                  </div>
                </dl>
                {item.qrcodes.length > 0 && (
                  <a
                    href={`${API_BASE_URL}/labels/${item.shortId}.pdf`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: '8px 10px',
                      background: '#2563eb',
                      color: '#fff',
                      borderRadius: 6,
                      textDecoration: 'none',
                      textAlign: 'center'
                    }}
                  >
                    View latest label
                  </a>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
