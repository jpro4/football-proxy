const https = require('https');

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Auth-Token');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { path, ...params } = req.query;
  if (!path) return res.status(400).json({ error: 'Missing path' });

  const qs = new URLSearchParams(params).toString();
  const fdKey = process.env.FD_KEY || '';

  const options = {
    hostname: 'api.football-data.org',
    path: '/v4/' + path + (qs ? '?' + qs : ''),
    method: 'GET',
    headers: { 'X-Auth-Token': fdKey }
  };

  const proxyReq = https.request(options, (proxyRes) => {
    res.status(proxyRes.statusCode);
    let data = '';
    proxyRes.on('data', c => { data += c; });
    proxyRes.on('end', () => {
      try { res.json(JSON.parse(data)); }
      catch(e) { res.send(data); }
    });
  });
  proxyReq.on('error', e => res.status(500).json({ error: e.message }));
  proxyReq.end();
};
