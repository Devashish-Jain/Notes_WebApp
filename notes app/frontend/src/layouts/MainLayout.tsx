import React from 'react';

interface MainLayoutProps {
    children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    return (
        <div className="app-layout">
            <nav style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid #e2e8f0',
                padding: '16px 0',
                zIndex: 100,
            }}>
                <div style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    padding: '0 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    <a href="/" style={{
                        fontSize: '1.5rem',
                        fontWeight: '800',
                        color: '#667eea',
                        textDecoration: 'none',
                    }}>
                        NotesApp
                    </a>
                    <div>
                        <a href="/login" style={{ marginRight: '16px', textDecoration: 'none' }}>Login</a>
                        <a href="/register" style={{ textDecoration: 'none' }}>Register</a>
                    </div>
                </div>
            </nav>
            
            <main className="main-content">
                {children}
            </main>
            
            <footer style={{
                background: '#ffffff',
                borderTop: '1px solid #e2e8f0',
                padding: '32px 0',
                marginTop: 'auto',
                textAlign: 'center',
                color: '#718096',
            }}>
                <p>&copy; 2024 NotesApp. Built with React & Spring Boot.</p>
            </footer>
        </div>
    );
};

export default MainLayout;
