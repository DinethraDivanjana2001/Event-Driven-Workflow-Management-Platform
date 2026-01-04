import { useState } from 'react';
import { workflowApi } from '../services/api';

export default function WorkflowForm({ onWorkflowCreated }) {
    const [name, setName] = useState('');
    const [stepsInput, setStepsInput] = useState('');
    const [priority, setPriority] = useState('medium');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // Parse steps from comma-separated input
            const steps = stepsInput
                .split(',')
                .map(s => s.trim())
                .filter(s => s.length > 0);

            if (steps.length === 0) {
                throw new Error('Please enter at least one step');
            }

            const workflow = await workflowApi.create({
                name,
                steps,
                priority
            });

            console.log('Workflow created:', workflow);

            // Reset form
            setName('');
            setStepsInput('');
            setPriority('medium');

            // Notify parent
            if (onWorkflowCreated) {
                onWorkflowCreated(workflow);
            }

        } catch (err) {
            console.error('Error creating workflow:', err);
            setError(err.response?.data?.error || err.message || 'Failed to create workflow');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Create New Workflow</h2>

            <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Workflow Name:</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Data Processing Pipeline"
                        required
                        minLength={3}
                        maxLength={100}
                        style={styles.input}
                    />
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.label}>Steps (comma-separated):</label>
                    <input
                        type="text"
                        value={stepsInput}
                        onChange={(e) => setStepsInput(e.target.value)}
                        placeholder="e.g., validate, transform, store"
                        required
                        style={styles.input}
                    />
                    <small style={styles.hint}>Enter steps separated by commas</small>
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.label}>Priority:</label>
                    <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        style={styles.select}
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>

                {error && (
                    <div style={styles.error}>
                        ⚠️ {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        ...styles.button,
                        ...(loading ? styles.buttonDisabled : {})
                    }}
                >
                    {loading ? 'Creating...' : 'Create Workflow'}
                </button>
            </form>
        </div>
    );
}

const styles = {
    container: {
        backgroundColor: '#f9f9f9',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '30px',
        border: '1px solid #ddd'
    },
    title: {
        marginTop: 0,
        marginBottom: '20px',
        color: '#333'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '5px'
    },
    label: {
        fontWeight: 'bold',
        color: '#555',
        fontSize: '14px'
    },
    input: {
        padding: '10px',
        fontSize: '14px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        fontFamily: 'inherit'
    },
    select: {
        padding: '10px',
        fontSize: '14px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        fontFamily: 'inherit',
        backgroundColor: 'white'
    },
    hint: {
        color: '#777',
        fontSize: '12px'
    },
    button: {
        padding: '12px 24px',
        fontSize: '16px',
        fontWeight: 'bold',
        color: 'white',
        backgroundColor: '#007bff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'background-color 0.2s'
    },
    buttonDisabled: {
        backgroundColor: '#6c757d',
        cursor: 'not-allowed'
    },
    error: {
        padding: '10px',
        backgroundColor: '#f8d7da',
        color: '#721c24',
        border: '1px solid #f5c6cb',
        borderRadius: '4px',
        fontSize: '14px'
    }
};
