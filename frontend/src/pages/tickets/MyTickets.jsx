// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import { QRCodeSVG } from 'qrcode.react';
// import { registrationApi, eventApi } from 'lib/api';
// import { TopNav } from 'components/layout/TopNav';
// import { Card, CardContent } from 'components/ui/card';
// import { Button } from 'components/ui/button';
// import { Badge } from 'components/ui/badge';
// import { Skeleton } from 'components/ui/skeleton';
// import { format } from 'date-fns';
// import { Ticket, Calendar, Clock, MapPin, Download, ExternalLink } from 'lucide-react';

// export default function MyTickets() {
//     const [registrations, setRegistrations] = useState([]);
//     const [events, setEvents] = useState({});
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         fetchData();
//     }, []);

//     const fetchData = async () => {
//         try {
//             const regResponse = await registrationApi.getMyRegistrations();
//             setRegistrations(regResponse.data);

//             // Fetch event details for each registration
//             const eventDetails = {};
//             for (const reg of regResponse.data) {
//                 try {
//                     const eventRes = await eventApi.getOne(reg.event_id);
//                     eventDetails[reg.event_id] = eventRes.data;
//                 } catch (error) {
//                     console.error(`Failed to fetch event ${reg.event_id}:`, error);
//                 }
//             }
//             setEvents(eventDetails);
//         } catch (error) {
//             console.error('Failed to fetch registrations:', error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const downloadQRCode = (registrationId, eventTitle) => {
//         const svg = document.getElementById(`qr-${registrationId}`);
//         if (!svg) return;

//         const svgData = new XMLSerializer().serializeToString(svg);
//         const canvas = document.createElement('canvas');
//         const ctx = canvas.getContext('2d');
//         const img = new Image();

//         img.onload = () => {
//             canvas.width = img.width;
//             canvas.height = img.height;
//             ctx.fillStyle = 'white';
//             ctx.fillRect(0, 0, canvas.width, canvas.height);
//             ctx.drawImage(img, 0, 0);
            
//             const pngFile = canvas.toDataURL('image/png');
//             const downloadLink = document.createElement('a');
//             downloadLink.download = `ticket-${eventTitle.replace(/\s+/g, '-').toLowerCase()}.png`;
//             downloadLink.href = pngFile;
//             downloadLink.click();
//         };

//         img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
//     };

//     if (loading) {
//         return (
//             <div data-testid="my-tickets-loading">
//                 <TopNav title="My Tickets" showSearch={false} />
//                 <div className="p-6 max-w-5xl mx-auto">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                         {[1, 2, 3, 4].map((i) => (
//                             <Skeleton key={i} className="h-64 rounded-xl" />
//                         ))}
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div data-testid="my-tickets-page">
//             <TopNav title="My Tickets" showSearch={false} />

