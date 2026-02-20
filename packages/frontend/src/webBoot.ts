// Web-only boot diagnostics to surface early crashes (Safari/iOS)
// Safe to import on all platforms; no-ops outside web.
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  try {
    const d = document
    if (!d.getElementById('jn-boot-overlay')) {
      const overlay = d.createElement('div')
      overlay.id = 'jn-boot-overlay'
      overlay.style.cssText =
        'position:fixed;top:0;left:0;right:0;z-index:99999;background:#111;color:#fff;padding:8px 12px;font:12px -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;'
      overlay.textContent = 'Loading app...'
      d.body.appendChild(overlay)

      let ready = false
      ;(window as any).__jn_markReady = () => {
        ready = true
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay)
      }

      const report = (msg: string) => {
        try {
          localStorage.setItem('jn_last_error', msg)
        } catch {}
        overlay.textContent = `App error: ${msg}`
      }

      window.addEventListener('error', (e) => {
        report((e as ErrorEvent)?.message || 'Unknown error')
      })
      window.addEventListener('unhandledrejection', (e) => {
        const reason = (e as PromiseRejectionEvent)?.reason as any
        report(reason?.message || 'Unhandled promise rejection')
      })

      setTimeout(() => {
        if (!ready) {
          let last = ''
          try {
            last = localStorage.getItem('jn_last_error') || ''
          } catch {}
          overlay.textContent = last ? `App error: ${last}` : 'App did not finish loading.'
        }
      }, 8000)
    }
  } catch {}
}
