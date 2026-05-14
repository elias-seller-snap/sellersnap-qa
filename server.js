const express = require('express');
const cors = require('cors');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
const app = express();
const PORT = process.env.PORT || 3001;
const TOKEN = process.env.INTERCOM_TOKEN;
const ANTHROPIC_KEY = process.env.ANTHROPIC_KEY;
const INTERCOM_BASE = 'https://api.intercom.io';
app.use(cors());
app.use(express.json());
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.use('/api', async (req, res) => {
  try {
    const r = await fetch(INTERCOM_BASE + req.url, { method: req.method, headers: { 'Authorization': 'Bearer ' + TOKEN, 'Accept': 'application/json', 'Content-Type': 'application/json' }, body: req.method === 'GET' ? undefined : JSON.stringify(req.body) });
    res.status(r.status).json(await r.json());
  } catch(e) { res.status(502).json({error: e.message}); }
});
app.post('/grade', async (req, res) => {
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': ANTHROPIC_KEY, 'anthropic-version': '2023-06-01' }, body: JSON.stringify(req.body) });
    res.status(r.status).json(await r.json());
  } catch(e) { res.status(502).json({error: e.message}); }
});

app.get('/calibrate', async (req, res) => {
  const ids = ['215470342050108','215472207757651','215470643890479','215471707096738','215470070069497','215470793103748','215473269093681','215471861181881','215468912618043','215474091405265','215474111496894','215472178091988','215474033199568','215470723135236','215469091174594','215473507977193'];
  const grades = {'215470342050108':{agent:'Adam',total:12},'215472207757651':{agent:'Adam',total:13},'215470643890479':{agent:'Keirth',total:0},'215471707096738':{agent:'Keirth',total:1},'215470070069497':{agent:'PJ',total:7},'215470793103748':{agent:'PJ',total:10},'215473269093681':{agent:'Gab',total:10},'215471861181881':{agent:'Gab',total:4},'215468912618043':{agent:'Adam',total:24},'215474091405265':{agent:'Adam',total:24},'215474111496894':{agent:'PJ',total:24},'215472178091988':{agent:'PJ',total:23},'215474033199568':{agent:'Keirth',total:24},'215470723135236':{agent:'Keirth',total:19},'215469091174594':{agent:'Gab',total:24},'215473507977193':{agent:'Gab',total:24}};
  const results = [];
  for (const id of ids) {
    try {
      const r = await fetch(INTERCOM_BASE + '/conversations/' + id, { headers: { 'Authorization': 'Bearer ' + TOKEN, 'Accept': 'application/json' } });
      const d = await r.json();
      const parts = [];
      if (d.source && d.source.body) parts.push('USER: ' + d.source.body.replace(/<[^>]+>/g,'').trim());
      for (const p of (d.conversation_parts && d.conversation_parts.conversation_parts) || []) {
        if (!p.body) continue;
        const author = (p.author && p.author.type === 'admin') ? 'AGENT' : 'USER';
        parts.push(author + ': ' + p.body.replace(/<[^>]+>/g,'').trim());
      }
      results.push({ id, grade: grades[id], subject: d.source && d.source.subject, transcript: parts.join('\n') });
    } catch(e) {
      results.push({ id, grade: grades[id], error: e.message });
    }
  }
  res.json(results);
});


