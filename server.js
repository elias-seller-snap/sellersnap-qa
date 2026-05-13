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
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.all('/admins', async (req, res) => {
  try {
    const r = await fetch(INTERCOM_BASE + '/admins', { headers: { 'Authorization': 'Bearer ' + TOKEN, 'Accept': 'application/json' } });
    res.status(r.status).json(await r.json());
  } catch(e) { res.status(502).json({error: e.message}); }
});
app.all('/conversations*', async (req, res) => {
  try {
    const r = await fetch(INTERCOM_BASE + req.url, { method: req.method, headers: { 'Authorization': 'Bearer ' + TOKEN, 'Accept': 'application/json' }, body: req.method === 'GET' ? undefined : JSON.stringify(req.body) });
    res.status(r.status).json(await r.json());
  } catch(e) { res.status(502).json({error: e.message}); }
});
app.listen(PORT, () => console.log('Running on port ' + PORT));
