import { SubmitButton } from '../SubmitButton'

interface ActionsProps {
  title: string
}

export const FormActions = ({ title }: ActionsProps) => {
  return (
    <div className="mt-6 flex justify-end">
      <SubmitButton className="mt-3 w-auto md:px-6">{title}</SubmitButton>
    </div>
  )
}
