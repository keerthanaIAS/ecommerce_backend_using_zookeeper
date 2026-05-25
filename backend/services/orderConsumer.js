const { orderConsumer } = require('../config/kafka');
const orders = require('../data/orders');

async function startOrderConsumer() {
  await orderConsumer.connect();

  await orderConsumer.subscribe({
    topic: 'payment-success',
    fromBeginning: false
  });

  await orderConsumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log(`
      ------ KAFKA EVENT ------
      Topic: ${topic}
      Partition: ${partition}
      Data: ${JSON.stringify(data)}
      -------------------------
      `);
      const data = JSON.parse(message.value.toString());

      const order = orders.find(o => o.id == data.orderId);

      if (order) {
        order.paymentStatus = 'completed';
        order.orderStatus = 'confirmed';

        console.log("ORDER CONFIRMED:", order.id);
      }
    }
  });
}

module.exports = startOrderConsumer;