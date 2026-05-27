THINK OF IT LIKE THIS:
Kafka Broker = warehouse storing messages
Zookeeper = warehouse supervisor

WHAT ZOOKEEPER MANAGES
1. Broker Registration
When Kafka starts:
Kafka Broker → "Hey Zookeeper, I am alive"
Zookeeper stores:
broker id
broker address
cluster metadata
2. Leader Election
Suppose topic has:
Partition 0
Replica 1
Replica 2
One broker becomes:
LEADER
Others are followers.
Zookeeper coordinates this.
3. Topic Metadata
Stores:
topic names
partitions
replicas
ISR (in-sync replicas)
4. Cluster Health
Tracks:
dead brokers
active brokers
failover

WHAT ZOOKEEPER DOES NOT DO
People misunderstand this badly.
Zookeeper does NOT:
1.Not store your orders
2.Not store Kafka messages
3.Not store payment events
Those are inside Kafka log files.

WHY YOU SEE PARTITIONS/OFFSETS IN UI
Because Kafka UI talks to:
Kafka broker
metadata APIs
And broker itself got metadata from Zookeeper.
So indirectly:
yes Zookeeper powers those cluster details

SIMPLE VISUAL MODEL
                ZOOKEEPER
           (cluster manager)
                   ↑
                   |
        ---------------------
        |        |         |
     Broker1  Broker2  Broker3
        |
        |
     Topics
     Partitions
     Messages

WHAT IS OFFSET REALLY?
This is critical.
Offset is NOT message id.
It is:
**position inside partition log**
Example:
Partition 0:
Offset 0 → Order A
Offset 1 → Order B
Offset 2 → Order C
Consumer remembers:
"I already processed until offset 2"
That tracking is tied to consumer group.

WHAT IS REPLICA?
Replica means:
**copy of partition on another broker**
Example:
Partition 0
Leader → Broker1
Replica → Broker2
If Broker1 dies:
Broker2 becomes leader
That’s fault tolerance.

IN THIS PROJECT:
I only have:
KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
and ONE broker.

So:
* no real replication
* no failover
* no high availability

IMPORTANT MODERN TRUTH:
Kafka is removing Zookeeper dependency.

Modern Kafka:
KRaft mode
No Zookeeper needed.
Kafka brokers manage metadata themselves.

FINAL UNDERSTANDING:
Zookeeper = infrastructure brain
Kafka Broker = message storage engine
Topics = categorized logs
Partitions = scalable slices of logs
Offsets = read positions
Consumer Groups = coordinated readers

---------------------------------------------------------------
*My app talks to Kafka brokers only.*
*ZooKeeper is internal Kafka infrastructure.*
Because flow is:
Node App
   ↓
Kafka Broker
   ↓
Broker talks to ZooKeeper
   ↓
ZooKeeper manages metadata
## app never directly asks ZooKeeper:
who is leader?
which broker alive?
topic metadata?
Broker already knows because it syncs with ZooKeeper.
## Local setup (ZooKeeper mode):
You must run BOTH:
Terminal 1:
bin/zookeeper-server-start.sh config/zookeeper.properties
Terminal 2:
bin/kafka-server-start.sh config/server.properties
Then Node app:
node index.js
Why?
Because:
ZooKeeper = metadata coordinator
Kafka = message broker
Node app = producer/consumer client
All 3 needed.
## Docker setup
Same thing, just hidden in YAML.
Example:
services:
  zookeeper:
    image: confluentinc/cp-zookeeper
  kafka:
    image: confluentinc/cp-kafka
    depends_on:
      - zookeeper
Then app connects only to:
brokers:["kafka:9092"]
Still no ZooKeeper in code.
**Docker just starts infra automatically.**
## Why not connect app directly to ZooKeeper?
Because ZooKeeper does not serve Kafka messages.
It only stores metadata.
If producer tried:
send order-created to ZooKeeper
ZooKeeper would basically say:
I coordinate brokers.
I don’t store your events.
Kafka stores events.
ZooKeeper coordinates Kafka.
Your app talks to Kafka.
That layering is the architecture.
**in yml file how do i identify kraft:**
KAFKA_PROCESS_ROLES: controller,broker
That is the KRaft giveaway.
*ZooKeeper mode never has that.*
KRaft means:
Kafka brokers elect/manage metadata themselves
using Raft quorum
**in zookeeper yml file:**
KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181

## Local Kafka and Zookeeper running steps:
Start Kafka:
bin/kafka-server-start.sh config/server.properties

