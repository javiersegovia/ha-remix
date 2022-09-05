import { Button } from '../Button'

interface ActionsProps {
  inProgress: boolean
  title: string
  disabled?: boolean
}

export const FormActions = ({
  inProgress,
  title,
  disabled = false,
}: ActionsProps) => {
  return (
    <div className="mt-6 flex justify-end">
      <Button
        type="submit"
        isLoading={inProgress}
        disabled={inProgress || disabled}
        className="mt-3 w-auto md:px-6"
        showCheckOnSuccess
      >
        {title}
      </Button>
    </div>
  )
}
