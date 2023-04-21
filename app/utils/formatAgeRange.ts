export const formatAgeRange = (minAge: number, maxAge?: number | null) => {
  if (!maxAge) {
    return `${minAge} años en adelante`
  }
  return `${minAge} a ${maxAge} años`
}
