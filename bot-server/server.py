from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

TELEGRAM_BOT_TOKEN = '8475752616:AAFjhMPYlx8_L6WtkVdhwkuN92Ci4Zb2Sog'    # <-- замени здесь!
TELEGRAM_GROUP_ID = '7012487703'     # <-- и здесь! Например: -123456789

@app.route("/order", methods=["POST"])
def order():
    data = request.json
    # Формируем текст заказа (можно улучшить под себя)
    order_text = f"НОВЫЙ ЗАКАЗ\n\n"
    for item in data.get("items", []):
        order_text += f"{item['name']}: {item['count']} шт по {item['price']} руб/{item['unit']}\n"
    order_text += f"\nСумма заказа: {data.get('total', 0)} руб"

    # Отправляем сообщение в Telegram
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": TELEGRAM_GROUP_ID,
        "text": order_text
    }
    resp = requests.post(url, json=payload)
    return jsonify({"ok": True, "tg_resp": resp.json()})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)