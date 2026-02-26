/**
 * CORS Worker for API routes
 * @version 1.0.0
 */

export default {
  async fetch(request, env, ctx) {
  const url = new URL(request.url)
  
  // Handle CORS preflight for API routes
  if (url.pathname.startsWith("/api/") && request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, Accept, Origin",
        "Access-Control-Max-Age": "86400"
      }
    })
  }
  
  // Fetch and add CORS headers to response
  const response = await fetch(request)
  
  if (url.pathname.startsWith("/api/")) {
    const headers = new Headers(response.headers)
    headers.set("Access-Control-Allow-Origin", "*")
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: headers
    })
  }
  
  return response
}
