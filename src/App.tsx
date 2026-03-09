// Author: Jeremy Quadri
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Features from './components/Features'
import Philosophy from './components/Philosophy'
import Protocol from './components/Protocol'
import CTA from './components/CTA'
import Footer from './components/Footer'
import AIConcierge from './components/AIConcierge'

gsap.registerPlugin(ScrollTrigger)

const App = () => {
  return (
    <div className="relative">
      <Navbar />
      <Hero />
      <Features />
      <Philosophy />
      <Protocol />
      <CTA />
      <Footer />
      <AIConcierge />
    </div>
  )
}

export default App
