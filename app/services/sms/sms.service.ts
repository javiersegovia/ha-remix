import type { PublishCommandInput } from '@aws-sdk/client-sns'
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns'
import { defaultProvider } from '@aws-sdk/credential-provider-node'

const REGION = 'us-east-1'
const credentials = defaultProvider()

const snsClient = new SNSClient({ region: REGION, credentials })

export const sendSMS = async (smsParams: PublishCommandInput) => {
  // todo: validate that smsParams.Message is a valid string
  // todo: validate that smsParams.PhoneNumber is a valid number using the following regex:
  // ^\+[1-9]\d{1,14}$

  try {
    const data = await snsClient.send(new PublishCommand(smsParams))
    // console.log('Sending SMS')
    // console.log({ data })
    return data
  } catch (err) {
    console.error(err)
    // todo: add error logger here
  }
}
