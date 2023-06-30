import { type DataItem, DataItemType } from '@prisma/client'
import type { LoaderArgs } from '@remix-run/server-runtime'

import { Link, useLoaderData } from '@remix-run/react'
import { ValidatedForm } from 'remix-validated-form'
import { json } from '@remix-run/node'

import { FormGridWrapper } from '~/components/FormFields/FormGridWrapper'
import { FormGridItem } from '~/components/FormFields/FormGridItem'

import { ButtonColorVariants, ButtonElement } from '~/components/Button'
import { SubmitButton } from '../SubmitButton'
import { getBenefitById } from '~/services/benefit/benefit.server'
import { badRequest } from 'remix-utils'
import { DatePicker } from '../FormFields/DatePicker'
import { Input } from '../FormFields/Input'
import { benefitDataItemsValidator } from '~/services/benefit/benefit-data-items.schema'

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
  const { dataItems, notificationEmails } = benefit

  return (
    <>
      <ValidatedForm
        id="DataItemForm"
        validator={benefitDataItemsValidator}
        method="post"
      >
        <div className="max-h-80 overflow-y-auto">
          <FormGridWrapper>
            {dataItems.map((dataItem, _index) => (
              <>
                <input
                  type="hidden"
                  name={`responses[${_index}].label`}
                  value={dataItem.label}
                />

                {dataItem.type === DataItemType.DATE ? (
                  <FormGridItem isFullWidth={dataItems.length <= 3}>
                    <DatePicker
                      name={`responses[${_index}].value`}
                      label={dataItem.label}
                    />
                  </FormGridItem>
                ) : (
                  <FormGridItem isFullWidth={dataItems.length <= 3}>
                    <Input
                      name={`responses[${_index}].value`}
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
          </FormGridWrapper>
        </div>

        <FormGridWrapper className="pt-6">
          <FormGridItem isFullWidth className="text-center text-sm">
            <p>
              Esta información será enviada a los siguientes correos
              electrónicos:
            </p>
            <p className="text-gray-500">{notificationEmails.join(', ')}</p>
          </FormGridItem>

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
            <SubmitButton>{buttonText}</SubmitButton>
          </FormGridItem>
        </FormGridWrapper>
      </ValidatedForm>
    </>
  )
}
