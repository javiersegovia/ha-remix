export const formatSalaryRange = (
  minValue: number,
  maxValue?: number | null
) => {
  if (!maxValue) {
    return `$${minValue} COP o más`
  }
  return `$${minValue} a $${maxValue} COP`
}
