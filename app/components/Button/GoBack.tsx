import { Link } from '@remix-run/react'
import { AiOutlineArrowLeft } from 'react-icons/ai'

interface GoBackProps {
  redirectTo: string
}

export const GoBack = ({ redirectTo }: GoBackProps) => {
  return (
    <Link
      to={redirectTo}
      className="ml-auto mb-10 flex gap-3 font-medium text-cyan-600"
    >
      <AiOutlineArrowLeft className="text-2xl" />
      <span className="tracking-widest">Regresar</span>
    </Link>
  )
}
