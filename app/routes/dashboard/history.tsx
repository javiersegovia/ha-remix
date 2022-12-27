import React from 'react'
import { Outlet, useLocation } from '@remix-run/react'
import { Button } from '~/components/Button'
import clsx from 'clsx'

export default function DashboardHistoryRoute() {
  const location = useLocation()
  const isPremium = location.pathname.includes('premium-advances')

  return (
    <>
      <div className="mx-auto mt-8 w-full max-w-screen-xl p-2 sm:p-8">
        <div className="mx-auto mt-8 flex rounded-[15px] bg-white p-2 shadow-md">
          <Button
            href="payroll-advances"
            className={clsx(
              !isPremium
                ? 'bg-steelBlue-600 text-white hover:bg-steelBlue-600'
                : 'bg-transparent hover:bg-transparent'
            )}
          >
            Adelantos de nómina
          </Button>

          <Button
            href="premium-advances"
            className={clsx(
              isPremium
                ? 'bg-steelBlue-600 text-white hover:bg-steelBlue-600'
                : 'bg-transparent hover:bg-transparent'
            )}
          >
            Adelantos de prima
          </Button>
        </div>

        <Outlet />
      </div>
    </>
  )
}
