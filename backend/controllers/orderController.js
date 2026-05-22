const orders = require('../data/orders');
const { producer } = require('../config/kafka');

exports.createOrder = async (req, res) => {
  const order = {
    id: Date.now(),
    products: req.body.products,
    shipping: req.body.shipping,
    total: req.body.total,
    paymentStatus: 'pending',
    orderStatus: 'created',
    createdAt: new Date()
  };
  
  orders.push(order);
  
  // Send event to Kafka
  await producer.connect();
  await producer.send({
    topic: 'order-created',
    messages: [{
      key: String(order.id),
      value: JSON.stringify(order)
    }]
  });
  
  res.json(order);
};

exports.getOrders = (req, res) => {
  res.json(orders);
};

exports.updateOrderStatus = (req, res) => {
  const order = orders.find(o => o.id == req.params.id);
  if (order) {
    order.orderStatus = req.body.status;
    res.json(order);
  } else {
    res.status(404).json({ error: 'Order not found' });
  }
};