app.get('/calibrate2', async (req, res) => {
  const ids = ['215469013281975', '215469774352650', '215470013195953', '215469945133962', '215470271944236', '215470374964437', '215470547572553', '215470693062125', '215470646606106', '215470900245391', '215471631118048', '215472228011469', '215472279731558', '215472689249461', '215474014750459', '215474045260236', '215468850323365', '215468919145369', '215470020932625', '215470015882102'];
  const grades = {'215469013281975': {'agent': 'Gab', 'total': 18, 'tone': 1, 'accuracy': 5, 'clarity': 3, 'cause': 2, 'investigation': 1, 'relevance': 5, 'teamwork': 0}, '215469774352650': {'agent': 'Keirth', 'total': 19, 'tone': 0, 'accuracy': 4, 'clarity': 1, 'cause': 4, 'investigation': 3, 'relevance': 5, 'teamwork': 1}, '215470013195953': {'agent': 'Adam', 'total': 20, 'tone': 0, 'accuracy': 5, 'clarity': 1, 'cause': 4, 'investigation': 3, 'relevance': 5, 'teamwork': 1}, '215469945133962': {'agent': 'PJ', 'total': 19, 'tone': 0, 'accuracy': 3, 'clarity': 1, 'cause': 5, 'investigation': 3, 'relevance': 5, 'teamwork': 1}, '215470271944236': {'agent': 'PJ', 'total': 19, 'tone': 0, 'accuracy': 4, 'clarity': 1, 'cause': 4, 'investigation': 3, 'relevance': 5, 'teamwork': 1}, '215470374964437': {'agent': 'PJ', 'total': 15, 'tone': 1, 'accuracy': 4, 'clarity': 1, 'cause': 2, 'investigation': 1, 'relevance': 4, 'teamwork': 1}, '215470547572553': {'agent': 'PJ', 'total': 13, 'tone': 0, 'accuracy': 4, 'clarity': 1, 'cause': 2, 'investigation': 1, 'relevance': 3, 'teamwork': 1}, '215470693062125': {'agent': 'Adam', 'total': 17, 'tone': 1, 'accuracy': 5, 'clarity': 1, 'cause': 2, 'investigation': 3, 'relevance': 3, 'teamwork': 1}, '215470646606106': {'agent': 'Keirth', 'total': 15, 'tone': 0, 'accuracy': 4, 'clarity': 1, 'cause': 2, 'investigation': 2, 'relevance': 4, 'teamwork': 1}, '215470900245391': {'agent': 'Gab', 'total': 20, 'tone': 0, 'accuracy': 5, 'clarity': 0, 'cause': 5, 'investigation': 3, 'relevance': 5, 'teamwork': 1}, '215471631118048': {'agent': 'Keirth', 'total': 13, 'tone': 0, 'accuracy': 4, 'clarity': 1, 'cause': 2, 'investigation': 1, 'relevance': 3, 'teamwork': 1}, '215472228011469': {'agent': 'Gab', 'total': 17, 'tone': 1, 'accuracy': 5, 'clarity': 1, 'cause': 2, 'investigation': 2, 'relevance': 4, 'teamwork': 1}, '215472279731558': {'agent': 'PJ', 'total': 20, 'tone': 0, 'accuracy': 5, 'clarity': 1, 'cause': 4, 'investigation': 3, 'relevance': 5, 'teamwork': 1}, '215472689249461': {'agent': 'Keirth', 'total': 16, 'tone': 1, 'accuracy': 4, 'clarity': 3, 'cause': 2, 'investigation': 1, 'relevance': 3, 'teamwork': 1}, '215474014750459': {'agent': 'Gab', 'total': 16, 'tone': 0, 'accuracy': 5, 'clarity': 1, 'cause': 2, 'investigation': 3, 'relevance': 4, 'teamwork': 1}, '215474045260236': {'agent': 'Adam', 'total': 16, 'tone': 1, 'accuracy': 5, 'clarity': 3, 'cause': 2, 'investigation': 1, 'relevance': 2, 'teamwork': 1}, '215468850323365': {'agent': 'Adam', 'total': 19, 'tone': 1, 'accuracy': 4, 'clarity': 1, 'cause': 4, 'investigation': 3, 'relevance': 4, 'teamwork': 1}, '215468919145369': {'agent': 'Adam', 'total': 18, 'tone': 1, 'accuracy': 5, 'clarity': 3, 'cause': 2, 'investigation': 3, 'relevance': 2, 'teamwork': 1}, '215470020932625': {'agent': 'Gab', 'total': 20, 'tone': 0, 'accuracy': 3, 'clarity': 2, 'cause': 5, 'investigation': 3, 'relevance': 5, 'teamwork': 1}, '215470015882102': {'agent': 'Keirth', 'total': 13, 'tone': 0, 'accuracy': 4, 'clarity': 1, 'cause': 3, 'investigation': 1, 'relevance': 2, 'teamwork': 1}};
  const results = [];
  for (const id of ids) {
    try {
      const r = await fetch(INTERCOM_BASE + '/conversations/' + id, { headers: { 'Authorization': 'Bearer ' + TOKEN, 'Accept': 'application/json' } });
      const d = await r.json();
      const parts = [];
      if (d.source && d.source.body) parts.push('USER: ' + d.source.body.replace(/<[^>]+>/g,'').trim());
      for (const p of (d.conversation_parts && d.conversation_parts.conversation_parts) || []) {
        if (!p.body) continue;
        const author = (p.author && p.author.type === 'admin') ? 'AGENT' : 'USER';
        parts.push(author + ': ' + p.body.replace(/<[^>]+>/g,'').trim());
      }
      results.push({ id, grade: grades[id], subject: d.source && d.source.subject, transcript: parts.join('\n') });
    } catch(e) {
      results.push({ id, grade: grades[id], error: e.message });
    }
  }
  res.json(results);
});


app.post('/search', async (req, res) => {
  try {
    const { adminId, fromTs, toTs } = req.body;
    const searchBody = {
      query: {
        operator: 'AND',
        value: [
          { field: 'admin_assignee_id', operator: '=', value: parseInt(adminId) },
          { field: 'updated_at', operator: '>', value: parseInt(fromTs) },
          { field: 'updated_at', operator: '<', value: parseInt(toTs) }
        ]
      },
      pagination: { per_page: 150 }
    };
    const r = await fetch(INTERCOM_BASE + '/conversations/search', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + TOKEN, 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(searchBody)
    });
    const data = await r.json();
    console.log("SEARCH RESPONSE:", r.status, JSON.stringify(data).slice(0,500));
    res.status(r.status).json(data);
  } catch(e) { res.status(502).json({error: e.message}); }
});

app.listen(PORT, () => console.log('Running on port ' + PORT));
 
