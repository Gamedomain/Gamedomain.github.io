const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
require('dotenv').config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname)));

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

app.post('/send-order', async (req, res) => {
  const { service, price, link, phone, count } = req.body;

  if (!service || !price || !link || !phone || !count) {
    return res.status(400).json({ ok: false, error: 'Missing order fields' });
  }

  if (!BOT_TOKEN || !CHAT_ID) {
    return res.status(500).json({ ok: false, error: 'Bot token or chat ID not configured' });
  }

  const text = [
    '<b>Шинэ захиалга ирлээ</b>',
    `<b>Үйлчилгээ:</b> ${escapeHtml(service)}`,
    `<b>Тоо ширхэг:</b> ${escapeHtml(count)} ширхэг`,
    `<b>Нэгж үнэ:</b> ${escapeHtml(price)}₮`,
    `<b>Линк:</b> ${escapeHtml(link)}`,
    `<b>Утас:</b> ${escapeHtml(phone)}`
  ].join('\n');

  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text,
        parse_mode: 'HTML'
      })
    });

    const result = await response.json();
    if (!result.ok) {
      return res.status(500).json({ ok: false, error: 'Telegram API error', detail: result });
    }

    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ ok: false, error: 'Send failed', detail: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

