import { useEffect, useState } from 'react'
import { GraphPage } from './components/GraphPage'
import { EntryPage } from './components/EntryPage'
import { isStandalone } from './navigation'
import { useAppStore } from './state/store'

function parseLogSlug(pathname: string): string | null {
  const match = pathname.match(/^\/log\/([^/]+)\/?$/)
  return match ? decodeURIComponent(match[1]) : null
}

/**
 * Installed-PWA launch behavior: the manifest's start_url is "/" (the secret
 * slug can never go in the public manifest), so when the app launches
 * standalone at "/" with a stored slug, jump straight to the entry page.
 * Runs once at startup via the lazy state initializer; in-app navigation to
 * "/" (View graph) is unaffected.
 */
function initialPathname(): string {
  const storedSlug = useAppStore.getState().storedSlug
  if (window.location.pathname === '/' && storedSlug && isStandalone()) {
    const path = `/log/${encodeURIComponent(storedSlug)}`
    window.history.replaceState(null, '', path)
    return path
  }
  return window.location.pathname
}

export default function App() {
  const [pathname, setPathname] = useState(initialPathname)

  useEffect(() => {
    const onPopState = () => setPathname(window.location.pathname)
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const slug = parseLogSlug(pathname)

  if (slug !== null) {
    return <EntryPage slug={slug} />
  }

  return <GraphPage />
}
