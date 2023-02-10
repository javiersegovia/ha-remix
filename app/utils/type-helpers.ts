import type { DataFunctionArgs } from '@remix-run/server-runtime'

export type ExtractRemixResponse<T extends (args: DataFunctionArgs) => any> =
  Awaited<ReturnType<Awaited<ReturnType<T>>['json']>>
