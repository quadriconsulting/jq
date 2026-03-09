// Author: Jeremy Quadri

const ArchitectureDiagram = () => {
  return (
    <div className="mt-2 bg-obsidian/50 backdrop-blur border border-champagne/10 rounded-2xl p-6 text-center">
      <div className="flex items-center justify-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-champagne animate-pulse" />
        <div className="w-2 h-2 rounded-full bg-champagne animate-pulse" style={{ animationDelay: '0.2s' }} />
        <div className="w-2 h-2 rounded-full bg-champagne animate-pulse" style={{ animationDelay: '0.4s' }} />
      </div>
      <p className="text-xs text-gray-500">Generating Technical Visualization...</p>
    </div>
  )
}

export default ArchitectureDiagram
