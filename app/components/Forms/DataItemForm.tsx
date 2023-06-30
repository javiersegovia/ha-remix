import { type DataItem, DataItemType } from '@prisma/client'

import { Link, useLoaderData } from '@remix-run/react'
import { ValidatedForm } from 'remix-validated-form'
import { json } from '@remix-run/node'

import { FormGridWrapper } from '~/components/FormFields/FormGridWrapper'
import { FormGridItem } from '~/components/FormFields/FormGridItem'

import { Button, ButtonColorVariants, ButtonElement } from '~/components/Button'
import { SubmitButton } from '../SubmitButton'
import type { LoaderArgs } from '@remix-run/server-runtime'
import { getBenefitById } from '~/services/benefit/benefit.server'
import { badRequest } from 'remix-utils'
import { benefitValidator } from '~/services/benefit/benefit.schema'
import { DatePicker } from '../FormFields/DatePicker'
import { Input } from '../FormFields/Input'

export type BenefitRouteData = {
  benefit: Awaited<ReturnType<typeof getBenefitById>>
}

interface DataItemFormProps {
  buttonText: string
  defaultValues?: Pick<DataItem, 'id' | 'label' | 'type'>
}

export const loader = async ({ params }: LoaderArgs) => {
  const { benefitId } = params

  if (!benefitId) {
    throw badRequest({
      message: 'No pudimos encontrar el ID del beneficio',
      redirect: `/dashboard/benefits`,
    })
  }
  const benefit = await getBenefitById(parseFloat(benefitId))

  if (!benefit) {
    throw badRequest({
      message: 'No pudimos encontrar el beneficio',
      redirect: `/dashboard/benefits`,
    })
  }

  return json({
    benefit,
  })
}

export const DataItemForm = ({ buttonText }: DataItemFormProps) => {
  const { benefit } = useLoaderData<typeof loader>()
  const { dataItems } = benefit
  return (
    <>
      <ValidatedForm
        id="DataItemForm"
        validator={benefitValidator}
        method="post"
      >
        <div>
          {dataItems.map((dataItem, _index) => (
            <>
              {dataItem.type === DataItemType.DATE ? (
                <FormGridItem isFullWidth>
                  <DatePicker
                    name={`response[${_index}]`}
                    label={dataItem.label}
                  />
                </FormGridItem>
              ) : (
                <FormGridItem isFullWidth>
                  <Input
                    name={`response[${_index}]`}
                    type={
                      dataItem.type === DataItemType.TEXT
                        ? DataItemType.TEXT
                        : DataItemType.NUMBER
                    }
                    label={dataItem.label}
                    placeholder="Ingrese una respuesta..."
                  />
                </FormGridItem>
              )}
            </>
          ))}
        </div>

        <FormGridWrapper className="mt-5">
          <FormGridItem>
            <Link
              to={`/dashboard/benefits/${benefit.id}/details`}
              className="w-full "
            >
              <ButtonElement
                variant={ButtonColorVariants.SECONDARY}
                className="w-full "
              >
                Cancelar
              </ButtonElement>
            </Link>
          </FormGridItem>
          <FormGridItem>
            <a
              className="mt-4 block w-full sm:mt-0 sm:w-auto"
              href={`/dashboard/benefits/${benefit.id}/addInfo/confirm`}
              rel="noreferrer noopener"
            >
              <Button type="button" size="MD">
                {buttonText || 'Próximamente'}
              </Button>
            </a>
            <SubmitButton>{buttonText}</SubmitButton>
          </FormGridItem>
        </FormGridWrapper>
      </ValidatedForm>
    </>
  )
}
