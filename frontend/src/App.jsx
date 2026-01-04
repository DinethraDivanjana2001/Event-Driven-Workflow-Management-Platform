import { useState } from 'react';
import Header from './components/Header';
import WorkflowForm from './components/WorkflowForm';
import WorkflowList from './components/WorkflowList';

function App() {
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleWorkflowCreated = (workflow) => {
        console.log('New workflow created:', workflow.workflowId);
        // Trigger refresh of workflow list
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div style={styles.app}>
            <Header />

            <main style={styles.main}>
                <WorkflowForm onWorkflowCreated={handleWorkflowCreated} />
                <WorkflowList refreshTrigger={refreshTrigger} />
            </main>

            <footer style={styles.footer}>
                <p>StreamOps v1.0.0 - Event-Driven Workflow Platform</p>
                <p style={styles.footerNote}>
                    Built with React + Node.js + Apache Kafka
                </p>
            </footer>
        </div>
    );
}

const styles = {
    app: {
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        display: 'flex',
        flexDirection: 'column'
    },
    main: {
        flex: 1,
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto',
        padding: '0 20px 40px'
    },
    footer: {
        backgroundColor: '#333',
        color: 'white',
        textAlign: 'center',
        padding: '20px',
        marginTop: '40px',
        fontSize: '14px'
    },
    footerNote: {
        margin: '5px 0 0 0',
        opacity: 0.7,
        fontSize: '12px'
    }
};

export default App;
