import { Link } from '@remix-run/react'
import { AiOutlineArrowLeft } from 'react-icons/ai'

interface GoBackProps {
  redirectTo: string
  description?: string
}

export const GoBack = ({ redirectTo, description }: GoBackProps) => {
  return (
    <Link
      to={redirectTo}
      className="ml-auto mb-10 flex gap-3 text-lg font-bold text-steelBlue-500"
    >
      <AiOutlineArrowLeft className="text-2xl" />
      <span className="tracking-widest">{description || 'Regresar'}</span>
    </Link>
  )
}
