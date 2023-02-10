import { StrictMode } from 'react'
import { hydrate } from 'react-dom'
import { RemixBrowser } from '@remix-run/react'

const runHydrate = () => {
  hydrate(
    <StrictMode>
      <RemixBrowser />
    </StrictMode>,
    document
  )
}

if (window.requestIdleCallback) {
  window.requestIdleCallback(runHydrate)
} else {
  // Safari doesn't support requestIdleCallback
  // https://caniuse.com/requestidlecallback
  window.setTimeout(runHydrate, 1)
}
