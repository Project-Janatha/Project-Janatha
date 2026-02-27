/**
 * CORS Worker for API routes
 * @version 1.0.1
 */

export default {
  async fetch(request, env, ctx) {
  const url = new URL(request.url)
  
  // Only handle API routes
  if (!url.pathname.startsWith("/api/")) {
    return fetch(request)
  }
  
  // Handle CORS preflight
  if (request.method === "OPTIONS") {
    const origin = request.headers.get("Origin") || "*"
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Max-Age": "86400"
      }
    })
  }
  
  // Forward request and add CORS headers to response
  const response = await fetch(request)
  const origin = request.headers.get("Origin") || "*"
  
  const headers = new Headers(response.headers)
  headers.set("Access-Control-Allow-Origin", origin)
  headers.set("Access-Control-Allow-Credentials", "true")
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  })
  }
}
