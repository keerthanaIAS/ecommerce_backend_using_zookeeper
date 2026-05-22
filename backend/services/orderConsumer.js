const { consumer } = require('../config/kafka');
const orders = require('../data/orders');

async function startOrderConsumer() {
  try {
    await consumer.connect();
    console.log('Order consumer connected');
    
    await consumer.subscribe({ 
      topic: 'payment-success', 
      fromBeginning: false  // Don't replay old messages
    });
    
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const data = JSON.parse(message.value.toString());
        console.log(`Payment succeeded for order ${data.orderId}`);
        
        // Update order status
        const order = orders.find(o => o.id == data.orderId);
        if (order) {
          order.paymentStatus = 'completed';
          order.orderStatus = 'confirmed';
          console.log(`Order ${data.orderId} updated to confirmed`);
        }
        
        // Here you can add:
        // - Send email notification
        // - Update inventory
        // - Trigger shipping
      },
    });
    
    console.log('Order consumer is running and waiting for messages');
  } catch (error) {
    console.error('Failed to start consumer:', error.message);
    throw error;
  }
}

module.exports = startOrderConsumer;