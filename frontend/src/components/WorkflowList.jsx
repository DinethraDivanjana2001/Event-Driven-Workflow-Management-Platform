import { useState, useEffect } from 'react';
import { workflowApi } from '../services/api';

export default function WorkflowList({ refreshTrigger }) {
    const [workflows, setWorkflows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedWorkflow, setSelectedWorkflow] = useState(null);
    const [autoRefresh, setAutoRefresh] = useState(true);

    const fetchWorkflows = async () => {
        try {
            const data = await workflowApi.list({ limit: 20 });
            setWorkflows(data.workflows);
            setError(null);
        } catch (err) {
            console.error('Error fetching workflows:', err);
            setError('Failed to load workflows');
        } finally {
            setLoading(false);
        }
    };

    const fetchWorkflowDetails = async (id) => {
        try {
            const workflow = await workflowApi.getById(id);
            setSelectedWorkflow(workflow);
        } catch (err) {
            console.error('Error fetching workflow details:', err);
        }
    };

    useEffect(() => {
        fetchWorkflows();
    }, [refreshTrigger]);

    // Auto-refresh every 3 seconds if enabled
    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(() => {
            fetchWorkflows();
            if (selectedWorkflow) {
                fetchWorkflowDetails(selectedWorkflow.workflowId);
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [autoRefresh, selectedWorkflow]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return '#ffc107';
            case 'processing': return '#007bff';
            case 'completed': return '#28a745';
            case 'failed': return '#dc3545';
            default: return '#6c757d';
        }
    };

    const getStatusEmoji = (status) => {
        switch (status) {
            case 'pending': return '⏳';
            case 'processing': return '⚙️';
            case 'completed': return '✅';
            case 'failed': return '❌';
            default: return '❓';
        }
    };

    if (loading) {
        return <div style={styles.loading}>Loading workflows...</div>;
    }

    if (error) {
        return <div style={styles.error}>{error}</div>;
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>Workflows ({workflows.length})</h2>
                <label style={styles.autoRefreshLabel}>
                    <input
                        type="checkbox"
                        checked={autoRefresh}
                        onChange={(e) => setAutoRefresh(e.target.checked)}
                    />
                    Auto-refresh (3s)
                </label>
            </div>

            {workflows.length === 0 ? (
                <div style={styles.empty}>
                    No workflows yet. Create one above to get started!
                </div>
            ) : (
                <div style={styles.grid}>
                    {workflows.map((workflow) => (
                        <div
                            key={workflow.workflowId}
                            style={styles.card}
                            onClick={() => fetchWorkflowDetails(workflow.workflowId)}
                        >
                            <div style={styles.cardHeader}>
                                <h3 style={styles.cardTitle}>{workflow.name}</h3>
                                <span
                                    style={{
                                        ...styles.statusBadge,
                                        backgroundColor: getStatusColor(workflow.status)
                                    }}
                                >
                                    {getStatusEmoji(workflow.status)} {workflow.status}
                                </span>
                            </div>

                            <div style={styles.cardBody}>
                                <div style={styles.info}>
                                    <strong>Steps:</strong> {workflow.steps.join(' → ')}
                                </div>
                                <div style={styles.info}>
                                    <strong>Priority:</strong> {workflow.priority}
                                </div>
                                {workflow.currentStep && (
                                    <div style={styles.info}>
                                        <strong>Current:</strong> {workflow.currentStep} ({workflow.currentStepIndex + 1}/{workflow.steps.length})
                                    </div>
                                )}
                                <div style={styles.info}>
                                    <strong>Created:</strong> {new Date(workflow.createdAt).toLocaleString()}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedWorkflow && (
                <div style={styles.modal} onClick={() => setSelectedWorkflow(null)}>
                    <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <h3>Workflow Details</h3>
                        <pre style={styles.json}>
                            {JSON.stringify(selectedWorkflow, null, 2)}
                        </pre>
                        <button
                            onClick={() => setSelectedWorkflow(null)}
                            style={styles.closeButton}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

const styles = {
    container: {
        marginTop: '20px'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
    },
    title: {
        margin: 0,
        color: '#333'
    },
    autoRefreshLabel: {
        fontSize: '14px',
        color: '#555',
        cursor: 'pointer'
    },
    loading: {
        padding: '20px',
        textAlign: 'center',
        color: '#666'
    },
    error: {
        padding: '20px',
        backgroundColor: '#f8d7da',
        color: '#721c24',
        border: '1px solid #f5c6cb',
        borderRadius: '4px'
    },
    empty: {
        padding: '40px',
        textAlign: 'center',
        color: '#999',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        border: '2px dashed #ddd'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '20px'
    },
    card: {
        backgroundColor: 'white',
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '15px',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s, transform 0.2s',
        ':hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            transform: 'translateY(-2px)'
        }
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '10px',
        gap: '10px'
    },
    cardTitle: {
        margin: 0,
        fontSize: '16px',
        color: '#333',
        flex: 1
    },
    statusBadge: {
        padding: '4px 8px',
        borderRadius: '4px',
        color: 'white',
        fontSize: '12px',
        fontWeight: 'bold',
        whiteSpace: 'nowrap'
    },
    cardBody: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    },
    info: {
        fontSize: '13px',
        color: '#555'
    },
    modal: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
    },
    modalContent: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        maxWidth: '600px',
        maxHeight: '80vh',
        overflow: 'auto',
        width: '90%'
    },
    json: {
        backgroundColor: '#f4f4f4',
        padding: '15px',
        borderRadius: '4px',
        overflow: 'auto',
        fontSize: '12px',
        fontFamily: 'monospace'
    },
    closeButton: {
        marginTop: '15px',
        padding: '10px 20px',
        backgroundColor: '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px'
    }
};
