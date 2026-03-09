// Author: Jeremy Quadri
// Placeholder component for V2 typewriter/streaming message rendering.
// Will be wired to AIConcierge to reveal assistant text character-by-character
// and auto-scroll the message container to scrollHeight in real-time.

interface TypewriterMessageProps {
  content: string
}

const TypewriterMessage = ({ content }: TypewriterMessageProps) => {
  return <p className="text-sm">{content}</p>
}

export default TypewriterMessage
