import { formatRelative, format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { DateMDYString } from '~/components/FormFields/DatePicker'

export const formatRelativeDate = (date: Date) => {
  return formatRelative(date, new Date(), {
    locale: es,
  })
}

export const formatDate = (date: Date | number) => {
  return format(date, 'dd/MM/yyyy', {
    locale: es,
  })
}

export const formatMDYDate = (date: Date | number): DateMDYString => {
  return format(date, 'MM-dd-yyyy', {
    locale: es,
  }) as DateMDYString
}

// parse a date in yyyy-mm-dd format
export const parseDate = (date: Date | string) => {
  const stringDate = typeof date === 'object' ? date.toString() : date
  const parts = stringDate.split('-')

  // new Date(year, month [, day [, hours[, minutes[, seconds[, ms]]]]])
  return new Date(
    parseFloat(parts[0]),
    parseFloat(parts[1]) - 1,
    parseFloat(parts[2])
  ) // Note: months are 0-based
}

export function dateAsUTC(date?: Date | null) {
  return date
    ? new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
    : null
}
