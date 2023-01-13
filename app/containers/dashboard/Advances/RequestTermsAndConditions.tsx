import React from 'react'
import { Button } from '~/components/Button'

interface RequestTermsAndConditionsProps {
  token?: string | null
}

export const RequestTermsAndConditions = ({
  token,
}: RequestTermsAndConditionsProps) => {
  return (
    <>
      <h1 className="mb-4 text-center text-3xl font-semibold text-steelBlue-600">
        Términos y Condiciones
      </h1>

      <div className="mx-auto mb-6 max-w-xl">
        <p className="text-center text-sm">
          Para obtener acceso al beneficio de adelantos, por favor haz click en
          el siguiente link para acceder a la firma de los Términos y
          Condiciones.
        </p>
      </div>

      <Button
        href={`https://app.zapsign.co/verificar/${token}`}
        external
        targetBlank
      >
        Verificar documento
      </Button>
    </>
  )
}
