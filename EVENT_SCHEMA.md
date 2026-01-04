# StreamOps Event Schema Documentation

This document defines all event types, schemas, and Kafka topic configurations used in the StreamOps platform.

---

## Overview

StreamOps uses **Apache Kafka** as the event streaming backbone. All asynchronous communication between the API Gateway and Event Processor happens through Kafka topics.

### Event-Driven Flow

```
API Gateway → Kafka Topic → Event Processor
     ↓                            ↓
  Publishes                   Consumes
  Events                      Events
```

---

## Kafka Topics

### Topic: `workflows`

**Purpose**: Workflow lifecycle events

**Configuration**:
```javascript
{
  name: "workflows",
  partitions: 3,
  replicationFactor: 1,
  retentionMs: 604800000, // 7 days
  cleanupPolicy: "delete"
}
```

**Event Types**:
- `workflow.created` - New workflow submitted
- `workflow.processing` - Workflow execution started
- `workflow.step.completed` - Individual step finished
- `workflow.completed` - Workflow finished successfully
- `workflow.failed` - Workflow encountered error

**Partition Key**: `workflowId` (ensures all events for same workflow go to same partition)

---

### Topic: `tasks`

**Purpose**: Standalone task events

**Configuration**:
```javascript
{
  name: "tasks",
  partitions: 3,
  replicationFactor: 1,
  retentionMs: 604800000, // 7 days
  cleanupPolicy: "delete"
}
```

**Event Types**:
- `task.created` - New task submitted
- `task.processing` - Task execution started
- `task.completed` - Task finished successfully
- `task.failed` - Task failed (will retry)
- `task.dead_letter` - Task permanently failed after max retries

**Partition Key**: `taskId`

---

## Base Event Structure

All events follow this common structure:

```javascript
{
  eventType: string,      // Event type identifier (e.g., "workflow.created")
  eventId: string,        // Unique event ID (UUID v4)
  timestamp: string,      // ISO 8601 timestamp
  payload: object,        // Event-specific data
  metadata: object        // Optional metadata
}
```

---

## Workflow Events

### workflow.created

**Published by**: API Gateway  
**Consumed by**: Event Processor  
**Trigger**: User creates a new workflow via `POST /api/workflows`

**Schema**:
```json
{
  "eventType": "workflow.created",
  "eventId": "evt-a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "timestamp": "2026-01-04T01:09:27.123Z",
  "payload": {
    "workflowId": "wf-a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "Data Processing Pipeline",
    "steps": ["validate", "transform", "store"],
    "priority": "high",
    "createdAt": "2026-01-04T01:09:27.123Z"
  },
  "metadata": {
    "source": "api-gateway",
    "userId": null,
    "apiVersion": "1.0.0"
  }
}
```

**Payload Fields**:
```javascript
{
  workflowId: string (required)
    - Format: "wf-{uuid}"
    - Description: Unique workflow identifier
    
  name: string (required)
    - Description: Human-readable workflow name
    
  steps: array of strings (required)
    - Description: Ordered list of steps to execute
    
  priority: string (required)
    - Enum: "low" | "medium" | "high"
    - Description: Execution priority
    
  createdAt: string (required)
    - Format: ISO 8601
    - Description: Workflow creation timestamp
}
```

---

### workflow.processing

**Published by**: Event Processor  
**Consumed by**: (Optional) Monitoring/logging systems  
**Trigger**: Event processor starts executing workflow

**Schema**:
```json
{
  "eventType": "workflow.processing",
  "eventId": "evt-b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "timestamp": "2026-01-04T01:09:30.456Z",
  "payload": {
    "workflowId": "wf-a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "startedAt": "2026-01-04T01:09:30.456Z",
    "currentStep": "validate",
    "currentStepIndex": 0
  },
  "metadata": {
    "source": "event-processor",
    "processorId": "worker-1"
  }
}
```

---

### workflow.step.completed

