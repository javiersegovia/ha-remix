import type { ZodDate, ZodNullable, ZodOptional } from 'zod'
import { z } from 'zod'
import { zfd } from 'zod-form-data'

export const formatPaymentDays = (days?: unknown): number[] => {
  return days
    ? String(days)
        ?.split(',')
        .map((day) => parseFloat(day))
        .filter(Boolean)
        .filter(Number)
    : []
}

export type EnumOption<T extends string = string> = {
  value: T
  name: string
}

/** This function is used for using enums inside Selects.
 *  It looks inside an array of EnumOptions[] to return the proper option
 */
export function getEnumOptionValue<
  TValue extends string,
  TOptionsArray extends EnumOption<TValue>[] = EnumOption<TValue>[]
>(value: TValue, options: TOptionsArray) {
  return options.find((option) => option.value === value)
}

export const zDate = (zodDate: ZodDate | ZodNullable<ZodOptional<ZodDate>>) => {
  return zfd.text(
    z.preprocess((value) => {
      if (typeof value === 'string') return new Date(value)
      return value
    }, zodDate)
  )
}
