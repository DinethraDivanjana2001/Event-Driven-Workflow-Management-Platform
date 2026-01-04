# StreamOps

An event-driven workflow orchestration platform built to demonstrate modern software engineering practices in distributed systems design.

## Overview

StreamOps is an internal platform simulation that processes workflows and tasks asynchronously using event-driven architecture. The system decouples request handling from execution through Apache Kafka, allowing components to scale independently and react to events rather than direct service calls.

This project was built as a personal engineering exercise to explore:
- Event-driven system design
- Asynchronous processing patterns
- Microservice communication via message brokers
- Full-stack integration with React and Node.js

**Built by**: Single developer  
**Purpose**: Technical portfolio project demonstrating production-ready architectural patterns  
**Status**: Development/demonstration environment

---

## Problem Statement

Traditional synchronous request-response architectures create tight coupling between services. When a user submits a long-running operation, the API must either:
- Block until completion (poor UX, resource waste)
- Implement complex polling/callback mechanisms
- Risk timeout failures

**StreamOps addresses this by**:
- Accepting requests immediately and returning acknowledgment
- Publishing events to a message broker for asynchronous processing
- Allowing background workers to process events at their own pace
- Enabling horizontal scaling of processing capacity independently from the API layer

This pattern is common in real-world platforms handling order processing, data pipelines, notification systems, and workflow automation.

---

## Architecture

### System Components

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   React     │  HTTP   │   Express    │  Kafka  │   Worker    │
│  Frontend   │────────▶│  API Gateway │────────▶│  Processor  │
│             │         │              │         │             │
└─────────────┘         └──────────────┘         └─────────────┘
                               │                        │
                               │                        │
                               ▼                        ▼
                        ┌──────────────┐         ┌─────────────┐
                        │   Kafka      │         │  Business   │
                        │  (Message    │         │   Logic     │
                        │   Broker)    │         │  Execution  │
                        └──────────────┘         └─────────────┘
```

### Component Responsibilities

#### 1. Frontend (React + Vite)
- Provides UI for creating workflows and tasks
- Displays real-time status of submitted operations
- Calls REST API endpoints
- Polls for status updates (no WebSockets in this version)

**Technology**: React 18, Vite, Axios  
**Port**: 5173 (development)

#### 2. API Gateway (Node.js + Express)
- Exposes REST endpoints for workflow/task creation
- Validates incoming requests
- Publishes events to Kafka topics
- Returns immediate acknowledgment to client
- Provides status query endpoints

**Technology**: Express, KafkaJS, Winston (logging)  
**Port**: 3000

#### 3. Event Processor (Node.js Worker)
- Subscribes to Kafka topics (`workflows`, `tasks`)
- Consumes events from the message broker
- Executes business logic (simulated processing)
- Updates workflow/task status
- Publishes completion events

**Technology**: KafkaJS, Node.js  
**No exposed port** (internal consumer)

#### 4. Infrastructure (Docker Compose)
- Kafka broker for event streaming
- Zookeeper for Kafka coordination
- Containerized deployment of all services

---

## Event Flow (Step-by-Step)

### Scenario: User Creates a Workflow

1. **User Action**: User fills out workflow form in React frontend and clicks "Submit"

2. **API Request**: Frontend sends `POST /api/workflows` with payload:
   ```json
   {
     "name": "Data Processing Pipeline",
     "steps": ["validate", "transform", "store"],
     "priority": "high"
   }
   ```

3. **API Gateway Processing**:
   - Validates request schema
   - Generates unique `workflowId`
   - Creates event object:
     ```json
     {
       "eventType": "workflow.created",
       "eventId": "uuid",
       "timestamp": "ISO-8601",
       "payload": { "workflowId": "...", ... }
     }
     ```
   - Publishes event to Kafka topic `workflows`
   - Returns `201 Created` with `workflowId` to frontend

4. **Kafka Broker**: Stores event in `workflows` topic partition

5. **Event Processor**:
   - Consumer polls Kafka and receives event
   - Extracts `payload` from event
   - Executes workflow steps sequentially (simulated with delays)
   - Logs progress: "Processing step 1/3: validate"
   - Updates in-memory status (in production: database)
   - Publishes `workflow.completed` event when done

6. **Frontend Polling**:
   - Periodically calls `GET /api/workflows/:id`
   - Displays status: "Pending" → "Processing" → "Completed"

---

## Design Decisions & Trade-offs

### Why Kafka?
- **Industry standard** for event streaming
- **Durable message storage** (events persist even if consumer is down)
- **Scalability**: Can add more consumers to same topic for parallel processing
- **Decoupling**: API and processor don't need to know about each other

**Trade-off**: Adds infrastructure complexity vs. simple queue (RabbitMQ) or database polling

### Why No Database?
- **Scope management**: Focus on event-driven patterns, not data persistence
- **Simplicity**: In-memory storage sufficient for demonstration
- **Realistic constraint**: Real systems would add PostgreSQL/MongoDB here

**Future improvement**: Add persistent storage for production readiness

### Why Polling Instead of WebSockets?
- **Simplicity**: REST polling easier to implement and debug
- **Realistic**: Many internal tools use polling for status updates
- **Scope**: WebSockets add complexity without demonstrating core event-driven concepts

**Trade-off**: Less real-time UX vs. implementation complexity

### Why Monorepo Structure?
- **Single developer workflow**: Easier to manage related services
- **Local development**: All code in one place
- **Deployment**: Can split into separate repos later if needed

---

## Technology Stack

| Layer          | Technology       | Justification                          |
|----------------|------------------|----------------------------------------|
| Frontend       | React + Vite     | Modern, fast dev experience            |
| API            | Node.js/Express  | Lightweight, JavaScript consistency    |
| Worker         | Node.js          | Same runtime as API, easy to share code|
| Messaging      | Apache Kafka     | Industry-standard event streaming      |
| Containerization | Docker Compose | Local multi-service orchestration      |
| Language       | JavaScript (ES6+)| Consistent across all layers           |

---

## Running Locally

### Prerequisites
- Node.js 18+ and npm
- Docker Desktop (for Kafka)
- Git

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd streamops
   ```

