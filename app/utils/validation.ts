import type { ZodSchema } from 'zod'

import { z } from 'zod'

export const preprocessNullableObject = <T extends ZodSchema>(schema: T) =>
  z.preprocess((obj) => {
    if (typeof obj === 'object' && obj !== null) {
      const sanitizedObject = Object.keys(obj)
        .filter((key) => {
          const value: any = obj[key as keyof typeof obj]
          if (typeof value === 'object' && value instanceof File) {
            return value.size > 0 && Boolean(value.name)
          }
          return Boolean(value)
        })
        .reduce(
          (acc, key) => ({ ...acc, [key]: obj[key as keyof typeof obj] }),
          {}
        )
      return Object.keys(sanitizedObject).length > 0 ? sanitizedObject : null
    }
    return obj
  }, schema)
