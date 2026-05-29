const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'health-check',
  //  brokers: [
  //   "localhost:9092",
  //   "localhost:9093",
  //   "localhost:9094"
  // ]
  brokers: ['10.55.66.132:9092'],  // ip wise check
  sasl: {
    mechanism: "plain",
    username: "app",
    password: "app-pass"
  },
  ssl: false // ssl: false means: connection is NOT encrypted, Your Kafka client talks to broker in plain text. Like normal HTTP instead of HTTPS.
});

async function checkKafka() {
  try {
    const admin = kafka.admin();
    await admin.connect();

    // Get broker info
    const brokers = await admin.describeCluster();
    console.log('Kafka is running!');
    console.log(`Controller: ${brokers.controller}`);
    console.log(`Brokers: ${brokers.brokers.map(b => b.nodeId).join(', ')}`);

    // Get topics
    const topics = await admin.listTopics();
    console.log(`   Topics: ${topics.filter(t => !t.startsWith('__')).join(', ') || 'No topics yet'}`);

    await admin.disconnect();
  } catch (error) {
    console.error('Kafka is not running:', error.message);
    console.log('\nStart Kafka with:');
    console.log('macOS: brew services start kafka');
    console.log('Linux: cd /opt/kafka && bin/kafka-server-start.sh config/server.properties');
    console.log('Verify: kafka-topics --list --bootstrap-server localhost:9092');
  }
}

checkKafka();

/**
Without SSL:

Node App
  → username/password visible on network
Kafka Broker

Anyone sniffing packets can see credentials.

With SSL:

Node App
  → encrypted TLS traffic
Kafka Broker

Credentials protected.
NOTE: for local we set false for ,
Because TLS setup is painful:
certificates
keystores
truststores
CA signing
hostname validation
Huge overhead for learning.
Simple local auth only.
 */