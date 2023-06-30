import { json } from '@remix-run/node'

export type ResponseError = {
  message: string
  redirect?: string | null
}

const baseError = (errorData: ResponseError, status: number) => {
  return json({ errorData }, { status, statusText: errorData.message })
}

export const badRequest = (error: ResponseError) => baseError(error, 400)
export const unauthorized = (error: ResponseError) => baseError(error, 401)
export const forbidden = (error: ResponseError) => baseError(error, 403)
export const notFound = (error: ResponseError) => baseError(error, 404)
