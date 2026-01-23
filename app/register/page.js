'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import styles from '../../app/page.module.css'; // Reuse existing styles
import Link from 'next/link';

export default function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const { register } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            await register(username, email, password);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>Register</h1>
                <p className={styles.subtitle}>Create your secure account</p>

                {error && <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className={styles.input}
                            required
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.input}
                            required
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={styles.input}
                            required
                        />
                    </div>
                    <button type="submit" className={styles.buttonPrimary}>
                        Register
                    </button>
                </form>

                <div className={styles.divider}>
                    <span>OR</span>
                </div>

                <div style={{ textAlign: 'center', marginTop: '1rem', color: '#9ca3af' }}>
                    Already have an account? <Link href="/login" style={{ color: '#60a5fa' }}>Login</Link>
                </div>
            </div>
        </div>
    );
}
