import type { PutObjectCommandInput } from '@aws-sdk/client-s3'
import type { UploadHandler } from '@remix-run/node'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'

import {
  writeAsyncIterableToWritable,
  unstable_composeUploadHandlers as composeUploadHandlers,
  unstable_createMemoryUploadHandler as createMemoryUploadHandler,
} from '@remix-run/node'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { defaultProvider } from '@aws-sdk/credential-provider-node'
import { PassThrough } from 'stream'
import { faker } from '@faker-js/faker'

import { streamToBuffer } from '~/utils/streamToBuffer'

const credentials = defaultProvider()
const {
  AWS_STORAGE_REGION,
  AWS_S3_IMAGES_BUCKET,
  AWS_S3_IMAGES_DEV_BUCKET,
  NODE_ENV,
} = process.env

if (
  !(
    Boolean(credentials) &&
    AWS_STORAGE_REGION &&
    AWS_S3_IMAGES_BUCKET &&
    AWS_S3_IMAGES_DEV_BUCKET
  )
) {
  throw new Error(`AWS Storage Service is missing required configuration.`)
}

const bucket =
  NODE_ENV === 'development' ? AWS_S3_IMAGES_DEV_BUCKET : AWS_S3_IMAGES_BUCKET

export const s3UploadHandler: UploadHandler = async ({
  filename,
  data,
  contentType,
}) => {
  if (!filename) {
    return undefined
  }

  const s3 = new S3Client({
    credentials,
    region: AWS_STORAGE_REGION,
  })

  /* Creates a "Transform" stream (writable) */
  const pass = new PassThrough()

  /* Pass AsyncIterable data to the created stream  */
  await writeAsyncIterableToWritable(data, pass)

  /* Convert the stream to a buffer */
  const buffer = await streamToBuffer(pass)

  /* Generate an UUID to identify the object on AWS */
  const uuid = faker.datatype.uuid()

  const params: PutObjectCommandInput = {
    Bucket: bucket,
    Key: uuid,
    Body: buffer,
    ContentType: contentType,
    ACL: 'public-read',
  }

  await s3.send(new PutObjectCommand(params))

  return uuid
}

export const uploadHandler: UploadHandler = composeUploadHandlers(
  s3UploadHandler,
  createMemoryUploadHandler()
)

export const getS3ObjectUrl = (key: string) => {
  return `https://${bucket}.s3.amazonaws.com/${key}`
}

export const deleteS3Object = async (key: string) => {
  const s3 = new S3Client({
    credentials,
    region: AWS_STORAGE_REGION,
  })

  const params = {
    Bucket: bucket,
    Key: key,
  }

  await s3.send(new DeleteObjectCommand(params))
}
