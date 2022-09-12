import type { Employee } from '@prisma/client'
import { fetch } from '@remix-run/node'
import { badRequest, serverError } from 'remix-utils'
import { prisma } from '~/db.server'

export const getSignature = async (signerToken: string) => {
  const zapsignDocument = await prisma.zapsignDocument.findFirst({
    where: {
      signerToken,
    },
  })
  console.log({ zapsignDocument })

  if (!zapsignDocument) {
    throw badRequest('Token inválido')
  }

  const response = await fetch(
    `https://api.zapsign.com.br/api/v1/docs/${zapsignDocument.externalToken}/?api_token=${process.env.ZAPSIGN_ACCESS_TOKEN}`
  ).catch((err) => {
    throw serverError(err.response.data)
  })

  const data = await response.json()

  console.log({ data })

  if (data?.status !== zapsignDocument.documentStatus) {
    await prisma.zapsignDocument.update({
      where: {
        id: zapsignDocument.id,
      },
      data: {
        documentStatus: data?.status,
      },
    })
  }

  return data
}

export const requestSignature = async ({
  fullName,
  email,
  phone,
  employeeId,
}: {
  fullName: string
  email: string
  phone: string
  employeeId: Employee['id']
}) => {
  const response = await fetch(
    `https://api.zapsign.com.br/api/v1/models/create-doc/?api_token=${process.env.ZAPSIGN_ACCESS_TOKEN}`,
    {
      method: 'post',
      body: JSON.stringify({
        sandbox: process.env.NODE_ENV !== 'production',
        template_id: 'f9d24bcc-fca8-4fbd-9120-686f6e457c5b',
        signer_name: fullName,
        lang: 'es',
        brand_name: 'HoyAdelantas',
        created_by: 'erika.pardo@hoytrabajas.com',
        folder_path:
          process.env.NODE_ENV === 'production'
            ? '/T&C HoyAdelantas API'
            : '/test',
        data: [
          {
            de: '{{CORREO}}',
            para: email,
          },
          {
            de: '{{CELULAR}}',
            para: phone,
          },
        ],
      }),
    }
  ).catch((err) => {
    throw serverError(err.response.data)
  })

  const result = await response.json()

  const signerToken = result?.data?.signers?.[0]?.token || ''
  const externalToken = result?.data?.token || ''

  await prisma.zapsignDocument.create({
    data: {
      externalToken,
      signerToken,
      employeeId,
    },
  })

  return { data: result?.data, signerToken }
}
