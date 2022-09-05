import { formatValue } from 'react-currency-input-field'
import { CurrencySymbol } from '~/components/FormFields/CurrencyInput'

export const formatMoney = (
  value: string | number,
  symbol: CurrencySymbol = CurrencySymbol.COP
) =>
  formatValue({
    value: value.toString(),
    suffix: ` ${symbol}`,
    groupSeparator: ',',
    decimalSeparator: '.',
  })
