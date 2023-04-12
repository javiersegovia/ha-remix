import React from 'react'
import ErrorContainer from '~/containers/ErrorContainer'

export default function UnauthorizedRoute() {
  return (
    <>
      <ErrorContainer
        title="Sin autorización"
        message="No tienes permisos para acceder a esta página"
      />
    </>
  )
}
