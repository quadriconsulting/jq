// Author: Jeremy Quadri

const Footer = () => {
  return (
    <footer className="relative bg-obsidian rounded-t-[4rem] py-16 px-6 z-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          <div>
            <div className="text-3xl font-serif font-bold text-champagne mb-4">JQ</div>
            <p className="text-gray-500 text-sm">
              Application Security Architect & AI-Driven Risk Systems Builder
            </p>
          </div>

          <div>
            <h4 className="text-champagne font-semibold mb-4">Navigation</h4>
            <div className="space-y-2 text-sm text-gray-400">
              <a href="#services" className="block hover:text-champagne transition-colors">Services</a>
              <a href="#philosophy" className="block hover:text-champagne transition-colors">Philosophy</a>
              <a href="#contact" className="block hover:text-champagne transition-colors">Contact</a>
            </div>
          </div>

          <div>
            <h4 className="text-champagne font-semibold mb-4">Connect</h4>
            <div className="space-y-2 text-sm text-gray-400">
              <a href="mailto:jeremy@quadri.fit" className="block hover:text-champagne transition-colors">Email</a>
              <a href="https://www.linkedin.com/in/jquadri/" className="block hover:text-champagne transition-colors">LinkedIn</a>
              <a href="https://x.com/jquadri" className="block hover:text-champagne transition-colors">X (Twitter)</a>
              <a href="https://github.com/quadriconsulting" className="block hover:text-champagne transition-colors">GitHub</a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-600">
          <p>© 2026 Jeremy Quadri. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
