import { PassThrough } from 'stream'

// import AWS from 'aws-sdk'
import type { UploadHandler } from '@remix-run/node'
import { writeAsyncIterableToWritable } from '@remix-run/node'

import { defaultProvider } from '@aws-sdk/credential-provider-node'

import type {
  PutObjectRequest,
  PutObjectCommandInput,
} from '@aws-sdk/client-s3'

import { PutObjectCommand } from '@aws-sdk/client-s3'
import { S3 } from '@aws-sdk/client-s3'

const credentials = defaultProvider()
const { AWS_STORAGE_REGION, AWS_S3_BUCKET } = process.env

if (!(Boolean(credentials) && AWS_STORAGE_REGION && AWS_S3_BUCKET)) {
  throw new Error(`AWS Storage Service is missing required configuration.`)
}

const uploadStream = ({ Key }: Pick<PutObjectRequest, 'Key'>) => {
  const s3 = new S3({
    credentials,
    region: AWS_STORAGE_REGION,
  })

  const pass = new PassThrough()

  const params: PutObjectCommandInput = {
    Bucket: AWS_S3_BUCKET,
    Key,
    Body: pass,
  }
  // const params: PutObjectCommandInput = {
  //   Bucket: AWS_S3_BUCKET,
  //   Key,
  //   Body: pass,
  // }

  return {
    writeStream: pass,
    promise: s3.send(new PutObjectCommand(params)),
  }
}

export async function uploadStreamToS3(data: any, filename: string) {
  const stream = uploadStream({
    Key: filename, // Todo: this should be the ImageID.
  })
  await writeAsyncIterableToWritable(data, stream.writeStream)
  const file = await stream.promise

  console.log({ file })

  return file.toString()
}

export const s3UploadHandler: UploadHandler = async ({
  name,
  filename,
  data,
}) => {
  if (name !== 'img') {
    return undefined
  }
  const uploadedFileLocation = await uploadStreamToS3(data, filename!)
  return uploadedFileLocation
}
