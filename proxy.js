export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-apisports-key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { path, ...params } = req.query;
  if (!path) return res.status(400).json({ error: 'Missing path' });

  const qs = new URLSearchParams(params).toString();
  const url = `https://v3.football.api-sports.io/${path}${qs ? '?' + qs : ''}`;

  try {
    const apiRes = await fetch(url, {
      headers: {
        'x-apisports-key': process.env.API_KEY || req.headers['x-apisports-key'] || '',
      },
    });

    const remaining = apiRes.headers.get('x-ratelimit-requests-remaining');
    if (remaining) res.setHeader('x-ratelimit-requests-remaining', remaining);

    const data = await apiRes.json();
    return res.status(apiRes.status).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