**Published by**: Event Processor  
**Consumed by**: (Optional) Progress tracking systems  
**Trigger**: Individual workflow step finishes

**Schema**:
```json
{
  "eventType": "workflow.step.completed",
  "eventId": "evt-c3d4e5f6-a7b8-9012-cdef-123456789012",
  "timestamp": "2026-01-04T01:09:33.789Z",
  "payload": {
    "workflowId": "wf-a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "stepName": "validate",
    "stepIndex": 0,
    "completedAt": "2026-01-04T01:09:33.789Z",
    "duration": 3333,
    "result": {
      "recordsProcessed": 1000,
      "validRecords": 950,
      "invalidRecords": 50
    }
  }
}
```

---

### workflow.completed

**Published by**: Event Processor  
**Consumed by**: (Optional) Notification systems  
**Trigger**: All workflow steps finish successfully

**Schema**:
```json
{
  "eventType": "workflow.completed",
  "eventId": "evt-d4e5f6a7-b8c9-0123-def1-234567890123",
  "timestamp": "2026-01-04T01:09:45.123Z",
  "payload": {
    "workflowId": "wf-a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "completedAt": "2026-01-04T01:09:45.123Z",
    "duration": 17667,
    "stepsCompleted": 3,
    "summary": {
      "totalRecords": 1000,
      "successfulRecords": 950,
      "failedRecords": 50
    }
  },
  "metadata": {
    "source": "event-processor",
    "processorId": "worker-1"
  }
}
```

---

### workflow.failed

**Published by**: Event Processor  
**Consumed by**: (Optional) Alerting systems  
**Trigger**: Workflow encounters unrecoverable error

**Schema**:
```json
{
  "eventType": "workflow.failed",
  "eventId": "evt-e5f6a7b8-c9d0-1234-ef12-345678901234",
  "timestamp": "2026-01-04T01:09:35.999Z",
  "payload": {
    "workflowId": "wf-a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "failedAt": "2026-01-04T01:09:35.999Z",
    "failedStep": "transform",
    "failedStepIndex": 1,
    "error": {
      "code": "TRANSFORM_ERROR",
      "message": "Invalid data format in record 523",
      "stack": "Error: Invalid data format...\n  at transform.js:45:12"
    }
  },
  "metadata": {
    "source": "event-processor",
    "processorId": "worker-1"
  }
}
```

---

## Task Events

### task.created

**Published by**: API Gateway  
**Consumed by**: Event Processor  
**Trigger**: User creates a new task via `POST /api/tasks`

**Schema**:
```json
{
  "eventType": "task.created",
  "eventId": "evt-f6a7b8c9-d0e1-2345-f123-456789012345",
  "timestamp": "2026-01-04T01:10:00.000Z",
  "payload": {
    "taskId": "task-x1y2z3a4-b5c6-7890-defg-hi1234567890",
    "type": "email_notification",
    "data": {
      "recipient": "user@example.com",
      "subject": "Welcome to StreamOps",
      "template": "welcome_email"
    },
    "retryCount": 0,
    "maxRetries": 3,
    "createdAt": "2026-01-04T01:10:00.000Z"
  },
  "metadata": {
    "source": "api-gateway",
    "userId": null
  }
}
```

**Payload Fields**:
```javascript
{
  taskId: string (required)
    - Format: "task-{uuid}"
    
  type: string (required)
    - Enum: "email_notification" | "data_export" | "report_generation"
    
  data: object (required)
    - Description: Task-specific payload (schema varies by type)
    
  retryCount: integer (required)
    - Description: Current retry attempt (starts at 0)
    
  maxRetries: integer (required)
    - Description: Maximum retry attempts before dead letter
    
  createdAt: string (required)
    - Format: ISO 8601
}
```

---

### task.processing

**Published by**: Event Processor  
**Consumed by**: (Optional) Monitoring systems  
**Trigger**: Event processor starts executing task

