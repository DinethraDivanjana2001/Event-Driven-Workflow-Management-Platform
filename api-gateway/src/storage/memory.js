// In-memory storage for workflows and tasks
class MemoryStore {
    constructor() {
        this.workflows = new Map();
        this.tasks = new Map();
    }

    // Workflow operations
    saveWorkflow(workflow) {
        this.workflows.set(workflow.workflowId, workflow);
        return workflow;
    }

    getWorkflow(workflowId) {
        return this.workflows.get(workflowId) || null;
    }

    updateWorkflow(workflowId, updates) {
        const workflow = this.workflows.get(workflowId);
        if (!workflow) {
            return null;
        }
        const updated = { ...workflow, ...updates };
        this.workflows.set(workflowId, updated);
        return updated;
    }

    listWorkflows(filters = {}) {
        let workflows = Array.from(this.workflows.values());

        if (filters.status) {
            workflows = workflows.filter(w => w.status === filters.status);
        }

        if (filters.priority) {
            workflows = workflows.filter(w => w.priority === filters.priority);
        }

        // Sort by creation time (newest first)
        workflows.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const limit = filters.limit || 50;
        const offset = filters.offset || 0;

        return {
            workflows: workflows.slice(offset, offset + limit),
            total: workflows.length
        };
    }

    // Task operations
    saveTask(task) {
        this.tasks.set(task.taskId, task);
        return task;
    }

    getTask(taskId) {
        return this.tasks.get(taskId) || null;
    }

    updateTask(taskId, updates) {
        const task = this.tasks.get(taskId);
        if (!task) {
            return null;
        }
        const updated = { ...task, ...updates };
        this.tasks.set(taskId, updated);
        return updated;
    }

    listTasks(filters = {}) {
        let tasks = Array.from(this.tasks.values());

        if (filters.status) {
            tasks = tasks.filter(t => t.status === filters.status);
        }

        if (filters.type) {
            tasks = tasks.filter(t => t.type === filters.type);
        }

        tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const limit = filters.limit || 50;
        const offset = filters.offset || 0;

        return {
            tasks: tasks.slice(offset, offset + limit),
            total: tasks.length
        };
    }
}

export const store = new MemoryStore();
