import { format, sub } from 'date-fns'
import { es } from 'date-fns/locale'
import { capitalizeFirstLetter } from './capitalizeFirstLetter'

export const getLastPaymentMonths = () => {
  const currentDate = new Date()

  return Array.from(new Array(12)).map((_, index) => {
    const date = sub(currentDate, {
      months: index,
    })

    return {
      name: capitalizeFirstLetter(format(date, 'LLLL, yyyy', { locale: es })),
      id: `${date.getUTCMonth()}-${date.getUTCFullYear()}`,
    }
  })
}
