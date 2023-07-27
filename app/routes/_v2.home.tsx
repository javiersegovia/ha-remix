import type { LoaderArgs } from '@remix-run/server-runtime'

import { useOutlet } from '@remix-run/react'
import { requireEmployee } from '~/session.server'
import { AnimatePresence } from 'framer-motion'

export const loader = async ({ request }: LoaderArgs) => {
  await requireEmployee(request)

  return null
}

const HomeRoute = () => {
  const outlet = useOutlet()

  return (
    <>
      <div className="h-[2000px] bg-[aqua]">HomeRoute</div>

      <AnimatePresence mode="wait">{outlet}</AnimatePresence>
    </>
  )
}

export default HomeRoute
