interface ErrorMessageProps {
  children: string | undefined
}

export const ErrorMessage = ({ children }: ErrorMessageProps) => {
  return <span className="ml-1 text-xs text-red-600">{children}</span>
}
