import type { PropsWithChildren } from 'react'
import { useIsSubmitting } from 'remix-validated-form'

import type { ButtonProps } from './Button'
import { Button } from './Button'

export const SubmitButton = ({
  children,
  disabled,
  showSpinner = false,
  ...props
}: PropsWithChildren<ButtonProps> & { showSpinner?: boolean }) => {
  const isSubmitting = useIsSubmitting()
  return (
    <Button
      {...props}
      type="submit"
      disabled={isSubmitting || disabled}
      isLoading={showSpinner && isSubmitting}
    >
      {children}
    </Button>
  )
}
