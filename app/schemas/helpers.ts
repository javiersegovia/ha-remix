export const valueAsNumber = (value: unknown): number | null => {
  return (
    (Boolean(value) && typeof value === 'string' && parseFloat(value)) || null
  )
}

export const formatPaymentDays = (days?: unknown): number[] => {
  return days
    ? String(days)
        ?.split(',')
        .map((day) => parseFloat(day))
        .filter(Boolean)
        .filter(Number)
    : []
}
