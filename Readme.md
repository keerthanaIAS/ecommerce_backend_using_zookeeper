                    ┌─────────────────┐
                    │   ZooKeeper     │
                    │  (Port 2181)    │
                    │  - Stores:      │
                    │    • Broker IDs │
                    │    • Topics     │
                    │    • Partitions │
                    │    • Configs    │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │     Kafka       │
                    │  (Port 9092)    │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
   ┌────▼────┐          ┌────▼────┐          ┌────▼────┐
   │Producer │          │Consumer │          │Consumer │
   └─────────┘          └─────────┘          └─────────┘

EXACT FLOW:
Frontend
   ↓
/orders
   ↓
Kafka: order-created

Frontend
   ↓
/create-payment-intent
   ↓
Stripe PaymentIntent created

Frontend
   ↓
stripe.confirmCardPayment()

Stripe Servers
   ↓
payment_intent.succeeded

Stripe
   ↓
POST /api/payments/webhook

Webhook
   ↓
Kafka: payment-success

Consumer
   ↓
Order confirmed

Need kafka commands:
All containers (including stopped)
docker ps -a
Remove specific container
docker rm -f kafka-ui
Remove everything unused
docker system prune -a