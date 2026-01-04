import express from 'express';
import { store } from '../storage/memory.js';

const router = express.Router();

// Internal endpoint for event processor to update workflow status
router.patch('/workflows/:id', (req, res) => {
    try {
        const workflow = store.getWorkflow(req.params.id);

        if (!workflow) {
            return res.status(404).json({
                error: 'Workflow not found',
                workflowId: req.params.id
            });
        }

        const updates = {};

        if (req.body.status) {
            updates.status = req.body.status;
        }

        if (req.body.currentStep !== undefined) {
            updates.currentStep = req.body.currentStep;
        }

        if (req.body.currentStepIndex !== undefined) {
            updates.currentStepIndex = req.body.currentStepIndex;
        }

        if (req.body.startedAt) {
            updates.startedAt = req.body.startedAt;
        }

        if (req.body.completedAt) {
            updates.completedAt = req.body.completedAt;
        }

        if (req.body.error) {
            updates.error = req.body.error;
        }

        const updated = store.updateWorkflow(req.params.id, updates);

        console.log(`[API] Workflow updated: ${req.params.id} - status: ${updates.status || workflow.status}`);

        res.json(updated);
    } catch (error) {
        console.error('[API] Error updating workflow:', error.message);
        res.status(500).json({
            error: 'Failed to update workflow',
            message: error.message
        });
    }
});

// Internal endpoint for event processor to update task status
router.patch('/tasks/:id', (req, res) => {
    try {
        const task = store.getTask(req.params.id);

        if (!task) {
            return res.status(404).json({
                error: 'Task not found',
                taskId: req.params.id
            });
        }

        const updates = {};

        if (req.body.status) {
            updates.status = req.body.status;
        }

        if (req.body.completedAt) {
            updates.completedAt = req.body.completedAt;
        }

        if (req.body.error) {
            updates.error = req.body.error;
        }

        const updated = store.updateTask(req.params.id, updates);

        console.log(`[API] Task updated: ${req.params.id} - status: ${updates.status || task.status}`);

        res.json(updated);
    } catch (error) {
        console.error('[API] Error updating task:', error.message);
        res.status(500).json({
            error: 'Failed to update task',
            message: error.message
        });
    }
});

export default router;
