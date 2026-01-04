# StreamOps - Setup and Run Instructions

## Prerequisites

- Node.js 18+ and npm
- Docker Desktop (running)

## Quick Start

### 1. Start Kafka Infrastructure

```bash
# From project root
docker-compose up -d

# Wait 30 seconds for Kafka to initialize
# Check logs:
docker-compose logs -f kafka
```

### 2. Set Up API Gateway

```bash
cd api-gateway
npm install
npm start
```

Expected output:
```
StreamOps API Gateway
Server running on port 3000
```

### 3. Set Up Event Processor

```bash
# In a new terminal
cd event-processor
npm install
npm start
```

Expected output:
```
StreamOps Event Processor
[Kafka Consumer] Connected successfully
[Kafka Consumer] Started consuming messages...
```

### 4. Set Up Frontend

```bash
# In a new terminal
cd frontend
npm install
npm run dev
```

Expected output:
```
VITE ready in 500 ms
➜  Local:   http://localhost:5173/
```

### 5. Test the System

1. Open browser: http://localhost:5173
2. Fill in the workflow form:
   - Name: "Test Pipeline"
   - Steps: "validate, transform, store"
   - Priority: "high"
3. Click "Create Workflow"
4. Watch the workflow status change: pending → processing → completed

## Verification

### Check API
```bash
curl http://localhost:3000/api/health
```

### Check Kafka Topics
```bash
docker exec -it streamops-kafka kafka-topics --list --bootstrap-server localhost:9092
```

### View Kafka Messages
```bash
docker exec -it streamops-kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic workflows \
  --from-beginning
```

## Stopping Services

```bash
# Stop Kafka
docker-compose down

# Stop Node services: Ctrl+C in each terminal
```

## Troubleshooting

### Kafka won't start
```bash
docker-compose down -v
docker-compose up -d
```

### Port already in use
Change PORT in .env files or kill the process using the port

### API can't connect to Kafka
Wait longer (Kafka takes 30-60 seconds to start)

## Project Structure

```
streamops/
├── api-gateway/          # Express REST API
├── event-processor/      # Kafka consumer worker
├── frontend/             # React UI
└── docker-compose.yml    # Kafka infrastructure
```

## Next Steps

- Review the code in each service
- Try creating multiple workflows
- Check the logs to see event flow
- Modify the processing logic in event-processor
