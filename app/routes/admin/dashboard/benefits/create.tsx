import type { ActionFunction } from '@remix-run/server-runtime'

import { redirect } from '@remix-run/server-runtime'
import { validationError } from 'remix-validated-form'
import { benefitValidator } from '~/services/benefit/benefit.schema'
import { requireAdminUserId } from '~/session.server'
import { createBenefit } from '~/services/benefit/benefit.server'
import { BenefitForm } from '~/components/Forms/BenefitForm'
import { Container } from '~/components/Layout/Container'
import { Link } from '@remix-run/react'
import { AiOutlineArrowLeft } from 'react-icons/ai'
import { Title } from '~/components/Typography/Title'

export const action: ActionFunction = async ({ request }) => {
  await requireAdminUserId(request)

  const formData = await request.formData()

  const { data, submittedData, error } = await benefitValidator.validate(
    formData
  )

  if (error) {
    return validationError(error, submittedData)
  }

  await createBenefit(data)

  return redirect(`/admin/dashboard/benefits`)
}

export default function CreateBenefitRoute() {
  return (
    <Container>
      <Link
        to="/admin/dashboard/benefits"
        className="ml-auto mb-10 flex gap-3 font-medium text-cyan-600"
      >
        <AiOutlineArrowLeft className="text-2xl" />
        <span className="tracking-widest">Regresar</span>
      </Link>

      <Title className="mb-10">Crear beneficio</Title>

      <BenefitForm buttonText="Crear" />
    </Container>
  )
}
