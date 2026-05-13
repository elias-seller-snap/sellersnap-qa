const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 3001;
const INTERCOM_BASE = 'https://api.intercom.io';
const TOKEN = 'process.env.INTERCOM_TOKEN';

app.use(cors());
app.use(express.json());

app.all('/{*path}', async (req, res) => {
  const targetUrl = `${INTERCOM_BASE}${req.path}${req.url.includes('?') ? '?' + req.url.split('?')[1] : ''}`;

  const headers = {
    'Authorization': `Bearer ${TOKEN}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(502).json({ error: 'Proxy error', message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Intercom proxy running on http://localhost:${PORT}`);
});
