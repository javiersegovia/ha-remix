interface ErrorMessageProps {
  children: string | undefined
}

export const ErrorMessage = ({ children }: ErrorMessageProps) => {
  return <span className="my-2 flex text-sm text-red-600">{children}</span>
}
