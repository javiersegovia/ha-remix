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

// This is the recommended hydration method used inside the Remix official stacks.
// The problem is that the new "hydrateRoot" used in React Suspense is causing unexpected bugs with React-Select styling.
// We will use the previous "hydrate" method until further investigation.

// const runHydrate = () => {
//   startTransition(() => {
//     hydrateRoot(
//       document,
//       <StrictMode>
//         <RemixBrowser />
//       </StrictMode>
//     )
//   })
// }

if (window.requestIdleCallback) {
  window.requestIdleCallback(runHydrate)
} else {
  // Safari doesn't support requestIdleCallback
  // https://caniuse.com/requestidlecallback
  window.setTimeout(runHydrate, 1)
}
