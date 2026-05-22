const { consumer } = require('../config/kafka');

async function startPaymentConsumer() {
  await consumer.connect();
  console.log('Payment consumer connected with SASL_PLAINTEXT');
  
  await consumer.subscribe({ 
    topic: 'payment-success', 
    fromBeginning: false 
  });
  
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const data = JSON.parse(message.value.toString());
      console.log(`Payment succeeded for order ${data.orderId}`);
      console.log(`   Partition: ${partition}`);
      
      // Update order status in database
      // Send email notification
      // Trigger shipping process
    },
  });
  
  console.log('Payment consumer is running');
}

module.exports = startPaymentConsumer;