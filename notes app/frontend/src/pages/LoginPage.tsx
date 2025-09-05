import React from 'react';

const LoginPage: React.FC = () => {
    return (
        <div style={{ 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '80px 20px 20px'
        }}>
            <div style={{
                background: '#ffffff',
                padding: '48px',
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                width: '100%',
                maxWidth: '400px'
            }}>
                <h1 style={{ 
                    textAlign: 'center', 
                    marginBottom: '32px',
                    fontSize: '2rem',
                    fontWeight: '700'
                }}>
                    Welcome Back
                </h1>
                
                <p style={{ textAlign: 'center', marginBottom: '24px' }}>
                    Login functionality coming soon!
                </p>
                
                <div style={{ textAlign: 'center' }}>
                    <a href="/" style={{ color: '#667eea', textDecoration: 'none' }}>
                        Back to Home
                    </a>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
