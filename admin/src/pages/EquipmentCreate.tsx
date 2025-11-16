import React, { useMemo, useState } from 'react'

interface EquipmentForm {
  equipmentName: string
  manufacturer: string
  model: string
  serialNumber: string
  location: string
  purchaseDate: string
  notes: string
}

const fieldLabels: Record<keyof EquipmentForm, string> = {
  equipmentName: 'Equipment name',
  manufacturer: 'Manufacturer',
  model: 'Model',
  serialNumber: 'Serial number',
  location: 'Location',
  purchaseDate: 'Purchase date',
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
    equipmentName: '',
    manufacturer: '',
    model: '',
    serialNumber: '',
    location: '',
    purchaseDate: '',
    notes: ''
  })

  const [submitted, setSubmitted] = useState<EquipmentForm | null>(null)

  const requiredFields = useMemo(() => ['equipmentName', 'serialNumber'], [])

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(formData)
  }

  function resetForm() {
    setFormData({
      equipmentName: '',
      manufacturer: '',
      model: '',
      serialNumber: '',
      location: '',
      purchaseDate: '',
      notes: ''
    })
    setSubmitted(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <section style={cardStyle}>
        <header style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <p style={{ color: '#6b7280', margin: 0 }}>Create & Print</p>
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
              style={{
                padding: '10px 14px',
                borderRadius: 8,
                border: 'none',
                background: '#2563eb',
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              Save details
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
                      type={key === 'purchaseDate' ? 'date' : 'text'}
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
      </section>

      {submitted && (
        <section style={cardStyle}>
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>Preview</h3>
            <span style={{ color: '#6b7280', fontSize: 13 }}>Ready to generate QR code</span>
          </header>
          <dl
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '8px 16px',
              marginTop: 12
            }}
          >
            {(Object.keys(submitted) as (keyof EquipmentForm)[]).map((key) => (
              <div key={key}>
                <dt style={{ fontSize: 12, color: '#6b7280' }}>{fieldLabels[key]}</dt>
                <dd style={{ margin: '2px 0 0', fontWeight: 600 }}>
                  {submitted[key] || <span style={{ color: '#9ca3af' }}>Not provided</span>}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </div>
  )
}
