import type { CompanyPoints } from '@prisma/client'

import { Card } from '~/components/Cards/Card'
import { Text } from '~/components/Typography/Text'
import { Title } from '~/components/Typography/Title'

type PointMetricsProps = Pick<
  CompanyPoints,
  'currentBudget' | 'estimatedBudget' | 'circulatingPoints' | 'spentPoints'
> & {
  prepaidPoints?: CompanyPoints['prepaidPoints']
}

export const PointMetrics = ({
  currentBudget,
  estimatedBudget,
  circulatingPoints,
  spentPoints,
  prepaidPoints,
}: PointMetricsProps) => {
  return (
    <section className="grid gap-6 md:grid-cols-4">
      <Card>
        <Title as="h2">{estimatedBudget}</Title>
        <Text>Presupuesto estimado</Text>
      </Card>

      <Card>
        <Title as="h2">{currentBudget}</Title>
        <Text>Presupuesto actual</Text>
      </Card>

      <Card>
        <Title as="h2">{circulatingPoints}</Title>
        <Text>Puntos en circulación</Text>
      </Card>

      <Card>
        <Title as="h2">{spentPoints}</Title>
        <Text>Puntos consumidos</Text>
      </Card>
    </section>
  )
}
