// Tiny navigation helpers for the hand-rolled two-route shell. Kept out of
// App.tsx so components can import navigate without an App import cycle.

export function navigate(path: string) {
  window.history.pushState(null, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

/**
 * True when running as an installed PWA (home-screen launch) rather than in
 * a browser tab. Covers the standard display-mode media query and iOS
 * Safari's legacy navigator.standalone flag.
 */
export function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as { standalone?: boolean }).standalone === true
  )
}