//             <div className="p-6 max-w-5xl mx-auto">
//                 {registrations.length === 0 ? (
//                     <div className="empty-state">
//                         <Ticket className="w-16 h-16 mx-auto text-slate-300 mb-4" />
//                         <h3 className="text-xl font-semibold text-slate-700 mb-2">No tickets yet</h3>
//                         <p className="text-slate-500 mb-6">Register for events to get your digital tickets</p>
//                         <Link to="/dashboard">
//                             <Button data-testid="browse-events-btn">Browse Events</Button>
//                         </Link>
//                     </div>
//                 ) : (
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                         {registrations.map((reg) => {
//                             const event = events[reg.event_id];
//                             const qrData = JSON.stringify({
//                                 registration_id: reg.id,
//                                 event_id: reg.event_id,
//                                 user_id: reg.user_id,
//                                 event_title: reg.event_title,
//                             });

//                             return (
//                                 <Card key={reg.id} className="qr-ticket animate-fadeIn" data-testid={`ticket-${reg.id}`}>
//                                     <CardContent className="p-6">
//                                         <div className="flex items-start justify-between mb-4">
//                                             <div>
//                                                 <h3 className="text-lg font-semibold text-slate-800" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
//                                                     {reg.event_title}
//                                                 </h3>
//                                                 {event && (
//                                                     <Badge className={`mt-1 ${event.status === 'upcoming' ? 'status-upcoming' : event.status === 'ongoing' ? 'status-ongoing' : 'status-completed'} capitalize`}>
//                                                         {event.status}
//                                                     </Badge>
//                                                 )}
//                                             </div>
//                                             <Link to={`/events/${reg.event_id}`}>
//                                                 <Button variant="ghost" size="icon" data-testid={`view-event-${reg.id}`}>
//                                                     <ExternalLink className="w-4 h-4" />
//                                                 </Button>
//                                             </Link>
//                                         </div>

//                                         {event && (
//                                             <div className="space-y-2 text-sm text-slate-600 mb-4">
//                                                 <div className="flex items-center gap-2">
//                                                     <Calendar className="w-4 h-4 text-blue-500" />
//                                                     <span>{format(new Date(event.date), 'EEE, MMM d, yyyy')}</span>
//                                                 </div>
//                                                 <div className="flex items-center gap-2">
//                                                     <Clock className="w-4 h-4 text-blue-500" />
//                                                     <span>{event.time}</span>
//                                                 </div>
//                                                 <div className="flex items-center gap-2">
//                                                     <MapPin className="w-4 h-4 text-blue-500" />
//                                                     <span className="truncate">{event.location}</span>
//                                                 </div>
//                                             </div>
//                                         )}

//                                         <div className="flex flex-col items-center border-t border-dashed border-blue-200 pt-4">
//                                             <p className="text-sm text-slate-500 mb-3">Scan for entry</p>
//                                             <div className="bg-white p-3 rounded-lg border border-slate-200">
//                                                 <QRCodeSVG
//                                                     id={`qr-${reg.id}`}
//                                                     value={qrData}
//                                                     size={140}
//                                                     level="H"
//                                                     includeMargin={true}
//                                                 />
//                                             </div>
//                                             <Button
//                                                 variant="ghost"
//                                                 size="sm"
//                                                 className="mt-3 text-blue-600"
//                                                 onClick={() => downloadQRCode(reg.id, reg.event_title)}
//                                                 data-testid={`download-qr-${reg.id}`}
//                                             >
//                                                 <Download className="w-4 h-4 mr-2" />
//                                                 Download QR
//                                             </Button>
//                                         </div>

//                                         <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400 text-center">
//                                             Registered: {format(new Date(reg.registered_at), 'MMM d, yyyy')}
//                                         </div>
//                                     </CardContent>
//                                 </Card>
//                             );
//                         })}
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// }


import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { registrationApi, eventApi } from 'lib/api';
import { TopNav } from 'components/layout/TopNav';
import { Badge } from 'components/ui/badge';
import { Skeleton } from 'components/ui/skeleton';
import { format } from 'date-fns';
import { Ticket, Calendar, Clock, MapPin, Download, ExternalLink } from 'lucide-react';

export default function MyTickets() {
    const [registrations, setRegistrations] = useState([]);
    const [events, setEvents] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const regResponse = await registrationApi.getMyRegistrations();
            setRegistrations(regResponse.data);
            const eventDetails = {};
            for (const reg of regResponse.data) {
                try {
                    const eventRes = await eventApi.getOne(reg.event_id);
                    eventDetails[reg.event_id] = eventRes.data;
                } catch (error) {
                    console.error(`Failed to fetch event ${reg.event_id}:`, error);
                }
            }
            setEvents(eventDetails);
        } catch (error) {
            console.error('Failed to fetch registrations:', error);
        } finally {
            setLoading(false);
        }
    };

    const downloadQRCode = (registrationId, eventTitle) => {
        const svg = document.getElementById(`qr-${registrationId}`);
        if (!svg) return;
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            const pngFile = canvas.toDataURL('image/png');
            const downloadLink = document.createElement('a');
            downloadLink.download = `ticket-${eventTitle.replace(/\s+/g, '-').toLowerCase()}.png`;
            downloadLink.href = pngFile;
            downloadLink.click();
        };
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    };

    if (loading) {
        return (
            <div data-testid="my-tickets-loading">
                <TopNav title="My Tickets" showSearch={false} />
                <div style={{ padding: '28px 32px', maxWidth: 900, margin: '0 auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} style={{
                                background: 'var(--bg-card)',
                                borderRadius: 16,
                                border: '1px solid rgba(139,92,246,0.15)',
                                overflow: 'hidden',
                                height: 280,
                            }}>
                                <Skeleton className="h-full w-full" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div data-testid="my-tickets-page" style={{ minHeight: '100vh' }}>
            <TopNav title="My Tickets" showSearch={false} />

            <div style={{ padding: '28px 32px', maxWidth: 900, margin: '0 auto' }}>
                {registrations.length === 0 ? (
                    <div style={{ textAlign: 'center', paddingTop: 80 }}>
                        <div style={{
                            width: 80,
                            height: 80,
                            background: 'rgba(139,92,246,0.1)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 20px',
                        }}>
                            <Ticket style={{ width: 36, height: 36, color: 'var(--purple-primary)' }} />
                        </div>
                        <h3 style={{
                            fontSize: '1.4rem',
                            fontWeight: 700,
                            color: 'var(--text-primary)',
                            fontFamily: 'Barlow Condensed, sans-serif',
                            marginBottom: 8,
                        }}>No tickets yet</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: '0.9rem' }}>
                            Register for events to get your digital tickets
                        </p>
                        <Link to="/dashboard">
                            <button
                                data-testid="browse-events-btn"
                                style={{
                                    background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 10,
                                    padding: '10px 28px',
                                    fontSize: '0.9rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'opacity 0.2s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                            >
                                Browse Events
                            </button>
                        </Link>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: 24,
                    }}>
                        {registrations.map((reg) => {
                            const event = events[reg.event_id];
                            const qrData = JSON.stringify({
                                registration_id: reg.id,
                                event_id: reg.event_id,
                                user_id: reg.user_id,
                                event_title: reg.event_title,
                            });

                            return (
                                <div
                                    key={reg.id}
                                    className="animate-fadeIn"
                                    data-testid={`ticket-${reg.id}`}
                                    style={{
                                        background: 'var(--bg-card)',
                                        border: '1px solid rgba(139,92,246,0.2)',
                                        borderRadius: 16,
                                        overflow: 'hidden',
                                        transition: 'border-color 0.2s, box-shadow 0.2s',
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.borderColor = 'rgba(139,92,246,0.4)';
                                        e.currentTarget.style.boxShadow = '0 8px 32px rgba(139,92,246,0.12)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.borderColor = 'rgba(139,92,246,0.2)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    {/* Header */}
                                    <div style={{
                                        padding: '18px 20px 14px',
                                        background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(236,72,153,0.08))',
                                        borderBottom: '1px solid rgba(139,92,246,0.15)',
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        justifyContent: 'space-between',
                                        gap: 8,
                                    }}>
                                        <div style={{ minWidth: 0 }}>
                                            <h3 style={{
                                                fontFamily: 'Barlow Condensed, sans-serif',
                                                fontSize: '1.1rem',
                                                fontWeight: 700,
                                                color: 'var(--text-primary)',
                                                marginBottom: 6,
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            }}>
                                                {reg.event_title}
                                            </h3>
                                            {event && (
                                                <Badge className={`${event.status === 'upcoming' ? 'status-upcoming' : event.status === 'ongoing' ? 'status-ongoing' : 'status-completed'} capitalize`}
                                                    style={{ fontSize: '0.68rem' }}>
                                                    {event.status}
                                                </Badge>
                                            )}
                                        </div>
                                        <Link to={`/events/${reg.event_id}`} style={{ flexShrink: 0 }}>
                                            <button
                                                data-testid={`view-event-${reg.id}`}
                                                style={{
                                                    width: 32,
                                                    height: 32,
                                                    borderRadius: 8,
                                                    border: '1px solid rgba(139,92,246,0.25)',
                                                    background: 'rgba(139,92,246,0.1)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    color: 'var(--purple-bright)',
                                                }}
                                            >
                                                <ExternalLink style={{ width: 14, height: 14 }} />
                                            </button>
                                        </Link>
                                    </div>

                                    {/* Event details */}
                                    <div style={{ padding: '14px 20px' }}>
                                        {event && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                                                {[
                                                    { Icon: Calendar, text: format(new Date(event.date), 'EEE, MMM d, yyyy') },
                                                    { Icon: Clock,    text: event.time },
                                                    { Icon: MapPin,   text: event.location },
                                                ].map(({ Icon, text }, i) => (
                                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                                                        <Icon style={{ width: 13, height: 13, color: 'var(--purple-primary)', flexShrink: 0 }} />
                                                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{text}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* QR Section */}
                                        <div style={{
                                            borderTop: '1px dashed rgba(139,92,246,0.3)',
                                            paddingTop: 16,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                        }}>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                                                Scan for entry
                                            </p>
                                            <div style={{
                                                background: '#fff',
                                                padding: 12,
                                                borderRadius: 12,
                                                border: '1px solid rgba(139,92,246,0.2)',
                                                boxShadow: '0 0 24px rgba(139,92,246,0.15)',
                                            }}>
                                                <QRCodeSVG
                                                    id={`qr-${reg.id}`}
                                                    value={qrData}
                                                    size={130}
                                                    level="H"
                                                    includeMargin={true}
                                                />
                                            </div>
                                            <button
                                                onClick={() => downloadQRCode(reg.id, reg.event_title)}
                                                data-testid={`download-qr-${reg.id}`}
                                                style={{
                                                    marginTop: 12,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 6,
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: 'var(--purple-bright)',
                                                    fontSize: '0.8rem',
                                                    cursor: 'pointer',
                                                    padding: '6px 12px',
                                                    borderRadius: 8,
                                                    transition: 'background 0.2s',
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.1)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <Download style={{ width: 13, height: 13 }} />
                                                Download QR
                                            </button>
                                        </div>

                                        {/* Footer */}
                                        <div style={{
                                            marginTop: 14,
                                            paddingTop: 12,
                                            borderTop: '1px solid rgba(139,92,246,0.1)',
                                            textAlign: 'center',
                                            fontSize: '0.72rem',
                                            color: 'var(--text-muted)',
                                        }}>
                                            Registered: {format(new Date(reg.registered_at), 'MMM d, yyyy')}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}