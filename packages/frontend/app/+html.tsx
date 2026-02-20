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

        {/* Mobile-optimized viewport */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover"
        />

        {/* PWA and mobile app tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />

        {/* Disable body scrolling on web. This makes ScrollView components work closer to how they do on native. 
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

        {/* Add any additional <head> elements that you want globally available on web... */}
        <meta title="Janatha" />
      </head>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var d = document;
                  var overlay = d.createElement('div');
                  overlay.id = 'jn-boot-overlay';
                  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;background:#111;color:#fff;padding:8px 12px;font:12px -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;';
                  overlay.textContent = 'Loading app...';
                  d.body.appendChild(overlay);

                  var ready = false;
                  window.__jn_markReady = function () {
                    ready = true;
                    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
                  };

                  var report = function (msg) {
                    try {
                      localStorage.setItem('jn_last_error', msg);
                    } catch (e) {}
                    if (overlay) {
                      overlay.textContent = 'App error: ' + msg;
                    }
                  };

                  window.addEventListener('error', function (e) {
                    var msg = (e && e.message) ? e.message : 'Unknown error';
                    report(msg);
                  });
                  window.addEventListener('unhandledrejection', function (e) {
                    var msg = (e && e.reason && e.reason.message) ? e.reason.message : 'Unhandled promise rejection';
                    report(msg);
                  });

                  setTimeout(function () {
                    if (!ready) {
                      var last = '';
                      try { last = localStorage.getItem('jn_last_error') || ''; } catch (e) {}
                      overlay.textContent = last ? ('App error: ' + last) : 'App did not finish loading.';
                    }
                  }, 8000);
                } catch (e) {}
              })();
            `,
          }}
        />
        {children}
      </body>
    </html>
  )
}
