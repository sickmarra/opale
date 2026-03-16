const Logo = ({ className = '', size = 'md' }) => {
  const heights = { sm: 'h-7', md: 'h-10', lg: 'h-14', xl: 'h-24' }

  return (
    <div className={`flex items-center logo-fade-in ${className}`}>
      <img
        src="/images/logo.png"
        alt="Opale Studio"
        className={`${heights[size]} w-auto object-contain`}
        style={{ filter: 'invert(1) brightness(1.2)' }}
      />
    </div>
  )
}

export default Logo
