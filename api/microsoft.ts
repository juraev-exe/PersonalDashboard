import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const url = req.url || '';
  // Extract the subpath after /api/microsoft
  const urlPath = url.split('?')[0];
  const queryStr = url.includes('?') ? '?' + url.split('?')[1] : '';
  
  const subpath = urlPath.replace(/^\/api\/microsoft/, '');

  if (!subpath || subpath === '/' || subpath === urlPath) {
    return res.status(400).json({ error: `Invalid Microsoft Graph endpoint path. URL: ${url}` });
  }

  const msGraphUrl = `https://graph.microsoft.com/v1.0${subpath}${queryStr}`;
  const authorization = req.headers['authorization'];

  if (!authorization) {
    return res.status(400).json({ error: 'Authorization header is required' });
  }

  try {
    const fetchOptions: RequestInit = {
      method: req.method,
      headers: {
        'Authorization': authorization as string,
        'Content-Type': 'application/json',
      },
    };

    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }

    const response = await fetch(msGraphUrl, fetchOptions);
    
    // Read the response content
    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      data = responseText;
    }

    return res.status(response.status).json(data);
  } catch (error: any) {
    console.error('Microsoft Graph proxy error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
