import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS_BASE = [
  {
    to: '/', end: true,
    label: 'Home',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    to: '/prenota', end: false,
    label: 'Prenota',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]">
        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
  {
    to: '/profilo', end: false,
    label: 'Profilo',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
]

export default function Navbar() {
  const { isAdmin } = useAuth()

  const items = [
    ...NAV_ITEMS_BASE,
    ...(isAdmin ? [{
      to: '/admin', end: false, label: 'Admin',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ),
    }] : []),
  ]

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 pb-safe"
      style={{
        background: 'rgba(8,8,8,0.92)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {/* Subtle top glow line */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(200,90,30,0.25) 50%, transparent)' }}
      />

      <div className="flex items-stretch justify-around max-w-lg mx-auto h-16">
        {items.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className="flex-1"
          >
            {({ isActive }) => (
              <div
                className="flex flex-col items-center justify-center h-full gap-1 transition-all duration-200 relative"
                style={{ color: isActive ? '#C85A1E' : 'rgba(122,114,104,0.7)' }}
              >
                {/* Active indicator dot */}
                {isActive && (
                  <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5"
                    style={{ background: 'linear-gradient(90deg, transparent, #C85A1E, transparent)' }}
                  />
                )}
                <span className={`transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
                  {item.icon}
                </span>
                <span
                  className="font-body uppercase tracking-[0.12em]"
                  style={{ fontSize: '8px', fontWeight: 500 }}
                >
                  {item.label}
                </span>
              </div>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
