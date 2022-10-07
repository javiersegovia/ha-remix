const { rest } = require('msw')
const { setupServer } = require('msw/node')

// Todo: We should have a file for all handlers related to a specific domain
// e.g. Create a file named "zapsign.ts" and add the specific zapsign handlers there
// After all, import all handlers here

const handlers = [
  rest.post(
    'https://api.zapsign.com.br/api/v1/models/create-doc/',
    (req, res, ctx) => {
      return res(
        ctx.json({
          signers: [
            {
              token: 'signerToken1234',
            },
          ],
          token: 'externalToken123123',
        })
      )
    }
  ),
  rest.get(
    'https://api.zapsign.com.br/api/v1/docs/:externalToken/',
    (req, res, ctx) => {
      return res(
        ctx.json({
          status: 'signed',
        })
      )
    }
  ),
]

const server = setupServer(...handlers)

server.listen({ onUnhandledRequest: 'warn' })
console.info('🔶 Mock server running')

process.once('SIGINT', () => server.close())
process.once('SIGTERM', () => server.close())
