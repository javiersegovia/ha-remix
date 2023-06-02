import { Link, useNavigate } from '@remix-run/react'
import { AiOutlineArrowLeft } from 'react-icons/ai'

interface GoBackProps {
  redirectTo?: string
  description?: string
}

export const GoBack = ({ description, redirectTo }: GoBackProps) => {
  const navigate = useNavigate()

  return redirectTo ? (
    <Link
      to={redirectTo}
      className="mb-10 ml-auto flex gap-3 text-lg font-bold text-steelBlue-500"
    >
      <AiOutlineArrowLeft className="text-2xl" />
      <span className="tracking-widest">{description || 'Regresar'}</span>
    </Link>
  ) : (
    <button
      onClick={() => navigate(-1)}
      className="mb-10 ml-auto flex gap-3 text-lg font-bold text-steelBlue-500"
    >
      <AiOutlineArrowLeft className="text-2xl" />
      <span className="tracking-widest">{description || 'Regresar'}</span>
    </button>
  )
}
