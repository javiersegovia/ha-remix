import type { PropsWithChildren } from 'react'
import { useIsSubmitting } from 'remix-validated-form'

import type { ButtonProps } from './Button'
import { Button } from './Button'

export const SubmitButton = ({
  children,
  disabled,
  ...props
}: PropsWithChildren<ButtonProps>) => {
  const isSubmitting = useIsSubmitting()
  return (
    <Button {...props} type="submit" disabled={isSubmitting || disabled}>
      {children}
    </Button>
  )
}
