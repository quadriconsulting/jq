import { Hono } from 'hono'

const app = new Hono()

// API routes handled by functions/
// Static files served by Cloudflare Pages automatically

app.get('*', (c) => {
  return c.text('Static content served by Cloudflare Pages')
})

export default app
