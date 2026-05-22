const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { producer, ensureTopics } = require('./config/kafka');
const startOrderConsumer = require('./services/orderConsumer');

dotenv.config();

const productRoutes = require('./routes/productRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.raw({ type: 'application/json' }));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/orders', orderRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

// Start Kafka and server
async function startKafka() {
  try {
    // Ensure topics exist
    await ensureTopics();
    console.log('Kafka topics verified');
    
    // Connect producer
    await producer.connect();
    console.log('Kafka producer connected to localhost:9092');
    
    // Start consumer
    await startOrderConsumer();
    console.log('Kafka consumer started');
  } catch (error) {
    console.error('Kafka connection failed:', error.message);
    console.log('Make sure Kafka is running locally:');
    console.log('- macOS: brew services start kafka');
    console.log('- Linux: bin/kafka-server-start.sh config/server.properties');
    console.log('- Check: kafka-topics --list --bootstrap-server localhost:9092');
  }
}

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  await startKafka();
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing connections...');
  await producer.disconnect();
  process.exit(0);
});