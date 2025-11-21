const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
const PORT = 3000;

// ----------------------------
// Настройки
// ----------------------------
const BOT_TOKEN = '8550785215:AAEq8L_OtNbRC55EMmYecbYr2Cx-etWx81o';
const CHAT_ID = '-1003125114407';
const MINIAPP_URL = 'https://86d5cb76-8efc-4fcd-90b3-42a427413ab2-00-qqvuqt37ixb2.kirk.replit.dev/';

// ----------------------------
// Глобальный счётчик заказов
// ----------------------------
let orderCounter = 1;

function getOrderNumber() {
  return "#" + String(orderCounter++).padStart(3, "0");
}

app.use(bodyParser.json());

// ----------------------------
// Express: получение заказа
// ----------------------------
app.post('/order', async (req, res) => {
  try {
    const order = req.body;

    if (!order.items || order.items.length === 0) {
      return res.status(400).send('Пустой заказ');
    }

    // -------------------------
    // Формируем номер заказа
    // -------------------------
    const orderNumber = getOrderNumber();

    // -------------------------
    // Формируем имя отправителя
    // -------------------------
    let sender = "Гость";
    if (order.user) {
      if (order.user.username) sender = "@" + order.user.username;
      else if (order.user.first_name || order.user.last_name)
        sender = `${order.user.first_name || ''} ${order.user.last_name || ''}`.trim();
      else if (order.user.id) sender = `ID: ${order.user.id}`;
    }

    // -------------------------
    // Сообщение
    // -------------------------
    let message = `🧾 *Заказ ${orderNumber}*\n`;
    message += `👤 Отправитель: ${sender}\n\n`;
    message += `📦 *Состав заказа:*\n`;

    order.items.forEach(it => {
      message += `• ${it.name} — ${it.count} × ${it.price} руб/${it.unit} = ${(it.count * it.price).toFixed(2)} руб\n`;
    });

    message += `\n💰 *Итого:* ${order.total.toFixed(2)} руб\n`;

    // Если MiniApp отправил доп. данные
    if (order.details) {
      message += `\n📞 Телефон: ${order.details.phone || '–'}`;
      message += `\n👤 Имя: ${order.details.first_name || '–'}`;
      message += `\n👤 Фамилия: ${order.details.last_name || '–'}`;
      message += `\n📅 Дата получения: ${order.details.date || '–'}`;
      message += `\n⏰ Время: ${order.details.time || '–'}`;
    }

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

// ----------------------------
// Telegram-бот: приветствие
// ----------------------------
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  const username =
    msg.from.username
      ? '@' + msg.from.username
      : [msg.from.first_name, msg.from.last_name].filter(Boolean).join(' ') || 'Гость';

  const message = `
Здравствуйте, ${username}!  
Вас приветствует Mini BBQ/Гриль. 🍖🔥

Чтобы сделать заказ — нажмите кнопку ниже и откройте MiniApp:
`;

  bot.sendMessage(chatId, message, {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Открыть MiniApp', url: MINIAPP_URL }]
      ]
    }
  });
});

// ----------------------------
// Запуск сервера
// ----------------------------
app.listen(PORT, () =>
  console.log(`Bot server запущен на http://localhost:${PORT}`)
);