Start ZooKeeper:
bin/zookeeper-server-start.sh config/zookeeper.properties
Open another terminal:
bin/zookeeper-shell.sh localhost:2181
Now list znodes:
ls /
You’ll see something like:
[brokers, cluster, controller]
Check brokers:
ls /brokers/ids
Output:
[0]
Check broker metadata:
get /brokers/ids/0
Output:
{
 "host":"localhost",
 "port":9092
}
Check controller (leader broker):
get /controller
Output:
{
 "brokerid":0
}
Now create topic:
bin/kafka-topics.sh \
--create \
--topic orders \
--bootstrap-server localhost:9092 \
--partitions 2 \
--replication-factor 1
Check ZooKeeper:
ls /brokers/topics
Output:
[orders]
Messages - Produce:
bin/kafka-console-producer.sh \
--topic orders \
--bootstrap-server localhost:9092
Type:
hello
Because message lives in Kafka disk logs:
/tmp/kafka-logs/
That’s the difference:
ZooKeeper stores:
**who owns what**
**who is leader**
**which broker alive**
**topic config**
Kafka stores:
**actual messages**
**offsets**
**partitions**
**consumer progress**


Open another terminal-logs:
keerthana@192 kafka_2.13-3.9.2 % bin/zookeeper-shell.sh localhost:2181
Connecting to localhost:2181
Welcome to ZooKeeper!
JLine support is disabled
WATCHER::
WatchedEvent state:SyncConnected type:None path:null
ls /
[zookeeper] --> while run kraft got only this
ls /                                
[admin, brokers, cluster, config, consumers, controller, controller_epoch, feature, isr_change_notification, latest_producer_id_block, log_dir_event_notification, zookeeper] --> after run kafka ONLY got everything
ls /brokers/ids
[0]
get /brokers/ids/0
{"listener_security_protocol_map":{"PLAINTEXT":"PLAINTEXT"},"endpoints":["PLAINTEXT://192.168.1.21:9092"],"jmx_port":-1,"features":{},"host":"192.168.1.21","timestamp":"1779856878276","port":9092,"version":5}
get /controller
{"version":2,"brokerid":0,"timestamp":"1779856878328","kraftControllerEpoch":-1}
ls /brokers/topics
[] --> here dont run the code got empty
ls /brokers/topics
[__consumer_offsets, order-created, payment-success] --> after run got topics
get /brokers/topics/order-created
{"removing_replicas":{},"partitions":{"0":[0]},"topic_id":"gib5GbiRTyuLqmqld5r9dg","adding_replicas":{},"version":3}

*NOTE: if i start kafka without running zookeeper, kafka will fail*


## server.properties file:
# Licensed to the Apache Software Foundation (ASF) under one or more
# contributor license agreements.  See the NOTICE file distributed with
# this work for additional information regarding copyright ownership.
# The ASF licenses this file to You under the Apache License, Version 2.0
# (the "License"); you may not use this file except in compliance with
# the License.  You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

#
# This configuration file is intended for use in ZK-based mode, where Apache ZooKeeper is required.
# See kafka.server.KafkaConfig for additional details and defaults
#

############################# Server Basics #############################

# The id of the broker. This must be set to a unique integer for each broker.
broker.id=0

############################# Socket Server Settings #############################

# Kafka listens on all interfaces
listeners=SASL_PLAINTEXT://0.0.0.0:9092

# Change this IP to your actual local IP
advertised.listeners=SASL_PLAINTEXT://192.168.1.21:9092

# Security protocol mapping
listener.security.protocol.map=SASL_PLAINTEXT:SASL_PLAINTEXT

# SASL authentication
sasl.enabled.mechanisms=PLAIN
sasl.mechanism.inter.broker.protocol=PLAIN
security.inter.broker.protocol=SASL_PLAINTEXT
listener.name.sasl_plaintext.plain.sasl.jaas.config=org.apache.kafka.common.security.plain.PlainLoginModule required \
username="admin" \
password="admin-secret" \
user_admin="admin-secret" \
user_app="app-pass";

# The address the socket server listens on. If not configured, the host name will be equal to the value of
# java.net.InetAddress.getCanonicalHostName(), with PLAINTEXT listener name, and port 9092.
#   FORMAT:
#     listeners = listener_name://host_name:port
#   EXAMPLE:
#     listeners = PLAINTEXT://your.host.name:9092
#listeners=PLAINTEXT://:9092

# Listener name, hostname and port the broker will advertise to clients.
# If not set, it uses the value for "listeners".
#advertised.listeners=PLAINTEXT://your.host.name:9092

# Maps listener names to security protocols, the default is for them to be the same. See the config documentation for more details
#listener.security.protocol.map=PLAINTEXT:PLAINTEXT,SSL:SSL,SASL_PLAINTEXT:SASL_PLAINTEXT,SASL_SSL:SASL_SSL

# The number of threads that the server uses for receiving requests from the network and sending responses to the network
num.network.threads=3

# The number of threads that the server uses for processing requests, which may include disk I/O
num.io.threads=8

# The send buffer (SO_SNDBUF) used by the socket server
socket.send.buffer.bytes=102400

# The receive buffer (SO_RCVBUF) used by the socket server
socket.receive.buffer.bytes=102400

# The maximum size of a request that the socket server will accept (protection against OOM)
socket.request.max.bytes=104857600


