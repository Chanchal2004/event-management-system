


import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Search } from 'lucide-react';
import { Input } from 'components/ui/input';
import { notificationApi } from '../lib/api';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from 'components/ui/dropdown-menu';

export const TopNav = ({ title, onSearch, showSearch = true }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [searchValue, setSearchValue] = useState('');

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await notificationApi.getAll();
            setNotifications(response.data.slice(0, 5));
            setUnreadCount(response.data.filter(n => !n.read).length);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (onSearch) onSearch(searchValue);
    };

    const handleMarkRead = async (id) => {
        try {
            await notificationApi.markRead(id);
            fetchNotifications();
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    return (
        <header className="glass-header sticky top-0 z-40 px-6 py-4" data-testid="top-nav">
            <div className="flex items-center justify-between gap-4">
                <h1 style={{
                    fontFamily: 'Barlow Condensed, sans-serif',
                    fontSize: '1.6rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    letterSpacing: '0.01em',
                }}>
                    {title}
                </h1>

                <div className="flex items-center gap-3">
                    {showSearch && (
                        <form onSubmit={handleSearch} className="hidden md:flex items-center">
                            <div className="relative">
                                <Search style={{
                                    position: 'absolute',
                                    left: 12,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    width: 15,
                                    height: 15,
                                    color: 'var(--text-muted)',
                                }} />
                                <Input
                                    type="text"
                                    placeholder="Search events..."
                                    value={searchValue}
                                    onChange={(e) => setSearchValue(e.target.value)}
                                    style={{ paddingLeft: 36, width: 240 }}
                                    data-testid="search-input"
                                />
                            </div>
                        </form>
                    )}

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                data-testid="notifications-btn"
                                style={{
                                    position: 'relative',
                                    width: 38,
                                    height: 38,
                                    borderRadius: 10,
                                    border: '1px solid rgba(139,92,246,0.2)',
                                    background: 'rgba(139,92,246,0.08)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(139,92,246,0.2)'}
                            >
                                <Bell style={{ width: 17, height: 17, color: 'var(--purple-bright)' }} />
                                {unreadCount > 0 && (
                                    <span className="notification-badge">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" style={{ width: 300 }}>
                            <div style={{
                                padding: '10px 14px',
                                borderBottom: '1px solid rgba(139,92,246,0.15)',
                            }}>
                                <h3 style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                                    Notifications
                                </h3>
                            </div>
                            {notifications.length === 0 ? (
                                <div style={{ padding: 16, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                    No notifications
                                </div>
                            ) : (
                                notifications.map((notif) => (
                                    <DropdownMenuItem
                                        key={notif.id}
                                        style={{
                                            padding: '10px 14px',
                                            cursor: 'pointer',
                                            background: !notif.read ? 'rgba(139,92,246,0.08)' : 'transparent',
                                        }}
                                        onClick={() => handleMarkRead(notif.id)}
                                    >
                                        <div>
                                            <p style={{ fontWeight: 500, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                                                {notif.title}
                                            </p>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                                                {notif.message}
                                            </p>
                                        </div>
                                    </DropdownMenuItem>
                                ))
                            )}
                            <div style={{
                                padding: '8px 14px',
                                borderTop: '1px solid rgba(139,92,246,0.15)',
                            }}>
                                <Link to="/notifications" style={{
                                    fontSize: '0.8rem',
                                    color: 'var(--purple-bright)',
                                    textDecoration: 'none',
                                }}>
                                    View all notifications
                                </Link>
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
};

export default TopNav;
