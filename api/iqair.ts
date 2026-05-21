import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. AJOUT DES HEADERS CORS AVANT TOUTE LOGIQUE
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*'); // Autorise tout le monde (dont ton github.io)
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-login-token');

  // 2. GÉRER LA REQUÊTE "PREFLIGHT" (Le navigateur envoie OPTIONS avant le GET)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { userId, deviceId, token } = req.query;

  if (!userId || !deviceId || !token) {
    return res.status(400).json({ error: 'Missing credentials' });
  }

  try {
    const targetUrl = `https://website-api.airvisual.com/v2/users/${userId}/devices/${deviceId}`;
    const response = await axios.get(targetUrl, {
      params: {
        'units.system': 'metric',
        'AQI': 'US',
        'language': 'en',
      },
      headers: {
        'x-login-token': token as string,
        'accept': 'application/json',
      },
    });

    // Envoyer les données reçues d'IQAir
    return res.status(200).json(response.data);
  } catch (error: any) {
    console.error('Proxy Error:', error.message);
    return res.status(error.response?.status || 500).json({ 
        message: 'Erreur IQAir via Proxy', 
        details: error.message 
    });
  }
}