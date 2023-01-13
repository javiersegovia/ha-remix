import { RiErrorWarningFill } from 'react-icons/ri'

interface ErrorTextProps {
  children: React.ReactNode
}

export const ErrorText = ({ children }: ErrorTextProps) => {
  return (
    <p className="my-0 flex text-sm text-red-500">
      <RiErrorWarningFill className="mr-2 text-lg" />
      <span className="font-medium">{children}</span>
    </p>
  )
}
