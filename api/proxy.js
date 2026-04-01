const https = require('https');

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-apisports-key');
  if (req.method === 'OPTIONS') return res.status(200).end();
  const { path, ...params } = req.query;
  if (!path) return res.status(400).json({ error: 'Missing path' });
  const qs = new URLSearchParams(params).toString();
  const apiKey = process.env.API_KEY || req.headers['x-apisports-key'] || '';
  const options = {
    hostname: 'v3.football.api-sports.io',
    path: '/' + path + (qs ? '?' + qs : ''),
    method: 'GET',
    headers: { 'x-apisports-key': apiKey }
  };
  const proxyReq = https.request(options, (proxyRes) => {
    const rem = proxyRes.headers['x-ratelimit-requests-remaining'];
    if (rem) res.setHeader('x-ratelimit-requests-remaining', rem);
    res.status(proxyRes.statusCode);
    let data = '';
    proxyRes.on('data', c => { data += c; });
    proxyRes.on('end', () => { try { res.json(JSON.parse(data)); } catch(e) { res.send(data); } });
  });
  proxyReq.on('error', e => res.status(500).json({ error: e.message }));
  proxyReq.end();
};
