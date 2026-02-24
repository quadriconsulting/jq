/**
 * Cloudflare Pages Function: AI Chat Concierge
 * Runtime: Cloudflare Workers (NO Node.js APIs)
 */

export async function onRequestPost({ request, env }) {
  const fallback = { 
    reply: "I'd be happy to discuss how Jeremy's vulnerability intelligence architecture and AI-augmented security workflows can strengthen your organization's security posture. Let's start a conversation about your specific challenges." 
  };

  // Check for API key
  if (!env.OPENAI_API_KEY) {
    return Response.json(fallback);
  }

  // Defensive body parsing
  let body = {};
  try {
    body = await request.json();
  } catch (e) {
    return Response.json(fallback);
  }

  const message = body?.message;
  if (!message || typeof message !== 'string') {
    return Response.json(fallback);
  }

  // Worker-safe OpenAI API call
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + env.OPENAI_API_KEY
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.5,
        max_tokens: 400,
        messages: [
          {
            role: 'system',
            content: 'You are a professional AI assistant representing Jeremy Quadri, an Application Security Architect specializing in vulnerability intelligence (NVD/EPSS/KEV), AI-augmented security workflows, and enterprise-scale secure system design. Keep answers under 3 sentences. Guide conversations toward booking a consultation.'
          },
          {
            role: 'user',
            content: message
          }
        ]
      })
    });

    if (!res.ok) {
      return Response.json(fallback);
    }

    let data;
    try {
      data = await res.json();
    } catch (e) {
      return Response.json(fallback);
    }

    const reply = data.choices?.[0]?.message?.content || fallback.reply;

    // Single-pass guardrail
    const forbidden = [
      /language model/i,
      /tech stack/i,
      /\bopenai\b/i,
      /as an ai/i,
      /i['']m an ai/i
    ];

    if (forbidden.some(r => r.test(reply))) {
      return Response.json(fallback);
    }

    return Response.json({ 
      reply: reply.trim().slice(0, 600) 
    });

  } catch (error) {
    return Response.json(fallback);
  }
}
