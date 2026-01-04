import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { store } from '../storage/memory.js';
import { publishEvent } from '../kafka/producer.js';
import { createWorkflowEvent } from '../kafka/events.js';
import { validateWorkflow } from '../middleware/validator.js';

const router = express.Router();

// Create workflow
router.post('/', async (req, res) => {
    try {
        // Validate request
        const validation = validateWorkflow(req.body);
        if (!validation.valid) {
            return res.status(400).json({
                error: 'Validation failed',
                details: validation.errors
            });
        }

        // Create workflow object
        const workflow = {
            workflowId: `wf-${uuidv4()}`,
            name: req.body.name,
            steps: req.body.steps,
            priority: req.body.priority || 'medium',
            status: 'pending',
            currentStep: null,
            currentStepIndex: 0,
            createdAt: new Date().toISOString(),
            startedAt: null,
            completedAt: null,
            error: null
        };

        // Save to storage
        store.saveWorkflow(workflow);

        // Create and publish event
        const event = createWorkflowEvent('workflow.created', {
            workflowId: workflow.workflowId,
            name: workflow.name,
            steps: workflow.steps,
            priority: workflow.priority,
            createdAt: workflow.createdAt
        });

        await publishEvent('workflows', event);

        console.log(`[API] Workflow created: ${workflow.workflowId}`);

        // Return response
        res.status(201).json(workflow);
    } catch (error) {
        console.error('[API] Error creating workflow:', error.message);
        res.status(500).json({
            error: 'Failed to create workflow',
            message: error.message
        });
    }
});

// Get workflow by ID
router.get('/:id', (req, res) => {
    const workflow = store.getWorkflow(req.params.id);

    if (!workflow) {
        return res.status(404).json({
            error: 'Workflow not found',
            workflowId: req.params.id
        });
    }

    res.json(workflow);
});

// List workflows
router.get('/', (req, res) => {
    const filters = {
        status: req.query.status,
        priority: req.query.priority,
        limit: parseInt(req.query.limit) || 50,
        offset: parseInt(req.query.offset) || 0
    };

    const result = store.listWorkflows(filters);

    res.json({
        workflows: result.workflows,
        total: result.total,
        limit: filters.limit,
        offset: filters.offset
    });
});

export default router;
