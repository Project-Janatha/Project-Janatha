import { ScrollViewStyleReset } from 'expo-router/html'

// This file is web-only and used to configure the root HTML for every
// web page during static rendering.
// The contents of this function only run in Node.js environments and
// do not have access to the DOM or browser APIs.
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />

        {/* 
          This viewport disables scaling which makes the mobile website act more like a native app.
          However this does reduce built-in accessibility. If you want to enable scaling, use this instead:
            <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        */}
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1.00001,viewport-fit=cover"
        />
        {/* 
          Disable body scrolling on web. This makes ScrollView components work closer to how they do on native. 
          However, body scrolling is often nice to have for mobile web. If you want to enable it, remove this line.
        */}
        <ScrollViewStyleReset />

        <style
          dangerouslySetInnerHTML={{
            __html:
              'body{background-color:#fff;margin:0;padding:0}@media(prefers-color-scheme:dark){body{background-color:#0A0A0A}}',
          }}
        />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />

        {/* Critical: Prevent Chrome DevTools from crashing on WebGL canvas inspection */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Aggressive DevTools crash prevention for WebGL/MapLibre
                if (typeof window !== 'undefined') {
                  // Prevent WebGL context inspection
                  window.addEventListener('load', function() {
                    const canvases = document.querySelectorAll('canvas');
                    canvases.forEach(function(canvas) {
                      if (canvas.className && canvas.className.includes('maplibre')) {
                        // Make canvas invisible to inspector
                        Object.defineProperty(canvas, '__REACT_DEVTOOLS_GLOBAL_HOOK__', {
                          get: function() { return undefined; },
                          set: function() {}
                        });
                      }
                    });
                  });
                  
                  // Override console methods to prevent crashes
                  const originalError = console.error;
                  console.error = function(...args) {
                    const msg = args.join(' ');
                    if (msg.includes('WebGL') || msg.includes('maplibre') || msg.includes('mapboxgl')) {
                      return;
                    }
                    originalError.apply(console, args);
                  };
                  
                  // Prevent inspector from serializing WebGL contexts
                  const originalGetContext = HTMLCanvasElement.prototype.getContext;
                  HTMLCanvasElement.prototype.getContext = function(type, ...args) {
                    const ctx = originalGetContext.call(this, type, ...args);
                    if (ctx && (type === 'webgl' || type === 'webgl2')) {
                      // Mark context as non-serializable
                      Object.defineProperty(ctx, 'toJSON', {
                        value: function() { return '[WebGL Context]'; }
                      });
                    }
                    return ctx;
                  };
                }
              })();
            `,
          }}
        />

        {/* Add any additional <head> elements that you want globally available on web... */}
        <meta title="Janatha" />
      </head>
      <body>{children}</body>
    </html>
  )
}
