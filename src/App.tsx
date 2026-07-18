import { useEffect, useState } from 'react'
import { GraphPage } from './components/GraphPage'
import { EntryPage } from './components/EntryPage'

export function navigate(path: string) {
  window.history.pushState(null, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

function parseLogSlug(pathname: string): string | null {
  const match = pathname.match(/^\/log\/([^/]+)\/?$/)
  return match ? decodeURIComponent(match[1]) : null
}

export default function App() {
  const [pathname, setPathname] = useState(window.location.pathname)

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
