import type { GlobalSettingsInputSchema } from './global-settings.schema'

import { prisma } from '~/db.server'
import { badRequest } from '~/utils/responses'

export const getGlobalSettings = () => {
  return prisma.globalSettings.findFirst()
}

export const upsertGlobalSettings = async (data: GlobalSettingsInputSchema) => {
  const settings = await getGlobalSettings()

  try {
    if (settings) {
      return await prisma.globalSettings.update({
        where: {
          id: settings.id,
        },
        data,
      })
    }

    return prisma.globalSettings.create({
      data,
    })
  } catch (e) {
    // todo: Add logger
    console.error(e)
    throw badRequest({
      message:
        'Ha ocurrido un error inesperado al actualizar la configuración general',
      redirect: null,
    })
  }
}
