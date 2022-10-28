import { StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { RemixBrowser } from '@remix-run/react'

const hydrate = () => {
  hydrateRoot(
    document,
    <StrictMode>
      <RemixBrowser />
    </StrictMode>
  )
}

// This is the recommended hydration method used inside the Remix official stacks.
// The problem is that this "startTransition" causes some unexpected bugs related to React minified bundle,
// that in the end, crashes our styling with React-Select components.
// We will get rid of startTransition until further investigation.

// const hydrate = () => {
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
  window.requestIdleCallback(hydrate)
} else {
  // Safari doesn't support requestIdleCallback
  // https://caniuse.com/requestidlecallback
  window.setTimeout(hydrate, 1)
}
