import type { PropsWithChildren } from 'react'
import type { ButtonProps } from './Button'

import { useTransition } from '@remix-run/react'
import { Button } from './Button'

export const SubmitButton = ({
  children,
  disabled,
  showSpinner = false,
  ...props
}: PropsWithChildren<ButtonProps> & { showSpinner?: boolean }) => {
  const transition = useTransition()
  const inProcess = transition.state !== 'idle'

  return (
    <Button
      {...props}
      type="submit"
      disabled={inProcess || disabled}
      isLoading={showSpinner && inProcess}
    >
      {children}
    </Button>
  )
}
