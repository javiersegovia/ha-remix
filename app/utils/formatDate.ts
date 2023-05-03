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

export const parseISOLocal = (s: string) => {
  const b = s.split(/\D/)
  return new Date(+b[0], +b[1] - 1, +b[2], +b[3], +b[4], +b[5])
}

export const parseISOLocalNullable = (s: string | null) => {
  return s ? parseISOLocal(s) : null
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

export function sanitizeDate(date?: Date | null) {
  if (date) {
    const year = date?.getUTCFullYear()
    const month = date?.getUTCMonth()
    const day = date?.getUTCDate()

    return new Date(`${year}-${month + 1}-${day} EDT`)
  }

  return date
}

export const ISO_DATE_REGEX = /\d{4}-[01]\d-[0-3]\d/
