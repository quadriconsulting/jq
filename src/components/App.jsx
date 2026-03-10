import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Protocol from './components/Protocol';
import Philosophy from './components/Philosophy';
import CTA from './components/CTA';
import Footer from './components/Footer';
import AIConcierge from './components/AIConcierge';

export default function App() {
    return (
        <div className="relative min-h-screen bg-obsidian text-white selection:bg-champagne/30">
            {/* Your actual portfolio website */}
            <Navbar />
            <Hero />
            <Features />
            <Protocol />
            <Philosophy />
            <CTA />
            <Footer />

            {/* The Bespoke Champagne AI Widget floating on top */}
            <AIConcierge />
        </div>
    );
}