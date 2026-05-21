// api/iqair.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // On récupère les identifiants envoyés par Pinia
  const { userId, deviceId, token } = req.query;

  if (!userId || !deviceId || !token) {
    return res.status(400).json({ error: 'Identifiants IQAir manquants dans la requête' });
  }

  const targetUrl = `https://website-api.airvisual.com/v2/users/${userId}/devices/${deviceId}`;

  try {
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

    // Autoriser ton domaine GitHub Pages à lire la réponse
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    
    return res.status(200).json(response.data);
  } catch (error: any) {
    console.error('IQAir Proxy Error:', error.response?.data || error.message);
    return res.status(error.response?.status || 500).json(
      error.response?.data || { message: 'Erreur de communication avec IQAir' }
    );
  }
}