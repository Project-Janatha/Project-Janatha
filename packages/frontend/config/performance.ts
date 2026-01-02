/**
 * performance.ts
 * 
 * Performance optimizations for production builds
 * Disables console logging and optimizes event listeners
 */

if (process.env.NODE_ENV === 'production') {
  console.log = () => {}
  console.debug = () => {}
  console.info = () => {}
  console.warn = () => {}
  // Keep console.error for critical issues
}

// Optimize for browser DevTools - reduce DOM inspection overhead
if (typeof window !== 'undefined') {
  // Reduce passive event listener warnings in DevTools
  const originalAddEventListener = EventTarget.prototype.addEventListener
  EventTarget.prototype.addEventListener = function(type: any, listener: any, options?: any) {
    if (typeof options === 'object' && options !== null) {
      return originalAddEventListener.call(this, type, listener, options)
    }
    // Add passive by default for scroll/touch events to improve performance
    if (type === 'touchstart' || type === 'touchmove' || type === 'wheel' || type === 'mousewheel') {
      return originalAddEventListener.call(this, type, listener, { passive: true, capture: false })
    }
    return originalAddEventListener.call(this, type, listener, options)
  }
}

export {}
