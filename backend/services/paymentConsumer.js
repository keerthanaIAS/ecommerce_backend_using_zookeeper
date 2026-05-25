const { paymentConsumer, producer } = require('../config/kafka');
const stripe = require('../config/stripe');

async function startPaymentConsumer() {
  await paymentConsumer.connect();

  await paymentConsumer.subscribe({
    topic: 'order-created',
    fromBeginning: false
  });

  await paymentConsumer.run({
    eachMessage: async ({ topic, partition, message }) => {
        console.log(`
      ------------------------
      NEW KAFKA MESSAGE
      Topic: ${topic}
      Partition: ${partition}
      Key: ${message.key.toString()}
      Value: ${message.value.toString()}
      ------------------------
      `);
      const data = JSON.parse(message.value.toString());
      console.log(`Payment succeeded for order ${data.orderId}`);
      console.log(`   Partition: ${partition}`);
      
      const order = JSON.parse(message.value.toString());

      console.log("Payment service received order:", order.id);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: order.total,
        currency: 'inr',
        metadata: { orderId: order.id }
      });

      console.log("Stripe payment intent created:", paymentIntent.id);
    }
  });
}

module.exports = startPaymentConsumer;