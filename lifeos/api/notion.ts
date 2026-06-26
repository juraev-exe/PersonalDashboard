import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, Notion-Version'
  );

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const url = req.url || '';
  // Extract the subpath after /api/notion
  // For example, if url is /api/notion/search?query=foo, we want to extract /search?query=foo
  const urlPath = url.split('?')[0];
  const queryStr = url.includes('?') ? '?' + url.split('?')[1] : '';
  
  const subpath = urlPath.replace(/^\/api\/notion/, '');

  if (!subpath || subpath === '/' || subpath === urlPath) {
    return res.status(400).json({ error: `Invalid Notion endpoint path. URL: ${url}` });
  }

  const notionUrl = `https://api.notion.com/v1${subpath}${queryStr}`;

  // Get headers from incoming request
  const notionVersion = req.headers['notion-version'] || '2022-06-28';
  const authorization = req.headers['authorization'];

  if (!authorization) {
    return res.status(400).json({ error: 'Authorization header is required' });
  }

  try {
    const fetchOptions: RequestInit = {
      method: req.method,
      headers: {
        'Authorization': authorization as string,
        'Notion-Version': notionVersion as string,
        'Content-Type': 'application/json',
      },
    };

    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      // In Vercel, req.body is already parsed if Content-Type is application/json.
      // So we must stringify it if it is an object.
      fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }

    const response = await fetch(notionUrl, fetchOptions);
    
    // Read the response content
    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      data = responseText;
    }

    // Forward the status code and data
    return res.status(response.status).json(data);
  } catch (error: any) {
    console.error('Notion proxy error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
