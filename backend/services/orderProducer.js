const { producer } = require('../config/kafka');

async function sendOrderCreated(order) {
  await producer.send({
    topic: 'order-created',
    messages: [
      {
        key: String(order.id),
        value: JSON.stringify(order)
      }
    ]
  });

  console.log("order-created sent:", order.id);
}

module.exports = { sendOrderCreated };