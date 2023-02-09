import { prisma } from '~/db.server'
import { deleteS3Object } from '../aws/s3.server'

export const deleteImageByKey = async (key: string) => {
  const imageToDelete = await prisma.image.findUnique({
    where: {
      key,
    },
    select: {
      id: true,
      key: true,
    },
  })

  if (!imageToDelete) {
    return null
  }

  try {
    await Promise.all([
      deleteS3Object(imageToDelete.key),
      prisma.image.delete({
        where: {
          id: imageToDelete.id,
        },
      }),
    ])
  } catch (e) {
    console.error('Error deleting existing benefit image')
    console.error(e)
  }
}
