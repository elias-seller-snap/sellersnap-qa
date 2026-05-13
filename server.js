const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

const app = express();
const PORT = process.env.PORT || 3001;
const TOKEN = process.env.INTERCOM_TOKEN;
const INTERCOM_BASE = 'https://api.intercom.io';

app.use(cors({ origin: '*' }));
app.use(express.json());

app.all('/*splat', async (req, res) => {
  const targetUrl = `${INTERCOM_BASE}${req.path}${req.url.includes('?') ? '?' + req.url.split('?')[1] : ''}`;
  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: ['GET','HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(502).json({ error: 'Proxy error', message: err.message });
  }
});

app.listen(PORT, () => console.log(`Intercom proxy running on http://localhost:${PORT}`));
