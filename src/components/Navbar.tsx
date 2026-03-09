// Author: Jeremy Quadri
import { useState, useEffect } from 'react'

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
      scrolled ? 'glass py-4' : 'bg-transparent py-6'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <div className="text-xl font-serif font-bold text-champagne">JQ</div>
        <div className="flex gap-8 text-sm">
          <a href="#services" className="hover:text-champagne transition-colors">Services</a>
          <a href="#philosophy" className="hover:text-champagne transition-colors">Philosophy</a>
          <a href="#contact" className="hover:text-champagne transition-colors">Contact</a>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