2. **Start Kafka infrastructure**
   ```bash
   docker-compose up -d kafka zookeeper
   ```
   Wait ~30 seconds for Kafka to be ready.

3. **Install dependencies**
   ```bash
   # API Gateway
   cd api-gateway
   npm install
   
   # Event Processor
   cd ../event-processor
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

4. **Start services** (in separate terminals)
   ```bash
   # Terminal 1: API Gateway
   cd api-gateway
   npm run dev
   
   # Terminal 2: Event Processor
   cd event-processor
   npm start
   
   # Terminal 3: Frontend
   cd frontend
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - API: http://localhost:3000
   - Kafka: localhost:9092 (internal)

### Verification
- Create a workflow in the UI
- Check API logs for "Event published to Kafka"
- Check processor logs for "Processing workflow..."
- Refresh UI to see status update

---

## API Reference

### Create Workflow
```http
POST /api/workflows
Content-Type: application/json

{
  "name": "string",
  "steps": ["string"],
  "priority": "low|medium|high"
}

Response: 201 Created
{
  "workflowId": "wf-uuid",
  "status": "pending",
  "createdAt": "ISO-8601"
}
```

### Get Workflow Status
```http
GET /api/workflows/:id

Response: 200 OK
{
  "workflowId": "wf-uuid",
  "name": "string",
  "status": "pending|processing|completed|failed",
  "currentStep": "string",
  "createdAt": "ISO-8601",
  "completedAt": "ISO-8601 | null"
}
```

### Create Task
```http
POST /api/tasks
Content-Type: application/json

{
  "type": "email|notification|export",
  "data": {}
}

Response: 201 Created
{
  "taskId": "task-uuid",
  "status": "queued"
}
```

---

## Event Schema

### Workflow Events

**Topic**: `workflows`

**Event Types**:
- `workflow.created` - New workflow submitted
- `workflow.processing` - Workflow execution started
- `workflow.completed` - Workflow finished successfully
- `workflow.failed` - Workflow encountered error

