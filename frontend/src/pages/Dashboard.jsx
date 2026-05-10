

import React, { useState, useEffect, useCallback } from 'react';
import { TopNav } from 'components/layout/TopNav';
import { EventCard } from 'components/events/EventCard';
import { EventFilters } from 'components/events/EventFilters';
import { eventApi } from '../lib/api';
import { Calendar, TrendingUp, Users, MapPin } from 'lucide-react';
import { Skeleton } from 'components/ui/skeleton';

const StatCard = ({ icon: Icon, label, value, iconColor, glowColor }) => (
    <div
        style={{
            background: 'var(--bg-card)',
            border: '1px solid rgba(139,92,246,0.15)',
            borderRadius: 14,
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            transition: 'border-color 0.2s, box-shadow 0.2s',
            cursor: 'default',
        }}
        onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'rgba(139,92,246,0.35)';
            e.currentTarget.style.boxShadow = `0 4px 20px ${glowColor}`;
        }}
        onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(139,92,246,0.15)';
            e.currentTarget.style.boxShadow = 'none';
        }}
    >
        <div style={{
            width: 48,
            height: 48,
            background: glowColor,
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
        }}>
            <Icon style={{ width: 22, height: 22, color: iconColor }} />
        </div>
        <div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 2 }}>{label}</p>
            <p style={{
                fontSize: '1.75rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                fontFamily: 'Barlow Condensed, sans-serif',
                lineHeight: 1,
            }}>{value}</p>
        </div>
    </div>
);

export default function Dashboard() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({});

    const fetchEvents = useCallback(async (filterParams = {}) => {
        setLoading(true);
        try {
            const params = {};
            if (filterParams.search) params.search = filterParams.search;
            if (filterParams.category) params.category = filterParams.category;
            if (filterParams.location_type) params.location_type = filterParams.location_type;
            if (filterParams.date_from) params.date_from = filterParams.date_from;
            if (filterParams.date_to) params.date_to = filterParams.date_to;
            if (filterParams.sort_by) params.sort_by = filterParams.sort_by;
            if (filterParams.sort_order) params.sort_order = filterParams.sort_order;

            const response = await eventApi.getAll(params);
            setEvents(response.data);
        } catch (error) {
            console.error('Failed to fetch events:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEvents();
        const interval = setInterval(() => fetchEvents(filters), 30000);
        return () => clearInterval(interval);
    }, [fetchEvents, filters]);

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        fetchEvents(newFilters);
    };

    const stats = {
        totalEvents: events.length,
        upcomingEvents: events.filter(e => e.status?.toLowerCase() === 'upcoming').length,
        onlineEvents: events.filter(e => e.location_type?.toLowerCase() === 'online').length,
        offlineEvents: events.filter(e => e.location_type?.toLowerCase() === 'offline').length,
    };

    return (
        <div style={{ minHeight: '100vh' }} data-testid="dashboard-page">
            <TopNav title="Explore Events" showSearch={false} />

            <div style={{ padding: '28px 32px', maxWidth: 1280, margin: '0 auto' }}>

                {/* Stats */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 16,
                    marginBottom: 32,
                }} className="animate-fadeIn">
                    <StatCard icon={Calendar}   label="Total Events"   value={stats.totalEvents}    iconColor="#a78bfa" glowColor="rgba(139,92,246,0.15)" />
                    <StatCard icon={TrendingUp} label="Upcoming"       value={stats.upcomingEvents} iconColor="#4ade80" glowColor="rgba(74,222,128,0.12)" />
                    <StatCard icon={MapPin}     label="Online Events"  value={stats.onlineEvents}   iconColor="#f472b6" glowColor="rgba(236,72,153,0.12)" />
                    <StatCard icon={Users}      label="Offline Events" value={stats.offlineEvents}  iconColor="#fb923c" glowColor="rgba(251,146,60,0.12)" />
                </div>

                {/* Filters */}
                <div style={{ marginBottom: 32 }} className="animate-fadeIn stagger-1">
                    <EventFilters onFilterChange={handleFilterChange} />
                </div>

                {/* Events Grid */}
                {loading ? (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: 24,
                    }}>
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} style={{
                                background: 'var(--bg-card)',
                                borderRadius: 14,
                                border: '1px solid rgba(139,92,246,0.12)',
                                overflow: 'hidden',
                            }}>
                                <Skeleton className="h-40 w-full" />
                                <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    <Skeleton className="h-5 w-3/4" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-2/3" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : events.length === 0 ? (
                    <div className="empty-state">
                        <div style={{
                            width: 72,
                            height: 72,
                            background: 'rgba(139,92,246,0.1)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 20px',
                        }}>
                            <Calendar style={{ width: 32, height: 32, color: 'var(--purple-primary)' }} />
                        </div>
                        <h3 style={{
                            fontSize: '1.3rem',
                            fontWeight: 700,
                            color: 'var(--text-primary)',
                            fontFamily: 'Barlow Condensed, sans-serif',
                            marginBottom: 8,
                        }}>No events found</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            Try adjusting your filters
                        </p>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: 24,
                    }} className="animate-fadeIn stagger-2">
                        {events.map((event) => (
                            <EventCard key={event.id} event={event} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
