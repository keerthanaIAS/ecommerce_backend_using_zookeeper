const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'health-check',
  brokers: ['localhost:9092']
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