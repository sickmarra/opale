import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import BookingCalendar from '../components/BookingCalendar'
import TimeSlotPicker from '../components/TimeSlotPicker'
import ServicesSelector from '../components/ServicesSelector'
import BookingConfirmation from '../components/BookingConfirmation'

const STEPS = ['Data', 'Orario', 'Extra', 'Riepilogo']

export default function BookingPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const initialDate = location.state?.selectedDate ? new Date(location.state.selectedDate) : null

  const [step, setStep]                   = useState(initialDate ? 1 : 0)
  const [selectedDate, setSelectedDate]   = useState(initialDate)
  const [startHour, setStartHour]         = useState(null)
  const [endHour, setEndHour]             = useState(null)
  const [studioPrice, setStudioPrice]     = useState(0)
  const [selectedServiceIds, setSelectedServiceIds] = useState([])

  function handleDateSelect(date) {
    setSelectedDate(date); setStartHour(null); setEndHour(null); setStudioPrice(0)
    setStep(1)
  }
  function handleTimeSelection(s, e, p) { setStartHour(s); setEndHour(e); setStudioPrice(p) }
  function goBack() { step === 0 ? navigate('/') : setStep(s => s - 1) }
  const canProceed = step === 0 ? !!selectedDate : step === 1 ? startHour !== null : true

  return (
    <main className="page-container space-y-5 animate-fade-in">

      {/* Header */}
      <header className="pt-2 flex items-center gap-3">
        <button onClick={goBack} className="p-2 text-muted hover:text-text transition-colors -ml-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <div>
          <p className="font-body text-[9px] text-muted tracking-[0.25em] uppercase">
            Passo {step + 1} / {STEPS.length} — {STEPS[step]}
          </p>
          <h1 className="font-heading text-xl font-light text-text">Nuova prenotazione</h1>
        </div>
      </header>

      {/* Progress bar */}
      <div className="flex gap-1">
        {STEPS.map((_, i) => (
          <div key={i} className="flex-1 h-0.5 transition-all duration-500"
            style={{ background: i <= step ? '#C85A1E' : 'rgba(255,255,255,0.08)' }}
          />
        ))}
      </div>

      {/* ── Step 0: Calendar ── */}
      {step === 0 && (
        <div className="space-y-4 animate-slide-up">
          <div>
            <p className="font-body text-[9px] text-muted tracking-[0.25em] uppercase mb-1">Scegli la data</p>
            <p className="font-heading text-2xl font-light text-text">Quando vuoi venire?</p>
          </div>
          <BookingCalendar selectedDate={selectedDate} onSelectDate={handleDateSelect} />
        </div>
      )}

      {/* ── Step 1: Time ── */}
      {step === 1 && selectedDate && (
        <div className="space-y-4 animate-slide-up">
          <div>
            <p className="font-body text-[9px] text-muted tracking-[0.25em] uppercase mb-1">Scegli l'orario</p>
            <p className="font-heading text-2xl font-light text-text">Quando ti serve?</p>
          </div>
          <TimeSlotPicker date={selectedDate} onSelectionChange={handleTimeSelection} />
          <button onClick={() => setStep(2)} disabled={!canProceed} className="btn-primary w-full h-12">
            Continua
          </button>
        </div>
      )}

      {/* ── Step 2: Services ── */}
      {step === 2 && (
        <div className="space-y-4 animate-slide-up">
          <div>
            <p className="font-body text-[9px] text-muted tracking-[0.25em] uppercase mb-1">Servizi opzionali</p>
            <p className="font-heading text-2xl font-light text-text">Vuoi qualcosa in più?</p>
          </div>
          <ServicesSelector selectedIds={selectedServiceIds} onSelectionChange={setSelectedServiceIds} />
          <button onClick={() => setStep(3)} className="btn-primary w-full h-12">Continua</button>
        </div>
      )}

      {/* ── Step 3: Confirm ── */}
      {step === 3 && selectedDate && startHour !== null && endHour !== null && (
        <BookingConfirmation
          date={selectedDate} startHour={startHour} endHour={endHour}
          serviceIds={selectedServiceIds} studioPrice={studioPrice}
          onSuccess={() => navigate('/')} onBack={goBack}
        />
      )}
    </main>
  )
}
