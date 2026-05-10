import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, Tag } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { format } from 'date-fns';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const EventCard = ({ event }) => {
    const seatsLeft = event.max_participants - event.current_participants;
    const seatsPercentage = (event.current_participants / event.max_participants) * 100;

    const getSeatsClass = () => {
        if (seatsLeft === 0) return 'seats-full';
        if (seatsPercentage >= 80) return 'seats-low';
        return 'seats-available';
    };

    const getStatusBadge = () => {
        const statusClasses = {
            upcoming: 'status-upcoming',
            ongoing: 'status-ongoing',
            completed: 'status-completed',
        };
        return statusClasses[event.status] || 'status-upcoming';
    };

    const formatEventDate = (dateStr) => {
        try {
            return format(new Date(dateStr), 'EEE, MMM d, yyyy');
        } catch {
            return dateStr;
        }
    };

    const bannerUrl = event.banner_url
        ? (event.banner_url.startsWith('http') ? event.banner_url : `${BACKEND_URL}${event.banner_url}`)
        : 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2070&auto=format&fit=crop';

    return (
        <Link to={`/events/${event.id}`} style={{ display: 'block', textDecoration: 'none' }} data-testid={`event-card-${event.id}`}>
            <article className="event-card">
                <div style={{ position: 'relative', height: 160, overflow: 'hidden' }}>
                    <img
                        src={bannerUrl}
                        alt={event.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2070&auto=format&fit=crop';
                        }}
                    />
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, rgba(15,14,26,0.7) 0%, transparent 60%)',
                    }} />
                    <div style={{ position: 'absolute', top: 10, left: 10 }}>
                        <Badge className={`${getStatusBadge()} border-0 capitalize`} style={{ fontSize: '0.7rem' }}>
                            {event.status}
                        </Badge>
                    </div>
                    <div style={{ position: 'absolute', top: 10, right: 10 }}>
                        <Badge style={{
                            background: 'rgba(15,14,26,0.7)',
                            color: '#f0eeff',
                            border: '1px solid rgba(139,92,246,0.3)',
                            backdropFilter: 'blur(8px)',
                            fontSize: '0.7rem',
                        }}>
                            <Tag style={{ width: 10, height: 10, marginRight: 4 }} />
                            {event.category}
                        </Badge>
                    </div>
                </div>

                <div style={{ padding: '16px 18px 18px' }}>
                    <h3 style={{
                        fontFamily: 'Barlow Condensed, sans-serif',
                        fontSize: '1.15rem',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        marginBottom: 6,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}>
                        {event.title}
                    </h3>
                    <p style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-muted)',
                        marginBottom: 14,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: 1.5,
                    }}>
                        {event.description}
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 7, fontSize: '0.8rem' }}>
                        {[
                            { Icon: Calendar, text: formatEventDate(event.date) },
                            { Icon: Clock, text: event.time },
                            { Icon: MapPin, text: event.location },
                        ].map(({ Icon, text }, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)' }}>
                                <Icon style={{ width: 13, height: 13, color: 'var(--purple-primary)', flexShrink: 0 }} />
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{text}</span>
                            </div>
                        ))}
                    </div>

                    <div style={{
                        marginTop: 14,
                        paddingTop: 14,
                        borderTop: '1px solid rgba(139,92,246,0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Users style={{ width: 13, height: 13, color: 'var(--text-muted)' }} />
                            <span className={`text-sm ${getSeatsClass()}`} style={{ fontSize: '0.8rem' }}>
                                {seatsLeft === 0 ? 'Full' : `${seatsLeft} seats left`}
                            </span>
                        </div>
                        <span style={{
                            fontSize: '0.72rem',
                            color: 'var(--text-muted)',
                            background: 'rgba(139,92,246,0.08)',
                            padding: '2px 8px',
                            borderRadius: 20,
                            border: '1px solid rgba(139,92,246,0.15)',
                        }}>
                            {event.location_type === 'online' ? 'Online' : 'In-person'}
                        </span>
                    </div>
                </div>
            </article>
        </Link>
    );
};

export default EventCard;
