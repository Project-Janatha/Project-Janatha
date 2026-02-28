/**
 * devtools.ts
 *
 * Browser DevTools optimizations
 * Reduces CPU usage when DevTools are open and blackboxes WebGL libraries
 */

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  // Blackbox maplibre and other WebGL libraries in Chrome DevTools
  // This prevents DevTools from stepping into their source code
  const script = document.createElement('script')
  script.textContent = `
    if (typeof chrome !== 'undefined' && chrome.debugger) {
      // Add source map patterns to skip
      const blackboxPatterns = [
        '/node_modules/maplibre-gl/',
        '/node_modules/mapbox-gl/',
        '/node_modules/react-map-gl/',
        'maplibre-gl.js',
        'mapbox-gl.js'
      ];
      
      if (typeof DevToolsAPI !== 'undefined') {
        blackboxPatterns.forEach(pattern => {
          try {
            DevToolsAPI.blackbox(pattern);
          } catch (e) {
            // Silently fail if API not available
          }
        });
      }
    }
  `

  // Inject after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      document.head.appendChild(script)
    })
  } else {
    document.head.appendChild(script)
  }

  // Throttle resize events to reduce DevTools overhead
  let resizeTimeout: NodeJS.Timeout
  const originalAddEventListener = window.addEventListener

  window.addEventListener = function (type: any, listener: any, options?: any) {
    if (type === 'resize') {
      const throttledListener = function (event: Event) {
        clearTimeout(resizeTimeout)
        resizeTimeout = setTimeout(() => {
          if (typeof listener === 'function') {
            listener(event)
          }
        }, 100)
      }
      return originalAddEventListener.call(this, type, throttledListener, options)
    }
    return originalAddEventListener.call(this, type, listener, options)
  }

  // Reduce mutation observer overhead when DevTools inspect DOM
  const originalObserve = MutationObserver.prototype.observe
  MutationObserver.prototype.observe = function (target: Node, options?: MutationObserverInit) {
    // Reduce observed mutations to only what's necessary
    const optimizedOptions = {
      ...options,
      subtree: options?.subtree ?? false,
      childList: options?.childList ?? true,
      attributes: options?.attributes ?? false,
      characterData: options?.characterData ?? false,
    }
    return originalObserve.call(this, target, optimizedOptions)
  }

  // Batch DOM reads/writes to reduce layout thrashing
  let rafScheduled = false
  const readCallbacks: Function[] = []
  const writeCallbacks: Function[] = []

  ;(window as any).__scheduleRead = (callback: Function) => {
    readCallbacks.push(callback)
    if (!rafScheduled) {
      rafScheduled = true
      requestAnimationFrame(() => {
        readCallbacks.forEach((cb) => cb())
        readCallbacks.length = 0
        writeCallbacks.forEach((cb) => cb())
        writeCallbacks.length = 0
        rafScheduled = false
      })
    }
  }
  ;(window as any).__scheduleWrite = (callback: Function) => {
    writeCallbacks.push(callback)
  }
}

export {}
