import { FormGridItem } from '~/components/FormFields/FormGridItem'
import { FormGridWrapper } from '~/components/FormFields/FormGridWrapper'
import { Box } from '~/components/Layout/Box'
import { Title } from '~/components/Typography/Title'
import { Input } from '~/components/FormFields/Input'
import { ValidatedForm } from 'remix-validated-form'
import { benefitValidator } from '~/services/benefit/benefit.schema'

export default function CreateBenefitRoute() {
  return (
    <section>
      <Title>Beneficios</Title>

      <Box className="p-5">
        <ValidatedForm id="BenefitForm" validator={benefitValidator}>
          <FormGridWrapper>
            <FormGridItem>
              <Input name="name" label="Nombre" type="text" />
            </FormGridItem>
          </FormGridWrapper>
        </ValidatedForm>
      </Box>
    </section>
  )
}
