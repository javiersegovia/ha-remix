import { useSubmit, Form as RemixForm } from '@remix-run/react'

import type { PropsWithChildren } from 'react'
import type { z } from 'zod'
import type { ZodSchema } from 'zod'
import type { FormMethod } from '@remix-run/react'

import type { UseFormReturn } from 'react-hook-form'
import { FormProvider, useForm as useReactHookForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

interface FormProps<SchemaType extends ZodSchema> extends PropsWithChildren {
  schema?: SchemaType
  method: FormMethod
  defaultValues?: z.infer<SchemaType>
  action?: string
}

interface FormComponentProps extends PropsWithChildren {
  formMethods: UseFormReturn<any>
  method: FormMethod
  action?: string
  handleSubmit: (
    _: z.TypeOf<ZodSchema>,
    event?: React.BaseSyntheticEvent
  ) => void
}

export const Form = ({
  children,
  formMethods,
  action,
  method,
  handleSubmit,
}: FormComponentProps) => {
  return (
    <FormProvider {...formMethods}>
      <RemixForm
        action={action}
        method={method}
        onSubmit={formMethods.handleSubmit(handleSubmit)}
      >
        {children}
      </RemixForm>
    </FormProvider>
  )
}

/** This useForm hook is a wrapper around React Hook Form and Remix Form.
 *  The result is a JavaScript enhanced form that will return helpers to manipulate formValues when needed,
 *  and a form that will work without JavaScript when it's disabled.
 */
export const useForm = <SchemaType extends ZodSchema>({
  schema,
  defaultValues,
  method,
  action,
}: FormProps<SchemaType>) => {
  const formMethods = useReactHookForm<z.TypeOf<SchemaType>>({
    resolver: schema && zodResolver(schema),
    defaultValues,
  })

  const submit = useSubmit()

  /**
   * This submit method will be called if the schema is validated successfully on client-side,
   * with the react-hook-form zodResolver.
   *
   * If the JavaScript is disabled, the form will submit normally.
   */
  const handleSubmit = (
    _: z.TypeOf<SchemaType>,
    event?: React.BaseSyntheticEvent
  ) => {
    if (event) {
      submit(new FormData(event?.target as HTMLFormElement), {
        method,
        action,
      })
    }
  }

  return {
    formMethods,
    handleSubmit,
    submit,
    action,
    method,
  }
}
