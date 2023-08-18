import type { ChangeEvent } from 'react'
import { Form, useNavigation } from '@remix-run/react'

import clsx from 'clsx'
import { useState } from 'react'
import { Button, ButtonColorVariants } from '~/components/Button'
import { SubmitButton } from '~/components/SubmitButton'
import { Title } from '~/components/Typography/Title'
import { Spinner } from '~/components/Spinner'

interface UploadIndicatorActivityFormProps {
  onCloseRedirectTo: string
}

export const UploadIndicatorActivityForm = ({
  onCloseRedirectTo,
}: UploadIndicatorActivityFormProps) => {
  const [csvFileName, setCsvFileName] = useState('')

  const { state } = useNavigation()
  const isSubmitting = state === 'submitting'

  const handleCSVChange = (e: ChangeEvent<HTMLInputElement>) => {
    const fileName = e.target?.files?.[0].name

    if (fileName) {
      setCsvFileName(fileName)
    }
  }

  return (
    <div className="space-y-8">
      <Title className="text-center">
        {isSubmitting ? 'Cargando actividad...' : 'Carga masiva de actividad'}
      </Title>

      {isSubmitting && (
        <div className="flex items-center justify-center">
          <Spinner className=" text-steelBlue-800" size={10} />
        </div>
      )}

      {!isSubmitting && (
        <div className={clsx('space-y-4')}>
          <p className="text-justify">
            Selecciona un documento de extensión <strong>.csv</strong> para
            cargar masivamente la actividad relacionada a un indicador.
          </p>

          <p>
            Asegúrate de cumplir con el{' '}
            <a
              href="https://docs.google.com/spreadsheets/d/154WVlBlKHJjaC0TeOM1dtqsVSRNpgW6i"
              rel="noopener noreferrer"
              target="_blank"
              className="text-steelBlue-500 underline"
            >
              formato de carga masiva.
            </a>{' '}
            Máx. 400 elementos.
          </p>

          <Form
            method="post"
            encType="multipart/form-data"
            className="w-full space-y-8"
            noValidate
          >
            <label
              htmlFor="csvFile"
              className="mt-6 block w-full cursor-pointer rounded-2xl border border-dashed border-steelBlue-400 bg-steelBlue-100 p-6"
            >
              {csvFileName || 'Seleccionar archivo'}

              <input
                id="csvFile"
                type="file"
                name="csvFile"
                accept=".csv"
                className="mx-auto my-3 hidden text-center"
                onChange={handleCSVChange}
                disabled={state !== 'idle'}
              />
            </label>

            <div className="grid grid-cols-2 items-center gap-6">
              <Button
                href={onCloseRedirectTo}
                variant={ButtonColorVariants.SECONDARY}
              >
                Cancelar
              </Button>

              <SubmitButton>Cargar</SubmitButton>
            </div>
          </Form>
        </div>
      )}
    </div>
  )
}
