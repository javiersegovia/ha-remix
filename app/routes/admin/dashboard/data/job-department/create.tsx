import { Modal } from '~/components/Dialog/Modal'
import { Title } from '~/components/Typography/Title'
import { RightPanel } from '../../../../../components/Layout/RightPanel'

const onCloseRedirectTo = '/admin/dashboard/data/job-department/' as const

export default function JobDepartmentCreateRoute() {
  return (
    <Modal onCloseRedirectTo={onCloseRedirectTo}>
      <RightPanel onCloseRedirectTo={onCloseRedirectTo}>
        <Title>Crear área de trabajo</Title>
      </RightPanel>
    </Modal>
  )
}
