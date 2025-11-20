const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');

const app = express();
const PORT = 3000;

// Замените на ваш токен бота
const BOT_TOKEN = '8550785215:AAEq8L_OtNbRC55EMmYecbYr2Cx-etWx81o';
const CHAT_ID = '-1003125114407';

app.use(bodyParser.json());

app.post('/order', async (req, res) => {
  try {
    const order = req.body;

    if (!order.items || order.items.length === 0) return res.status(400).send('Пустой заказ');

    let message = `📦 *Новый заказ от ${order.user}*\n\n`;
    order.items.forEach(item => {
      message += `• ${item.name} — ${item.count} × ${item.price} руб/${item.unit} = ${(item.count*item.price).toFixed(2)} руб\n`;
    });
    message += `\n*Итого:* ${order.total.toFixed(2)} руб`;

    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
      })
    });

    res.status(200).send('Заказ отправлен!');
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка сервера');
  }
});

app.listen(PORT, () => console.log(`Bot server запущен на http://localhost:${PORT}`));