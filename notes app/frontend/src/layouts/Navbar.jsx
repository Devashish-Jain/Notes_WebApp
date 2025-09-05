import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
        logout();
        setIsMenuOpen(false);
    };

    return (
        <nav style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid var(--border-color)',
            padding: '16px 0',
            zIndex: 100,
        }}>
            <div className="container" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}>
                <Link to="/" style={{
                    fontSize: '1.5rem',
                    fontWeight: '800',
                    color: 'var(--primary-color)',
                    textDecoration: 'none',
                }}>
                    NotesApp
                </Link>

                {/* Desktop Navigation */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '24px',
                }} className="desktop-nav">
                    {isAuthenticated ? (
                        <>
                            <Link 
                                to="/dashboard" 
                                style={{
                                    textDecoration: 'none',
                                    color: isActive('/dashboard') ? 'var(--primary-color)' : 'var(--text-primary)',
                                    fontWeight: isActive('/dashboard') ? '600' : '500',
                                }}
                            >
                                Dashboard
                            </Link>
                            <span style={{ color: 'var(--text-secondary)' }}>
                                Hi, {user?.username}!
                            </span>
                            <button 
                                onClick={handleLogout}
                                className="btn btn-secondary"
                                style={{ padding: '8px 16px', fontSize: '14px' }}
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link 
                                to="/login" 
                                style={{
                                    textDecoration: 'none',
                                    color: isActive('/login') ? 'var(--primary-color)' : 'var(--text-primary)',
                                    fontWeight: isActive('/login') ? '600' : '500',
                                }}
                            >
                                Login
                            </Link>
                            <Link 
                                to="/register" 
                                className="btn btn-primary"
                                style={{ padding: '8px 16px', fontSize: '14px', textDecoration: 'none' }}
                            >
                                Get Started
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    style={{
                        display: 'none',
                        background: 'none',
                        border: 'none',
                        fontSize: '24px',
                        cursor: 'pointer',
                    }}
                    className="mobile-menu-btn"
                >
                    ☰
                </button>
            </div>

            {/* Mobile Navigation */}
            {isMenuOpen && (
                <div style={{
                    display: 'none',
                    background: 'white',
                    borderTop: '1px solid var(--border-color)',
                    padding: '16px',
                }} className="mobile-nav">
                    {isAuthenticated ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                                Dashboard
                            </Link>
                            <span>Hi, {user?.username}!</span>
                            <button onClick={handleLogout} className="btn btn-secondary">
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                                Login
                            </Link>
                            <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                                Get Started
                            </Link>
                        </div>
                    )}
                </div>
            )}

            <style>{`
                @media (max-width: 768px) {
                    .desktop-nav {
                        display: none !important;
                    }
                    .mobile-menu-btn {
                        display: block !important;
                    }
                    .mobile-nav {
                        display: block !important;
                    }
                }
            `}</style>
        </nav>
    );
};

export default Navbar;
