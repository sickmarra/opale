import { useState, useEffect } from 'react'
import { servicesApi } from '../api'

export default function ServicesSelector({ selectedIds, onSelectionChange }) {
  const [services, setServices] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    servicesApi.getAll().then(r => setServices(r.data)).catch(console.error).finally(() => setLoading(false))
  }, [])

  function toggle(id) {
    onSelectionChange(selectedIds.includes(id) ? selectedIds.filter(i => i !== id) : [...selectedIds, id])
  }

  const extrasTotal = services.filter(s => selectedIds.includes(s.id)).reduce((sum, s) => sum + s.price, 0)

  if (loading) return (
    <div className="card flex items-center justify-center py-8">
      <div className="w-5 h-5 border border-primary border-t-transparent rounded-full animate-spin"/>
    </div>
  )

  if (!services.length) return (
    <div className="card text-center py-8">
      <p className="font-body text-xs text-muted tracking-wide">Nessun servizio extra disponibile</p>
    </div>
  )

  return (
    <div className="card space-y-4">
      <div>
        <p className="font-body text-[9px] text-muted tracking-[0.25em] uppercase mb-1">Servizi extra</p>
        <p className="font-heading text-lg font-light text-text">Aggiungi alla sessione</p>
      </div>

      <div className="space-y-2">
        {services.map(service => {
          const sel = selectedIds.includes(service.id)
          return (
            <button
              key={service.id}
              onClick={() => toggle(service.id)}
              className="w-full flex items-center gap-3 p-3.5 text-left transition-all duration-200"
              style={{
                background: sel ? 'rgba(200,90,30,0.09)' : 'rgba(255,255,255,0.03)',
                border: sel ? '1px solid rgba(200,90,30,0.3)' : '1px solid rgba(255,255,255,0.07)',
                borderRadius: 0,
              }}
            >
              {/* Checkbox visual */}
              <div
                className="w-4 h-4 flex-shrink-0 flex items-center justify-center transition-all duration-200"
                style={{
                  border: sel ? 'none' : '1px solid rgba(122,114,104,0.5)',
                  background: sel ? '#C85A1E' : 'transparent',
                }}
              >
                {sel && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body text-sm text-text">{service.name}</p>
                {service.description && (
                  <p className="font-body text-[10px] text-muted mt-0.5 leading-snug">{service.description}</p>
                )}
              </div>
              <span
                className="font-heading text-lg font-light flex-shrink-0 ml-2"
                style={{ color: sel ? '#C85A1E' : '#7A7268' }}
              >
                €{service.price}
              </span>
            </button>
          )
        })}
      </div>

      {selectedIds.length > 0 && (
        <div
          className="flex justify-between items-center px-1 pt-3 animate-slide-up"
          style={{ borderTop:'1px solid rgba(255,255,255,0.06)' }}
        >
          <span className="font-body text-xs text-muted tracking-wide">{selectedIds.length} extra selezionati</span>
          <span className="font-heading text-xl font-light" style={{ color:'#C85A1E' }}>+€{extrasTotal}</span>
        </div>
      )}
    </div>
  )
}
