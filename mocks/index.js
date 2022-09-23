const { rest } = require('msw')
const { setupServer } = require('msw/node')

const server = setupServer()
// rest.get(
//   'https://api.zapsign.com.br/api/v1/models/create-doc',
//   (req, res, ctx) => {
//     console.log({ reqMSW: req })

//     return res(
//       ctx.json({
//         signers: [
//           {
//             token: 'signerToken1234',
//           },
//         ],
//         token: 'externalToken123123',
//       })
//     )
//   }
// )

server.listen({ onUnhandledRequest: 'bypass' })
console.info('🔶 Mock server running')

process.once('SIGINT', () => server.close())
process.once('SIGTERM', () => server.close())
