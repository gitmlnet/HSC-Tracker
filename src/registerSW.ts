// Keep this in sync with public/sw.js so visits on older worker URLs can
// trigger an immediate, cache-busted update to the current offline shell.
const SW_VERSION = "v8";

export function registerSW() {
  if (!("serviceWorker" in navigator) || !window.isSecureContext) return;

  // Register on first load instead of waiting for `load`, so the browser can
  // assess installability as soon as the app shell is ready.
  const register = () => {
    const url = new URL("sw.js", document.baseURI);
    if (!import.meta.env.PROD) url.searchParams.set("dev", "1");
    else url.searchParams.set("v", SW_VERSION);
    navigator.serviceWorker.register(url.href, {
      scope: new URL("./", document.baseURI).pathname,
      updateViaCache: "none"
    }).then(registration => {
      registration.update().catch(() => undefined);
    }).catch(error => {
      // The app remains usable if service-worker setup is unavailable.
      console.warn("PWA offline support could not be enabled.", error);
    });
  };

  if (document.readyState === "complete") register();
  else window.addEventListener("load", register, { once: true });
}
