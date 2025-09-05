import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import { Fade } from 'react-awesome-reveal';

const LoginPage = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        const result = await login(formData);
        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.error);
        }
        setLoading(false);
    };

    return (
        <div style={{ 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '80px 20px 20px'
        }}>
            <Fade direction="up" triggerOnce>
                <div style={{
                    background: 'var(--surface-color)',
                    padding: '48px',
                    borderRadius: 'var(--border-radius)',
                    boxShadow: 'var(--shadow-medium)',
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
                    
                    {error && (
                        <div style={{
                            background: '#fed7d7',
                            color: '#c53030',
                            padding: '12px',
                            borderRadius: '8px',
                            marginBottom: '24px',
                            textAlign: 'center'
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-input"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                className="form-input"
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                required
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="btn btn-primary"
                            style={{ width: '100%', marginBottom: '24px' }}
                            disabled={loading}
                        >
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center' }}>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            Don't have an account?{' '}
                            <Link to="/register" style={{ 
                                color: 'var(--primary-color)', 
                                textDecoration: 'none',
                                fontWeight: '600'
                            }}>
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </Fade>
        </div>
    );
};

export default LoginPage;
