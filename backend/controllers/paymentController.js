const stripe = require('../config/stripe');
const { producer } = require('../config/kafka');
const orders = require('../data/orders');

exports.createPaymentIntent = async (req, res) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: req.body.amount,
      currency: 'inr',
      metadata: {
        orderId: req.body.orderId
      }
    });
    
    res.json({ 
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      const orderId = paymentIntent.metadata.orderId;
      
      // Update order status
      const order = orders.find(o => o.id == orderId);
      if (order) {
        order.paymentStatus = 'completed';
        order.orderStatus = 'confirmed';
        
        // Send payment success event to Kafka
        await producer.connect();
        await producer.send({
          topic: 'payment-success',
          messages: [{
            key: String(orderId),
            value: JSON.stringify({ orderId, paymentIntentId: paymentIntent.id })
          }]
        });
      }
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  
  res.json({ received: true });
};