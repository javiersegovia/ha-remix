import { useEffect } from 'react'
import {
  isRouteErrorResponse,
  useActionData,
  useLoaderData,
  useNavigate,
  useRouteError,
} from '@remix-run/react'
import { toast } from 'react-hot-toast'
import type { ResponseError } from '~/utils/responses'

/**
 * This hook should be used inside an ErrorBoundary component,
 * and will display a toast with the error message.
 */
export const useToastError = () => {
  const error = useRouteError()
  const loaderData = useLoaderData()
  const actionData = useActionData()
  const navigate = useNavigate()

  useEffect(() => {
    let message: string | null | undefined = null
    let redirect: string | null | undefined = null

    if (isRouteErrorResponse(error)) {
      message = error?.data?.message || error.statusText
      redirect = error?.data?.redirect
    } else if (loaderData && 'errorData' in loaderData) {
      message = (loaderData.errorData as ResponseError).message
      redirect = (loaderData.errorData as ResponseError).redirect
    } else if (actionData && 'errorData' in actionData) {
      message = (actionData.errorData as ResponseError).message
      redirect = (actionData.errorData as ResponseError).redirect
    }

    if (message) {
      toast.error(message, { duration: Infinity })
    }

    if (redirect) {
      navigate(redirect)
    }
  }, [error, navigate, actionData, loaderData])

  return null
}
