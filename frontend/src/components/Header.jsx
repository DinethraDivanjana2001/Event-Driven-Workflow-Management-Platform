export default function Header() {
    return (
        <header style={styles.header}>
            <div style={styles.container}>
                <h1 style={styles.title}>⚡ StreamOps</h1>
                <p style={styles.subtitle}>Event-Driven Workflow Platform</p>
            </div>
        </header>
    );
}

const styles = {
    header: {
        backgroundColor: '#007bff',
        color: 'white',
        padding: '20px 0',
        marginBottom: '30px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px'
    },
    title: {
        margin: 0,
        fontSize: '32px',
        fontWeight: 'bold'
    },
    subtitle: {
        margin: '5px 0 0 0',
        fontSize: '14px',
        opacity: 0.9
    }
};
