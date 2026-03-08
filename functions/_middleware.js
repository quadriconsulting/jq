// Author: Jeremy Quadri
export async function onRequest({ request, next }) {
  const url = new URL(request.url);
  if (!['GET', 'HEAD'].includes(request.method)) return next();
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/assets/') || url.pathname.startsWith('/_')) return next();
  if (/\.[a-zA-Z0-9]+$/.test(url.pathname)) return next();
  
  const res = await next();
  if (res.status === 404) {
    const rewriteUrl = new URL('/index.html', url.origin);
    return fetch(new Request(rewriteUrl.toString(), { method: 'GET', headers: { 'Accept': 'text/html' } }));
  }
  return res;
}
