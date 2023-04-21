import type { CurrencySymbol } from '~/components/FormFields/CurrencyInput'
import { formatMoney } from './formatMoney'

interface FormatSalaryRangeArgs {
  minValue: number
  maxValue?: number | null
  currencySymbol?: CurrencySymbol
}

export const formatSalaryRange = ({
  minValue,
  maxValue,
  currencySymbol,
}: FormatSalaryRangeArgs) => {
  if (!maxValue) {
    return `${formatMoney(minValue, currencySymbol)} o más`
  }
  return `${formatMoney(minValue, currencySymbol)} a ${formatMoney(
    maxValue,
    currencySymbol
  )}`
}
