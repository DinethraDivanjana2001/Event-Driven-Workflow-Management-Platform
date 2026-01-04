import { updateWorkflowStatus } from '../services/apiClient.js';

// Helper function to simulate processing delay
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function handleWorkflowCreated(event) {
    const { workflowId, name, steps, priority } = event.payload;

    console.log('='.repeat(60));
    console.log(`[Workflow Handler] Processing workflow: ${workflowId}`);
    console.log(`[Workflow Handler] Name: ${name}`);
    console.log(`[Workflow Handler] Steps: ${steps.join(' → ')}`);
    console.log(`[Workflow Handler] Priority: ${priority}`);
    console.log('='.repeat(60));

    try {
        // Update status to processing
        await updateWorkflowStatus(workflowId, 'processing', {
            startedAt: new Date().toISOString()
        });

        // Execute each step
        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];

            console.log(`[Workflow Handler] Executing step ${i + 1}/${steps.length}: ${step}`);

            // Update current step
            await updateWorkflowStatus(workflowId, 'processing', {
                currentStep: step,
                currentStepIndex: i
            });

            // Simulate processing time (2-5 seconds per step)
            const processingTime = 2000 + Math.random() * 3000;
            await sleep(processingTime);

            // Simulate occasional failures (5% chance)
            if (Math.random() < 0.05) {
                throw new Error(`Step "${step}" failed: Simulated random failure`);
            }

            console.log(`[Workflow Handler] ✓ Step ${i + 1}/${steps.length} completed: ${step}`);
        }

        // Mark as completed
        await updateWorkflowStatus(workflowId, 'completed', {
            completedAt: new Date().toISOString(),
            currentStep: null
        });

        console.log('='.repeat(60));
        console.log(`[Workflow Handler] ✓ Workflow ${workflowId} completed successfully`);
        console.log('='.repeat(60));

    } catch (error) {
        console.error('='.repeat(60));
        console.error(`[Workflow Handler] ✗ Workflow ${workflowId} failed:`, error.message);
        console.error('='.repeat(60));

        // Update status to failed
        await updateWorkflowStatus(workflowId, 'failed', {
            error: error.message,
            completedAt: new Date().toISOString()
        });
    }
}

export async function handleWorkflowEvent(event) {
    const { eventType } = event;

    switch (eventType) {
        case 'workflow.created':
            await handleWorkflowCreated(event);
            break;

        default:
            console.log(`[Workflow Handler] Ignoring event type: ${eventType}`);
    }
}
