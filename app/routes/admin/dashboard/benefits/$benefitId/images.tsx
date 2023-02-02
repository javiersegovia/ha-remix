import { Outlet } from '@remix-run/react'
import {
  Button,
  ButtonColorVariants,
  ButtonIconVariants,
} from '~/components/Button'
import { TitleWithActions } from '~/components/Layout/TitleWithActions'

export default function AdminDashboardBenefitImagesRoute() {
  return (
    <>
      <TitleWithActions
        title="Imágenes"
        className="my-10"
        actions={
          <Button
            className="flex w-full items-center whitespace-nowrap sm:w-auto"
            href="create"
            icon={ButtonIconVariants.UPLOAD}
            variant={ButtonColorVariants.PRIMARY}
            size="SM"
          >
            Subir imagen
          </Button>
        }
      />

      <Outlet />
    </>
  )
}
