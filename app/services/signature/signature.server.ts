import type { Employee, ZapsignDocument } from '@prisma/client'
import type { SignatureDetailsResponse } from './signature.interface'

import { ZapsignDocumentStatus } from '@prisma/client'
import { fetch } from '@remix-run/node'
import { serverError } from 'remix-utils'

import { badRequest } from '~/utils/responses'
import { prisma } from '~/db.server'

/** ! Right now, we only use ZapSign on Terms & Conditions.
 *  If we add more documents, we will have to refactor this function in order to identify
 *  The specific document that we have to check.
 *  TODO: Add a ENUM with the document type on ZapsignDocument (TERMS_AND_CONDITIONS) and refactor this
 */
export const hasSignedTerms = async (
  employeeId: Employee['id']
): Promise<boolean> => {
  /** It should have only one, but just in case */
  const employeeData = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: {
      phone: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  })

  if (!employeeData) {
    throw badRequest({
      message: 'El usuario no ha sido encontrado',
      redirect: null,
    })
  }

  if (!employeeData.phone) {
    throw badRequest({
      message: 'El número telefónico no ha sido registrado',
      redirect: null,
    })
  }

  const document = await prisma.zapsignDocument.findFirst({
    where: {
      employeeId,
    },
  })

  if (document) {
    const signatureData = await getSignature(document.signerToken, document)
    return signatureData.status === ZapsignDocumentStatus.signed
  }

  await requestSignature({
    fullName: `${employeeData.user.firstName} ${employeeData.user.lastName}`,
    email: employeeData?.user.email,
    phone: employeeData?.phone,
    employeeId,
  })

  return Boolean(document)
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
        brand_name: 'HoyTrabajas Beneficios',
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
    console.error(err) // Todo LOGGER: Log error and save to a file
    throw serverError(err.message)
  })

  const data = await response.json()
  const signerToken = data?.signers?.[0]?.token || ''
  const externalToken = data?.token || ''

  await prisma.zapsignDocument.create({
    data: {
      externalToken,
      signerToken,
      employeeId,
    },
  })

  return { data, signerToken }
}

/** TODO Add ZapSign Webhook */

export const getZapsignDocumentByEmployeeId = async (
  employeeId: Employee['id']
) => {
  return prisma.zapsignDocument.findFirst({
    where: {
      employeeId,
    },
  })
}

const getSignature = async (
  signerToken: string,
  zapsignDocument: ZapsignDocument
): Promise<SignatureDetailsResponse> => {
  if (zapsignDocument.externalToken) {
    const response = await fetch(
      `https://api.zapsign.com.br/api/v1/docs/${zapsignDocument.externalToken}/?api_token=${process.env.ZAPSIGN_ACCESS_TOKEN}`
    ).catch((err) => {
      throw serverError(err.response.data)
    })

    const data = await response.json()

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

  throw serverError('Ha ocurrido un error con el registro del documento')
}
