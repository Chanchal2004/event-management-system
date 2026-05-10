import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';   // FIXED
import { Sidebar } from './Sidebar';
import { Toaster } from 'sonner';   // FIXED

export const MainLayout = () => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-primary)',
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                    <div style={{
                        width: 48,
                        height: 48,
                        border: '3px solid rgba(139,92,246,0.2)',
                        borderTopColor: '#8b5cf6',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                    }} />
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <Sidebar />
            <main className="main-content">
                <Outlet />
            </main>
            <Toaster position="top-right" richColors />
        </div>
    );
};

export default MainLayout;
