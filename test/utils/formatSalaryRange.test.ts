import { formatSalaryRange } from '~/utils/formatSalaryRange'

describe('formatSalaryRange', () => {
  test('should return "$1000000 COP o más" when no maxValue is provided', () => {
    const minValue = 1000000
    const result = formatSalaryRange(minValue)

    expect(result).toEqual('$1000000 COP o más')
  })

  test('should return "$1000000 a $2000000 COP" when minValue is 1000000 and maxValue is 2000000', () => {
    const minValue = 1000000
    const maxValue = 2000000
    const result = formatSalaryRange(minValue, maxValue)

    expect(result).toEqual('$1000000 a $2000000 COP')
  })
})