**Schema**:
```json
{
  "eventType": "task.processing",
  "eventId": "evt-a7b8c9d0-e1f2-3456-1234-567890123456",
  "timestamp": "2026-01-04T01:10:02.000Z",
  "payload": {
    "taskId": "task-x1y2z3a4-b5c6-7890-defg-hi1234567890",
    "startedAt": "2026-01-04T01:10:02.000Z",
    "retryCount": 0
  }
}
```

---

### task.completed

**Published by**: Event Processor  
**Consumed by**: (Optional) Analytics systems  
**Trigger**: Task finishes successfully

**Schema**:
```json
{
  "eventType": "task.completed",
  "eventId": "evt-b8c9d0e1-f2a3-4567-2345-678901234567",
  "timestamp": "2026-01-04T01:10:05.000Z",
  "payload": {
    "taskId": "task-x1y2z3a4-b5c6-7890-defg-hi1234567890",
    "completedAt": "2026-01-04T01:10:05.000Z",
    "duration": 3000,
    "result": {
      "emailSent": true,
      "messageId": "msg-123456"
    }
  }
}
```

---

### task.failed

**Published by**: Event Processor  
**Consumed by**: Event Processor (for retry logic)  
**Trigger**: Task execution fails but retries remain

**Schema**:
```json
{
  "eventType": "task.failed",
  "eventId": "evt-c9d0e1f2-a3b4-5678-3456-789012345678",
  "timestamp": "2026-01-04T01:10:05.000Z",
  "payload": {
    "taskId": "task-x1y2z3a4-b5c6-7890-defg-hi1234567890",
    "failedAt": "2026-01-04T01:10:05.000Z",
    "retryCount": 1,
    "maxRetries": 3,
    "error": {
      "code": "SMTP_ERROR",
      "message": "Connection timeout to mail server",
      "retryable": true
    },
    "nextRetryAt": "2026-01-04T01:10:35.000Z"
  }
}
```

---

### task.dead_letter

**Published by**: Event Processor  
**Consumed by**: (Optional) Dead letter queue handler  
**Trigger**: Task fails permanently after max retries

**Schema**:
```json
{
  "eventType": "task.dead_letter",
  "eventId": "evt-d0e1f2a3-b4c5-6789-4567-890123456789",
  "timestamp": "2026-01-04T01:12:00.000Z",
  "payload": {
    "taskId": "task-x1y2z3a4-b5c6-7890-defg-hi1234567890",
    "originalEvent": {
      "eventType": "task.created",
      "payload": { /* original task data */ }
    },
    "retryCount": 3,
    "maxRetries": 3,
    "finalError": {
      "code": "SMTP_ERROR",
      "message": "Connection timeout to mail server",
      "stack": "..."
    },
    "deadLetteredAt": "2026-01-04T01:12:00.000Z"
  }
}
```

---

## Event Metadata

Optional metadata can be included with any event:

```javascript
{
  metadata: {
    source: string,           // Service that published event
    userId: string | null,    // User who triggered event (if applicable)
    apiVersion: string,       // API version
    processorId: string,      // Worker instance ID
    traceId: string,          // Distributed tracing ID
    correlationId: string     // Request correlation ID
  }
}
```

---

## Message Format

### Kafka Message Structure

```javascript
{
  key: string,              // Partition key (workflowId or taskId)
  value: string,            // JSON-serialized event object
  timestamp: number,        // Unix timestamp (milliseconds)
  headers: {                // Optional headers
    "content-type": "application/json",
    "schema-version": "1.0.0"
  }
}
```

### Example Kafka Message

```javascript
{
  key: "wf-a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  value: JSON.stringify({
    eventType: "workflow.created",
    eventId: "evt-123",
    timestamp: "2026-01-04T01:09:27Z",
    payload: { /* ... */ }
  }),
  timestamp: 1735949367123,
  headers: {
    "content-type": "application/json",
    "schema-version": "1.0.0"
  }
}
```

---

## Consumer Groups

### workflow-processors