############################# Log Basics #############################

# A comma separated list of directories under which to store log files
log.dirs=/tmp/kafka-logs

# The default number of log partitions per topic. More partitions allow greater
# parallelism for consumption, but this will also result in more files across
# the brokers.
num.partitions=3

# The number of threads per data directory to be used for log recovery at startup and flushing at shutdown.
# This value is recommended to be increased for installations with data dirs located in RAID array.
num.recovery.threads.per.data.dir=1

############################# Internal Topic Settings  #############################
# The replication factor for the group metadata internal topics "__consumer_offsets" and "__transaction_state"
# For anything other than development testing, a value greater than 1 is recommended to ensure availability such as 3.
offsets.topic.replication.factor=1
transaction.state.log.replication.factor=1
transaction.state.log.min.isr=1

############################# Log Flush Policy #############################

# Messages are immediately written to the filesystem but by default we only fsync() to sync
# the OS cache lazily. The following configurations control the flush of data to disk.
# There are a few important trade-offs here:
#    1. Durability: Unflushed data may be lost if you are not using replication.
#    2. Latency: Very large flush intervals may lead to latency spikes when the flush does occur as there will be a lot of data to flush.
#    3. Throughput: The flush is generally the most expensive operation, and a small flush interval may lead to excessive seeks.
# The settings below allow one to configure the flush policy to flush data after a period of time or
# every N messages (or both). This can be done globally and overridden on a per-topic basis.

# The number of messages to accept before forcing a flush of data to disk
#log.flush.interval.messages=10000

# The maximum amount of time a message can sit in a log before we force a flush
#log.flush.interval.ms=1000

############################# Log Retention Policy #############################

# The following configurations control the disposal of log segments. The policy can
# be set to delete segments after a period of time, or after a given size has accumulated.
# A segment will be deleted whenever *either* of these criteria are met. Deletion always happens
# from the end of the log.

# The minimum age of a log file to be eligible for deletion due to age
log.retention.hours=168

# A size-based retention policy for logs. Segments are pruned from the log unless the remaining
# segments drop below log.retention.bytes. Functions independently of log.retention.hours.
#log.retention.bytes=1073741824

# The maximum size of a log segment file. When this size is reached a new log segment will be created.
#log.segment.bytes=1073741824

# The interval at which log segments are checked to see if they can be deleted according
# to the retention policies
log.retention.check.interval.ms=300000

############################# Zookeeper #############################

# Zookeeper connection string (see zookeeper docs for details).
# This is a comma separated host:port pairs, each corresponding to a zk
# server. e.g. "127.0.0.1:3000,127.0.0.1:3001,127.0.0.1:3002".
# You can also append an optional chroot string to the urls to specify the
# root directory for all kafka znodes.
zookeeper.connect=localhost:2181

# Timeout in ms for connecting to zookeeper
zookeeper.connection.timeout.ms=18000


############################# Group Coordinator Settings #############################

# The following configuration specifies the time, in milliseconds, that the GroupCoordinator will delay the initial consumer rebalance.
# The rebalance will be further delayed by the value of group.initial.rebalance.delay.ms as new members join the group, up to a maximum of max.poll.interval.ms.
# The default value for this is 3 seconds.
# We override this to 0 here as it makes for a better out-of-the-box experience for development and testing.
# However, in production environments the default value of 3 seconds is more suitable as this will help to avoid unnecessary, and potentially expensive, rebalances during application startup.
group.initial.rebalance.delay.ms=0

############################# Authorization #############################

authorizer.class.name=kafka.security.authorizer.AclAuthorizer

# deny access unless ACL exists
allow.everyone.if.no.acl.found=false

# admin super user
super.users=User:admin

*Note:*
Error:
/Users/keerthana/Desktop/ecommerce_backend_using_zookeeper/backend/node_modules/kafkajs/src/protocol/error.js:581 return new KafkaJSProtocolError(errorCodes.find(e => e.code === code) || unknownErrorCode(code)) ^ KafkaJSProtocolError: Not authorized to access topics: [Topic authorization failed]
That means:
username/password correct
topic access denied

You enabled:=
allow.everyone.if.no.acl.found=false  -----> in server.properties
So Kafka now blocks everything unless ACL explicitly allows it.
Your app user probably:
User:app
has no topic permissions yet.
*Fix:*
Give permissions.
Run:
bin/kafka-acls.sh \
--authorizer-properties zookeeper.connect=localhost:2181 \
--add \
--allow-principal User:app \
--operation Read \
--operation Write \
--topic order-created

If using multiple topics:
bin/kafka-acls.sh \
--authorizer-properties zookeeper.connect=localhost:2181 \
--add \
--allow-principal User:app \
--operation Read \
--operation Write \
--topic payment-success

Or wildcard for local learning:
bin/kafka-acls.sh \
--authorizer-properties zookeeper.connect=localhost:2181 \
--add \
--allow-principal User:app \
--operation All \
--topic '*'
