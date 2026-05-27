const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const { producer, kafka } = require('./config/kafka');
const startOrderConsumer = require('./services/orderConsumer');
const startPaymentConsumer = require('./services/paymentConsumer');

const orderRoutes = require('./routes/orderRoutes');
const productRoutes = require('./routes/productRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/payments', paymentRoutes);

async function start() {
  await producer.connect();

  await startPaymentConsumer();
  await startOrderConsumer();

  console.log("Kafka system fully started");
}

app.listen(4000, async () => {
  console.log("Server running on 4000");
  await start();
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing connections...');
  await producer.disconnect();
  process.exit(0);
});