import type { PropsWithChildren } from 'react'
import type { ButtonProps } from './Button'

import { useNavigation } from '@remix-run/react'
import { Button } from './Button'

export const SubmitButton = ({
  children,
  disabled,
  showSpinner = false,
  ...props
}: PropsWithChildren<ButtonProps> & { showSpinner?: boolean }) => {
  const { state } = useNavigation()

  return (
    <Button
      {...props}
      type="submit"
      disabled={disabled || state !== 'idle'}
      isLoading={showSpinner && state !== 'idle'}
    >
      {children}
    </Button>
  )
}
