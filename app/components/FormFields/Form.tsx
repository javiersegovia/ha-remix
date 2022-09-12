import { useSubmit, Form as RemixForm } from '@remix-run/react'

import type { PropsWithChildren } from 'react'
import type { z } from 'zod'
import type { ZodSchema } from 'zod'
import type { FormMethod } from '@remix-run/react'

import type { UseFormReturn } from 'react-hook-form'
import { FormProvider, useForm as useReactHookForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

interface FormProps extends PropsWithChildren {
  formMethods: UseFormReturn<any>
  method: FormMethod
  action?: string
  handleSubmit: (
    _: z.infer<ZodSchema>,
    event?: React.BaseSyntheticEvent
  ) => void
}

export const Form = ({
  children,
  formMethods,
  action,
  method,
  handleSubmit,
}: FormProps) => {
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

interface UseFormProps<T extends ZodSchema<any>> extends PropsWithChildren {
  schema?: T
  method: FormMethod
  defaultValues?: z.infer<T>
  action?: string
}

/** This useForm hook is a wrapper around React Hook Form and Remix Form.
 *  The result is a JavaScript enhanced form that will return helpers to manipulate formValues when needed,
 *  and a form that will work without JavaScript when it's disabled.
 */
export const useForm = <T extends ZodSchema<any>>({
  schema,
  defaultValues,
  method,
  action,
}: UseFormProps<T>) => {
  const formMethods = useReactHookForm<z.infer<T>>({
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
  const handleSubmit = (_: z.infer<T>, event?: React.BaseSyntheticEvent) => {
    if (event) {
      console.log({
        _,
        form: event?.target,
        formData: new FormData(event?.target),
      })
      // submit(_, {
      submit(new FormData(event?.target), {
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
