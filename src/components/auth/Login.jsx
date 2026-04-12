import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import styles from './Auth.module.css';

const Login = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleLogin = async () => {
        try {
            setLoading(true);
            setError(null);

            const redirectUrl = import.meta.env.VITE_APP_URL || window.location.origin;
            console.log('Login Redirect URL:', redirectUrl);

            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'azure',
                options: {
                    scopes: 'email',
                    redirectTo: redirectUrl,
                    queryParams: {
                        prompt: 'select_account'
                    }
                }
            });
            if (error) throw error;
        } catch (err) {
            console.error('Login error:', err);
            setError('Falha ao iniciar login com Microsoft 365.');
            setLoading(false);
        }
    };

    return (
        <div className={styles.authContainer}>
            <div className={styles.authCard} style={{ maxWidth: 420 }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Gestão Pessoal</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        Faça login com sua conta corporativa para continuar.
                    </p>
                </div>

                {error && (
                    <div style={{
                        padding: '12px',
                        backgroundColor: '#FEF2F2',
                        color: '#DC2626',
                        borderRadius: '6px',
                        marginBottom: '16px',
                        fontSize: '0.9rem'
                    }}>
                        {error}
                    </div>
                )}

                <button
                    onClick={handleLogin}
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: '#2F2F2F',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '1rem',
                        fontWeight: '500',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        transition: 'background-color 0.2s'
                    }}
                >
                    {loading ? 'Redirecionando...' : (
                        <>
                            <svg width="20" height="20" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fill="#F35325" d="M11 11H1V1H11V11Z" />
                                <path fill="#81BC06" d="M22 11H12V1H22V11Z" />
                                <path fill="#05A6F0" d="M11 22H1V12H11V22Z" />
                                <path fill="#FFBA08" d="M22 22H12V12H22V22Z" />
                            </svg>
                            Entrar com Microsoft 365
                        </>
                    )}
                </button>

                <div style={{ marginTop: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    Apenas contas com domínio <strong>defysolutions.com.br</strong> são permitidas.
                </div>
            </div>
        </div>
    );
};

export default Login;