**Schema**:
```json
{
  "eventType": "workflow.created",
  "eventId": "uuid-v4",
  "timestamp": "2026-01-04T01:09:27Z",
  "payload": {
    "workflowId": "wf-12345",
    "name": "Data Processing Pipeline",
    "steps": ["validate", "transform", "store"],
    "priority": "high",
    "metadata": {
      "userId": "optional",
      "source": "web-ui"
    }
  }
}
```

### Task Events

**Topic**: `tasks`

**Event Types**:
- `task.created`
- `task.completed`
- `task.failed`

**Schema**:
```json
{
  "eventType": "task.created",
  "eventId": "uuid-v4",
  "timestamp": "2026-01-04T01:09:27Z",
  "payload": {
    "taskId": "task-67890",
    "type": "email_notification",
    "data": {
      "recipient": "user@example.com",
      "template": "welcome"
    },
    "retryCount": 0,
    "maxRetries": 3
  }
}
```

---

## Project Structure

```
streamops/
├── frontend/              # React UI application
├── api-gateway/           # REST API service
├── event-processor/       # Kafka consumer worker
├── docker-compose.yml     # Infrastructure setup
└── README.md              # This file
```

Each service has its own `package.json`, `Dockerfile`, and source code organized by responsibility.

---

## Development Notes

### Logging
- All services use structured logging (JSON format)
- Log levels: `info`, `warn`, `error`
- Kafka events are logged on publish and consume

### Error Handling
- API validates requests and returns 400 for invalid input
- Processor retries failed events (configurable retry count)
- Dead letter queue pattern for permanently failed events (future)

### Testing Strategy
- **Manual testing**: Use UI to create workflows and verify processing
- **API testing**: Use Postman/curl to test endpoints directly
- **Event inspection**: Use Kafka CLI tools to view topic contents
- **Future**: Add Jest unit tests and integration tests

---

## Limitations & Known Issues

### Current Limitations
1. **No persistence**: All data stored in-memory (lost on restart)
2. **No authentication**: Open API endpoints (not production-ready)
3. **Single instance**: No load balancing or horizontal scaling configured
4. **Polling-based UI**: Not real-time (WebSocket would improve UX)
5. **Simulated processing**: Business logic is placeholder (sleeps/logs)

### Known Issues
- Kafka takes ~30 seconds to start (Docker limitation)
- No graceful shutdown handling for consumers
- Frontend doesn't handle API errors elegantly

---

## Future Improvements

### Short-term (Realistic for single developer)
- [ ] Add PostgreSQL for persistent storage
- [ ] Implement proper error boundaries in React
- [ ] Add Docker health checks
- [ ] Create single `docker-compose up` command for full stack
- [ ] Add environment variable configuration
- [ ] Implement retry logic with exponential backoff

### Long-term (Production considerations)
- [ ] Add authentication/authorization (JWT)
- [ ] Implement WebSocket for real-time updates
- [ ] Add monitoring (Prometheus + Grafana)
- [ ] Implement dead letter queue for failed events
- [ ] Add unit and integration tests (Jest, Supertest)
- [ ] Create CI/CD pipeline
- [ ] Add API rate limiting
- [ ] Implement event schema validation (Avro/JSON Schema)

---

## Interview Talking Points

### System Design
- **Why event-driven?** Decouples services, enables async processing, improves scalability
- **Why Kafka over RabbitMQ?** Kafka provides event log persistence and replay capability
- **How would you scale?** Add more consumer instances to same topic, partition topics by workflow type

### Trade-offs Made
- **In-memory vs. database**: Chose simplicity for demo, acknowledge production needs persistence
- **Polling vs. WebSockets**: Chose simpler implementation, understand real-time alternatives
- **Monorepo vs. multi-repo**: Easier development for single person, can split later

### Real-world Application
- **Order processing**: E-commerce checkout → payment → fulfillment → notification
- **Data pipelines**: Ingest → validate → transform → store → index
- **Workflow automation**: Approval chains, document processing, batch jobs

---

## License

This is a personal educational project. Feel free to reference the architecture and patterns.

---

## Contact

**Developer**: [Your Name]  
**LinkedIn**: [Your Profile]  
**GitHub**: [Your Username]  
**Email**: [Your Email]

---

**Last Updated**: January 2026  
**Version**: 1.0.0-dev
