const express = require('express');
const cors = require('cors');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

const app = express();
const PORT = process.env.PORT || 3001;
const TOKEN = process.env.INTERCOM_TOKEN;
const INTERCOM_BASE = 'https://api.intercom.io';

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.use('/api', async (req, res) => {
  try {
    const targetUrl = INTERCOM_BASE + req.url;
    const isGet = req.method === 'GET' || req.method === 'HEAD';
    const r = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Authorization': 'Bearer ' + TOKEN,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: isGet ? undefined : JSON.stringify(req.body)
    });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});


app.post('/grade', async (req, res) => {
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify(req.body)
    });
    res.status(r.status).json(await r.json());
  } catch(e) { res.status(502).json({error: e.message}); }
});

app.post('/search-conversations', async (req, res) => {
  try {
    const r = await fetch('https://api.intercom.io/conversations/search', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + TOKEN, 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    res.status(r.status).json(await r.json());
  } catch(e) { res.status(502).json({error: e.message}); }
});
app.listen(PORT, () => console.log('Running on port ' + PORT));
