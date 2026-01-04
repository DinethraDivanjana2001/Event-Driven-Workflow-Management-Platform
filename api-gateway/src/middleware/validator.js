export function validateWorkflow(data) {
    const errors = [];

    if (!data.name || typeof data.name !== 'string') {
        errors.push({ field: 'name', message: 'name is required and must be a string' });
    } else if (data.name.length < 3 || data.name.length > 100) {
        errors.push({ field: 'name', message: 'name must be between 3 and 100 characters' });
    }

    if (!data.steps || !Array.isArray(data.steps)) {
        errors.push({ field: 'steps', message: 'steps is required and must be an array' });
    } else if (data.steps.length < 1 || data.steps.length > 10) {
        errors.push({ field: 'steps', message: 'steps must contain between 1 and 10 items' });
    } else if (!data.steps.every(step => typeof step === 'string')) {
        errors.push({ field: 'steps', message: 'all steps must be strings' });
    }

    if (data.priority && !['low', 'medium', 'high'].includes(data.priority)) {
        errors.push({ field: 'priority', message: 'priority must be one of: low, medium, high' });
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

export function validateTask(data) {
    const errors = [];

    if (!data.type || typeof data.type !== 'string') {
        errors.push({ field: 'type', message: 'type is required and must be a string' });
    } else if (!['email_notification', 'data_export', 'report_generation'].includes(data.type)) {
        errors.push({
            field: 'type',
            message: 'type must be one of: email_notification, data_export, report_generation'
        });
    }

    if (!data.data || typeof data.data !== 'object') {
        errors.push({ field: 'data', message: 'data is required and must be an object' });
    }

    return {
        valid: errors.length === 0,
        errors
    };
}
