import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const targetPath = req.url?.replace('/api/iqair', '') ?? ''
  const url = `https://website-api.airvisual.com/v1${targetPath}`

  const response = await fetch(url, {
    method: req.method,
    headers: { 'Content-Type': 'application/json' },
  })

  const data = await response.json()
  res.status(response.status).json(data)
}