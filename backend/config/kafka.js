const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'ecommerce',
  brokers: ['localhost:9092'],
});

const producer = kafka.producer();
const orderConsumer = kafka.consumer({ groupId: 'order-group' });
const paymentConsumer = kafka.consumer({ groupId: 'payment-group' });

async function ensureTopics(admin) {
  const topics = await admin.listTopics();

  const required = ['order-created', 'payment-success'];

  for (let topic of required) {
    if (!topics.includes(topic)) {
      await admin.createTopics({
        topics: [{ topic, numPartitions: 3, replicationFactor: 1 }]
      });
    }
  }
}

module.exports = { kafka, producer, orderConsumer, paymentConsumer, ensureTopics };