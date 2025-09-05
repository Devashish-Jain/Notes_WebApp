import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import { Fade } from 'react-awesome-reveal';

const RegisterPage = () => {
    const [formData, setFormData] = useState({ 
        username: '', 
        email: '', 
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }
        
        const result = await register({
            username: formData.username,
            email: formData.email,
            password: formData.password
        });
        
        if (result.success) {
            setSuccess('Account created successfully! Please sign in.');
            setTimeout(() => navigate('/login'), 2000);
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
                        Create Account
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

                    {success && (
                        <div style={{
                            background: '#c6f6d5',
                            color: '#2f855a',
                            padding: '12px',
                            borderRadius: '8px',
                            marginBottom: '24px',
                            textAlign: 'center'
                        }}>
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Username</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.username}
                                onChange={(e) => setFormData({...formData, username: e.target.value})}
                                required
                                minLength={3}
                            />
                        </div>

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
                                minLength={6}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Confirm Password</label>
                            <input
                                type="password"
                                className="form-input"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                                required
                                minLength={6}
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="btn btn-primary"
                            style={{ width: '100%', marginBottom: '24px' }}
                            disabled={loading}
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center' }}>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            Already have an account?{' '}
                            <Link to="/login" style={{ 
                                color: 'var(--primary-color)', 
                                textDecoration: 'none',
                                fontWeight: '600'
                            }}>
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </Fade>
        </div>
    );
};

export default RegisterPage;
