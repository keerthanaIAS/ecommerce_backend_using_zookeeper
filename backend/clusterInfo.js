const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'health-check',
   brokers: [
    "localhost:9092",
    "localhost:9093",
    "localhost:9094"
  ]
});

async function showTopicMetadata() {
    const admin = kafka.admin();

    await admin.connect();

    const metadata = await admin.fetchTopicMetadata({
        topics: ["order-created"]
    });

    metadata.topics.forEach(topic => {
        console.log("\n==============================");
        console.log("TOPIC:", topic.name);
        console.log("==============================");

        topic.partitions.forEach(partition => {
            console.log(`
Partition: ${partition.partitionId}

Leader Broker:
${partition.leader}

Replica Brokers:
${partition.replicas.join(", ")}

In Sync Replicas (ISR):
${partition.isr.join(", ")}
            `);
        });
    });

    await admin.disconnect();
}

showTopicMetadata().catch(console.error);