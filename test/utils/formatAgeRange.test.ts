import { formatAgeRange } from '~/utils/formatAgeRange'

describe('formatAgeRange', () => {
  it('returns "18 años en adelante" when no maxAge is provided', () => {
    const minAge = 18

    const result = formatAgeRange(minAge)

    expect(result).toEqual('18 años en adelante')
  })

  it('returns "20 a 40 años" when minAge is 20 and maxAge is 40', () => {
    const minAge = 20
    const maxAge = 40

    const result = formatAgeRange(minAge, maxAge)

    expect(result).toEqual('20 a 40 años')
  })
})
