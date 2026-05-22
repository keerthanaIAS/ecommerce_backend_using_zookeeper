const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'ecommerce',
  brokers: ['localhost:9092'],
  connectionTimeout: 30000,
  requestTimeout: 25000,
   retry: {
    initialRetryTime: 100,
    retries: 5
  }
});

const producer = kafka.producer({
  allowAutoTopicCreation: true
});

const consumer = kafka.consumer({ 
  groupId: 'order-group',
  sessionTimeout: 30000,
  heartbeatInterval: 3000
});

const admin = kafka.admin();

async function ensureTopics() {
  await admin.connect();
  
  const topics = await admin.listTopics();
  const requiredTopics = ['order-created', 'payment-success', 'payment-failed'];
  
  for (const topic of requiredTopics) {
    if (!topics.includes(topic)) {
      await admin.createTopics({
        topics: [{
          topic: topic,
          numPartitions: 3,
          replicationFactor: 1
        }]
      });
      console.log(`Created topic: ${topic} with 3 partitions`);
    }
  }
  
  await admin.disconnect();
}

module.exports = { kafka, producer, consumer, ensureTopics };