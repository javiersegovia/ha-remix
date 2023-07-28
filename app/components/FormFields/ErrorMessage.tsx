interface ErrorMessageProps {
  children: string | undefined
}

export const ErrorMessage = ({ children }: ErrorMessageProps) => {
  return (
    <p className="ml-1 mt-1 inline-block text-xs leading-4 text-red-600">
      {children}
    </p>
  )
}
