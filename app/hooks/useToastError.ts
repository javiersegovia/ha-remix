import type { ResponseError } from '~/utils/responses'
import type { ThrownResponse } from '@remix-run/react'

import { useEffect } from 'react'
import { useCatch, useNavigate } from '@remix-run/react'
import { toast } from 'react-hot-toast'

/**
 * This hook should be used inside an ErrorBoundary or CatchBoundary component,
 * and will display a toast with the error message.
 */
export const useToastError = () => {
  const caught = useCatch<ThrownResponse<number, ResponseError>>()
  const navigate = useNavigate()
  const parsedData = caught?.data

  const message = parsedData?.message || caught.statusText
  const redirect = parsedData?.redirect

  useEffect(() => {
    toast.error(message, { duration: Infinity })
  }, [message])

  useEffect(() => {
    if (redirect) {
      navigate(redirect)
    }
  }, [navigate, redirect])

  return null
}
