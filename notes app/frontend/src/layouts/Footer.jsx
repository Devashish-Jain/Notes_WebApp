import React from 'react';

const Footer = () => {
    return (
        <footer style={{
            background: 'var(--surface-color)',
            borderTop: '1px solid var(--border-color)',
            padding: '32px 0',
            marginTop: 'auto',
        }}>
            <div className="container" style={{
                textAlign: 'center',
                color: 'var(--text-secondary)',
            }}>
                <p>&copy; 2024 NotesApp. Built with React & Spring Boot.</p>
                <p style={{ fontSize: '0.875rem', marginTop: '8px' }}>
                    A modern notes application with sharing capabilities
                </p>
            </div>
        </footer>
    );
};

export default Footer;
