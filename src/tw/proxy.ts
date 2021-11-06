import express from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'
import { Fn } from '../@types/methods'
import { logSuccess } from '../utility/logger'

const cookie =
  'cid=1617867510; remember_optout=0; locale=en_DK; ref=start; PHPSESSID=unfe2erm3t38791jod8a3jdd409cals37dapq7gndr9uf5vk; en_auth=387d4f7396f2:19808309f280d73408c9c2924d0ea6ceaada7c5495a7b96ad21fc1201b84e2dd'

export const startTwProxy: Fn<void, void> = () => {
  const options = {
    target: 'https://www.tribalwars.net/en-dk/',
    changeOrigin: true,
    ws: true,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onProxyReq: function onProxyReq(proxyReq: any) {
      proxyReq.setHeader('cookie', cookie)
    },
  }

  const exampleProxy = createProxyMiddleware(options)

  const app = express()
  app.use('/', exampleProxy)
  app.listen(3001)
  logSuccess('Proxy Started', 'TW')
}
