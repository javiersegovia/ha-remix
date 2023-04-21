import { CurrencySymbol } from '~/components/FormFields/CurrencyInput'
import { formatSalaryRange } from '~/utils/formatSalaryRange'

describe('formatSalaryRange', () => {
  test('should return "1000000 COP o más" when no maxValue is provided', () => {
    const minValue = 1000000
    const result = formatSalaryRange({
      minValue,
      currencySymbol: CurrencySymbol.COP,
    })

    expect(result).toEqual('1,000,000 COP o más')
  })

  test('should return "1,000,000 COP a 2,000,000 COP" when minValue is 1000000 and maxValue is 2000000', () => {
    const minValue = 1000000
    const maxValue = 2000000

    const result = formatSalaryRange({
      minValue,
      maxValue,
      currencySymbol: CurrencySymbol.COP,
    })

    expect(result).toEqual('1,000,000 COP a 2,000,000 COP')
  })
})
