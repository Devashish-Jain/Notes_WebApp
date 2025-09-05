import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Parallax } from 'react-scroll-parallax';
import { Fade, Zoom } from 'react-awesome-reveal';
import CountUp from 'react-countup';
import axios from 'axios';

interface Stats {
    totalUsers: number;
    totalNotes: number;
    totalSharedLinks: number;
    satisfactionRate: number;
}

const HomePage: React.FC = () => {
    const [stats, setStats] = useState<Stats>({
        totalUsers: 0,
        totalNotes: 0,
        totalSharedLinks: 0,
        satisfactionRate: 95
    });
    const [statsLoading, setStatsLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            console.log('[HomePage] Fetching real stats from API...');
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/public/stats`);
            console.log('[HomePage] Stats received:', response.data);
            setStats({
                totalUsers: response.data.totalUsers || 0,
                totalNotes: response.data.totalNotes || 0,
                totalSharedLinks: response.data.totalSharedLinks || 0,
                satisfactionRate: response.data.satisfactionRate || 95
            });
        } catch (error) {
            console.error('[HomePage] Failed to fetch stats, using fallback:', error);
            // Use fallback values if API fails
            setStats({
                totalUsers: 1,
                totalNotes: 0,
                totalSharedLinks: 0,
                satisfactionRate: 95
            });
        } finally {
            setStatsLoading(false);
        }
    };

    return (
        <div style={{ paddingTop: '80px' }}>
            {/* Hero Section with Parallax */}
            <section className="parallax-section">
                <Parallax speed={-20} className="parallax-bg">
                    <div className="parallax-bg"></div>
                </Parallax>
                
                <Parallax speed={5} className="parallax-content">
                    <div className="parallax-content">
                        <Fade direction="up" triggerOnce>
                            <h1 className="parallax-title">
                                Your Ideas, Organized & Shared
                            </h1>
                        </Fade>
                        
                        <Fade direction="up" delay={200} triggerOnce>
                            <p className="parallax-subtitle">
                                Create, organize, and share your notes with advanced features 
                                and beautiful visual effects. Experience the future of note-taking.
                            </p>
                        </Fade>
                        
                        <Fade direction="up" delay={400} triggerOnce>
                            <div style={{ 
                                display: 'flex', 
                                gap: '16px', 
                                justifyContent: 'center',
                                flexWrap: 'wrap',
                                marginTop: '32px'
                            }}>
                                <Link to="/register" className="btn btn-primary" style={{
                                    padding: '16px 32px',
                                    fontSize: '18px',
                                    textDecoration: 'none'
                                }}>
                                    Get Started Free
                                </Link>
                                <Link to="/login" className="btn btn-secondary" style={{
                                    padding: '16px 32px',
                                    fontSize: '18px',
                                    textDecoration: 'none',
                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                    color: 'white',
                                    border: '2px solid rgba(255, 255, 255, 0.3)'
                                }}>
                                    Sign In
                                </Link>
                            </div>
                        </Fade>
                    </div>
                </Parallax>
            </section>

            {/* Stats Section with Counter Animation */}
            <section className="stats-section">
                <div className="container">
                    <Fade direction="up" triggerOnce>
                        <h2 style={{
                            fontSize: '2.5rem',
                            fontWeight: '700',
                            marginBottom: '16px',
                            textAlign: 'center'
                        }}>
                            Trusted by Creators
                        </h2>
                        <p style={{
                            fontSize: '1.125rem',
                            color: 'var(--text-secondary)',
                            textAlign: 'center',
                            maxWidth: '600px',
                            margin: '0 auto'
                        }}>
                            Join thousands of users who have made NotesApp their go-to productivity tool.
                        </p>
                    </Fade>

                    <div className="stats-grid">
                        <Fade direction="up" triggerOnce>
                            <div className="stat-item">
                                {statsLoading ? (
                                    <div className="stat-number" style={{ opacity: 0.5 }}>--</div>
                                ) : (
                                    <CountUp 
                                        end={stats.totalNotes} 
                                        enableScrollSpy 
                                        scrollSpyOnce
                                        className="stat-number"
                                        duration={2.5}
                                    />
                                )}
                                <div className="stat-label">Notes Created</div>
                            </div>
                        </Fade>

                        <Fade direction="up" triggerOnce delay={100}>
                            <div className="stat-item">
                                {statsLoading ? (
                                    <div className="stat-number" style={{ opacity: 0.5 }}>--</div>
                                ) : (
                                    <CountUp 
                                        end={stats.totalUsers} 
                                        enableScrollSpy 
                                        scrollSpyOnce
                                        className="stat-number"
                                        duration={2.5}
                                    />
                                )}
                                <div className="stat-label">Active Users</div>
                            </div>
                        </Fade>

                        <Fade direction="up" triggerOnce delay={200}>
                            <div className="stat-item">
                                {statsLoading ? (
                                    <div className="stat-number" style={{ opacity: 0.5 }}>--</div>
                                ) : (
                                    <CountUp 
                                        end={stats.totalSharedLinks} 
                                        enableScrollSpy 
                                        scrollSpyOnce
                                        className="stat-number"
                                        duration={2.5}
                                    />
                                )}
                                <div className="stat-label">Shared Links</div>
                            </div>
                        </Fade>

                        <Fade direction="up" triggerOnce delay={300}>
                            <div className="stat-item">
                                {statsLoading ? (
                                    <div className="stat-number" style={{ opacity: 0.5 }}>--%</div>
                                ) : (
                                    <CountUp 
                                        end={stats.satisfactionRate} 
                                        suffix="%" 
                                        enableScrollSpy 
                                        scrollSpyOnce
                                        className="stat-number"
                                        duration={2.5}
                                    />
                                )}
                                <div className="stat-label">Satisfaction Rate</div>
                            </div>
                        </Fade>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section style={{ 
                background: 'linear-gradient(135deg, #f7fafc, #edf2f7)',
                padding: '80px 0' 
            }}>
                <div className="container">
                    <Fade direction="up" triggerOnce>
                        <h2 style={{
                            fontSize: '2.5rem',
                            fontWeight: '700',
                            marginBottom: '16px',
                            textAlign: 'center'
                        }}>
                            Powerful Features
                        </h2>
                        <p style={{
                            fontSize: '1.125rem',
                            color: 'var(--text-secondary)',
                            textAlign: 'center',
                            maxWidth: '600px',
                            margin: '0 auto 48px'
                        }}>
                            Everything you need to organize, create, and collaborate on your ideas.
                        </p>
                    </Fade>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '32px',
                        marginTop: '48px'
                    }}>
                        <Zoom triggerOnce>
                            <div style={{
                                background: 'white',
                                padding: '32px',
                                borderRadius: '12px',
                                textAlign: 'center',
                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
                                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                            }} className="feature-card">
                                <div style={{
                                    width: '64px',
                                    height: '64px',
                                    background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
                                    borderRadius: '50%',
                                    margin: '0 auto 16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '24px',
                                    color: 'white'
                                }}>
                                    📝
                                </div>
                                <h3 style={{ marginBottom: '12px', fontSize: '1.25rem', fontWeight: '600' }}>
                                    Rich Text Editor
                                </h3>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                                    Create beautiful notes with our intuitive editor. Add images, format text, and organize your thoughts.
                                </p>
                            </div>
                        </Zoom>

                        <Zoom triggerOnce delay={100}>
                            <div style={{
                                background: 'white',
                                padding: '32px',
                                borderRadius: '12px',
                                textAlign: 'center',
                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
                                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                            }} className="feature-card">
                                <div style={{
                                    width: '64px',
                                    height: '64px',
                                    background: 'linear-gradient(135deg, var(--accent-color), var(--primary-color))',
                                    borderRadius: '50%',
                                    margin: '0 auto 16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '24px',
                                    color: 'white'
                                }}>
                                    🔗
                                </div>
                                <h3 style={{ marginBottom: '12px', fontSize: '1.25rem', fontWeight: '600' }}>
                                    Smart Sharing
                                </h3>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                                    Share your notes with viewer or editor access. Collaborate in real-time with your team.
                                </p>
                            </div>
                        </Zoom>

                        <Zoom triggerOnce delay={200}>
                            <div style={{
                                background: 'white',
                                padding: '32px',
                                borderRadius: '12px',
                                textAlign: 'center',
                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
                                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                            }} className="feature-card">
                                <div style={{
                                    width: '64px',
                                    height: '64px',
                                    background: 'linear-gradient(135deg, var(--secondary-color), var(--accent-color))',
                                    borderRadius: '50%',
                                    margin: '0 auto 16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '24px',
                                    color: 'white'
                                }}>
                                    🖼️
                                </div>
                                <h3 style={{ marginBottom: '12px', fontSize: '1.25rem', fontWeight: '600' }}>
                                    Image Gallery
                                </h3>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                                    Upload multiple images with slideshow viewing. Perfect for visual notes and documentation.
                                </p>
                            </div>
                        </Zoom>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section style={{
                background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
                color: 'white',
                padding: '80px 0',
                textAlign: 'center'
            }}>
                <div className="container">
                    <Fade direction="up" triggerOnce>
                        <h2 style={{
                            fontSize: '2.5rem',
                            fontWeight: '700',
                            marginBottom: '16px'
                        }}>
                            Ready to Transform Your Note-Taking?
                        </h2>
                        <p style={{
                            fontSize: '1.125rem',
                            opacity: 0.9,
                            maxWidth: '600px',
                            margin: '0 auto 32px'
                        }}>
                            Join thousands of users who have revolutionized their productivity with our advanced note-taking platform.
                        </p>
                        <div style={{
                            display: 'flex',
                            gap: '16px',
                            justifyContent: 'center',
                            flexWrap: 'wrap'
                        }}>
                            <Link to="/register" className="btn" style={{
                                background: 'white',
                                color: 'var(--primary-color)',
                                padding: '16px 32px',
                                fontSize: '18px',
                                fontWeight: '600',
                                textDecoration: 'none',
                                borderRadius: '12px',
                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                            }}>
                                Start Free Today
                            </Link>
                        </div>
                    </Fade>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
