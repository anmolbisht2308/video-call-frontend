'use client';
import { createContext, useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        checkUserLoggedIn();
    }, []);

    const checkUserLoggedIn = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/auth/profile', {
                credentials: 'include' // Important for cookies
            });
            if (res.ok) {
                const data = await res.json();
                setUser(data);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error(error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const res = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            credentials: 'include'
        });
        const data = await res.json();
        if (res.ok) {
            setUser(data);
            router.push('/');
        } else {
            throw new Error(data.message || 'Login failed');
        }
    };

    const register = async (username, email, password, role) => {
        const res = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password, role }),
            credentials: 'include'
        });
        const data = await res.json();
        if (res.ok) {
            setUser(data);
            router.push('/');
        } else {
            throw new Error(data.message || 'Registration failed');
        }
    };

    const logout = async () => {
        await fetch('http://localhost:5000/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