**Purpose**: Process workflow and task events  
**Topics**: `workflows`, `tasks`  
**Instances**: 1-3 (can scale horizontally)  
**Offset Strategy**: `latest` (don't reprocess old events on startup)

**Configuration**:
```javascript
{
  groupId: "workflow-processors",
  sessionTimeout: 30000,
  heartbeatInterval: 3000,
  maxPollInterval: 300000,
  autoCommit: true,
  autoCommitInterval: 5000
}
```

---

## Event Ordering Guarantees

### Within Same Workflow
- All events for the same `workflowId` go to the same partition (via partition key)
- Events are processed in order within a partition
- **Guarantee**: `workflow.created` always processed before `workflow.completed`

### Across Different Workflows
- No ordering guarantee between different workflows
- Workflows can be processed in parallel across partitions

---

## Retry and Error Handling

### Event Processing Failures

**Strategy**: At-least-once delivery

1. **Transient Errors** (network timeout, temporary unavailability):
   - Consumer does not commit offset
   - Message will be reprocessed on next poll
   - Implement idempotency in handlers

2. **Permanent Errors** (invalid event schema, business logic failure):
   - Log error with full event details
   - Commit offset to skip message
   - Publish to dead letter topic (future)

### Idempotency

All event handlers should be idempotent:

```javascript
// Example: Check if workflow already processed
async function handleWorkflowCreated(event) {
  const workflow = await getWorkflow(event.payload.workflowId);
  
  if (workflow.status !== 'pending') {
    logger.warn('Workflow already processed, skipping', {
      workflowId: event.payload.workflowId,
      currentStatus: workflow.status
    });
    return; // Idempotent: safe to skip
  }
  
  // Process workflow...
}
```

---

## Schema Evolution

### Versioning Strategy

**Current**: Implicit v1 (no version field)

**Future**: Add `schemaVersion` field to all events

```javascript
{
  eventType: "workflow.created",
  schemaVersion: "2.0.0",
  // ...
}
```

### Backward Compatibility Rules

1. **Adding fields**: Always optional with defaults
2. **Removing fields**: Deprecate first, remove after 6 months
3. **Changing types**: Create new event type (e.g., `workflow.created.v2`)

---

## Monitoring and Observability

### Key Metrics to Track

**Producer (API Gateway)**:
- Events published per second
- Publish latency (p50, p95, p99)
- Publish failures

**Consumer (Event Processor)**:
- Events consumed per second
- Processing latency
- Consumer lag (offset behind latest)
- Processing failures

**Kafka**:
- Topic partition count
- Disk usage
- Replication lag

### Example Logging

```javascript
// Producer
logger.info('Event published', {
  topic: 'workflows',
  eventType: 'workflow.created',
  workflowId: 'wf-123',
  partition: 2,
  offset: 45678
});

// Consumer
logger.info('Event processed', {
  topic: 'workflows',
  eventType: 'workflow.created',
  workflowId: 'wf-123',
  processingTime: 2345,
  success: true
});
```

---

## Testing Events

### Manual Event Inspection

```bash
# Consume from workflows topic
docker exec -it <kafka-container> kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic workflows \
  --from-beginning \
  --property print.key=true \
  --property key.separator="|"

# Output:
# wf-123|{"eventType":"workflow.created","eventId":"evt-456",...}
```

### Publish Test Event

```bash
# Publish test event
echo 'wf-test|{"eventType":"workflow.created","eventId":"test-1","timestamp":"2026-01-04T01:00:00Z","payload":{"workflowId":"wf-test","name":"Test","steps":["step1"],"priority":"low","createdAt":"2026-01-04T01:00:00Z"}}' | \
  docker exec -i <kafka-container> kafka-console-producer \
    --bootstrap-server localhost:9092 \
    --topic workflows \
    --property "parse.key=true" \
    --property "key.separator=|"
```

---

**Last Updated**: January 2026  
**Schema Version**: 1.0.0
