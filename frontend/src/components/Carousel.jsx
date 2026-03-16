import { useState, useEffect, useRef } from 'react'

const images = [
  { src: '/images/studio-1.jpeg', alt: 'Opale Studio — Sala Pose' },
  { src: '/images/studio-2.jpeg', alt: 'Opale Studio — Setup Fotografico' },
  { src: '/images/studio-3.jpeg', alt: 'Opale Studio — Ambiente' },
  { src: '/images/studio-4.jpeg', alt: 'Opale Studio — Dettagli' },
]

export default function Carousel() {
  const [current, setCurrent] = useState(0)
  const startX = useRef(0)
  const dragging = useRef(false)

  useEffect(() => {
    const t = setInterval(() => setCurrent(c => (c + 1) % images.length), 4500)
    return () => clearInterval(t)
  }, [])

  const onTouchStart = e => { startX.current = e.touches[0].clientX; dragging.current = true }
  const onTouchEnd   = e => {
    if (!dragging.current) return
    const diff = startX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 40)
      setCurrent(c => diff > 0 ? (c + 1) % images.length : (c - 1 + images.length) % images.length)
    dragging.current = false
  }

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ aspectRatio: '4/3', background: '#0d0d0d' }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {images.map((img, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <img
            src={img.src}
            alt={img.alt}
            className="w-full h-full object-cover"
            loading={i === 0 ? 'eager' : 'lazy'}
            style={{ filter: 'brightness(0.88) contrast(1.05)' }}
          />
          {/* Cinematic gradient overlays */}
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, transparent 40%, rgba(0,0,0,0.55) 100%)' }}
          />
          {/* Amber light leak top-left */}
          <div className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse at 0% 0%, rgba(200,90,30,0.12) 0%, transparent 55%)' }}
          />
        </div>
      ))}

      {/* Counter — editorial style */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5">
        <span className="font-body text-[10px] text-white/50 tracking-[0.2em]">
          {String(current + 1).padStart(2,'0')} / {String(images.length).padStart(2,'0')}
        </span>
      </div>

      {/* Studio tag */}
      <div className="absolute bottom-3 left-3">
        <div className="flex items-center gap-1.5 px-2.5 py-1"
          style={{ background:'rgba(0,0,0,0.4)', backdropFilter:'blur(8px)', border:'1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="w-1.5 h-1.5 rounded-full" style={{ background:'#C85A1E' }}/>
          <span className="font-body text-[9px] text-white/60 tracking-[0.22em] uppercase">Sala Pose</span>
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-3 right-3 flex gap-1">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className="transition-all duration-300"
            style={{
              width: i === current ? 20 : 5,
              height: 2,
              background: i === current ? '#C85A1E' : 'rgba(255,255,255,0.25)',
              border: 'none',
              padding: 0,
            }}
            aria-label={`Foto ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
