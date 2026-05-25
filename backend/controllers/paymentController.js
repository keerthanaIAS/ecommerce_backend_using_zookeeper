const { producer } = require('../config/kafka');
const stripe = require('../config/stripe');

exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount, orderId } = req.body;

    if (!amount || !orderId) {
      return res.status(400).json({
        error: "amount and orderId required"
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'inr',
      metadata: {
        orderId: String(orderId)
      }
    });

    console.log("PaymentIntent created:", paymentIntent.id);

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    console.error("PaymentIntent error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.handleWebhook = async (req, res) => {
  const event = JSON.parse(req.body.toString());

  if (event.type === 'payment_intent.succeeded') {
    const payment = event.data.object;

    const orderId = payment.metadata.orderId;

    console.log("Payment success:", orderId);

    await producer.send({
      topic: 'payment-success',
      messages: [{
        key: String(orderId),
        value: JSON.stringify({
          orderId,
          paymentIntentId: payment.id
        })
      }]
    });

    console.log("Kafka payment-success sent");
  }

  res.json({ received: true });
};