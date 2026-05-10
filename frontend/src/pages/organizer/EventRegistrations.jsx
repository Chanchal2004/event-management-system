import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventApi, registrationApi } from '../../lib/api';
import { TopNav } from 'components/layout/TopNav';
import { Card, CardContent, CardHeader, CardTitle } from 'components/ui/card';
import { Button } from 'components/ui/button';
import { Badge } from 'components/ui/badge';
import { Skeleton } from 'components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from 'components/ui/table';
import { format } from 'date-fns';
import { ArrowLeft, Users, Mail, Calendar, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function EventRegistrations() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const [eventRes, regsRes] = await Promise.all([
                eventApi.getOne(id),
                registrationApi.getEventRegistrations(id),
            ]);
            setEvent(eventRes.data);
            setRegistrations(regsRes.data);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            toast.error('Failed to load registrations');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const exportToCSV = () => {
        const headers = ['Name', 'Email', 'Registered At'];
        const rows = registrations.map(r => [
            r.user_name,
            r.user_email,
            format(new Date(r.registered_at), 'yyyy-MM-dd HH:mm'),
        ]);

        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `registrations-${event?.title.replace(/\s+/g, '-').toLowerCase()}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div data-testid="registrations-loading">
                <TopNav title="Event Registrations" showSearch={false} />
                <div className="p-6 max-w-5xl mx-auto">
                    <Skeleton className="h-8 w-48 mb-4" />
                    <Skeleton className="h-64 rounded-xl" />
                </div>
            </div>
        );
    }

    return (
        <div data-testid="event-registrations-page">
            <TopNav title="Event Registrations" showSearch={false} />

            <div className="p-6 max-w-5xl mx-auto">
                <Button
                    variant="ghost"
                    className="mb-4 text-slate-600"
                    onClick={() => navigate(-1)}
                    data-testid="back-btn"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>

                {event && (
                    <Card className="mb-6">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                                        {event.title}
                                    </h2>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            {format(new Date(event.date), 'MMM d, yyyy')} at {event.time}
                                        </span>
                                        <Badge className={`${event.status === 'upcoming' ? 'status-upcoming' : event.status === 'ongoing' ? 'status-ongoing' : 'status-completed'} capitalize`}>
                                            {event.status}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-slate-500">Registrations</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {event.current_participants} / {event.max_participants}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                                <Users className="w-5 h-5" />
                                Registered Attendees ({registrations.length})
                            </CardTitle>
                            {registrations.length > 0 && (
                                <Button variant="outline" size="sm" onClick={exportToCSV} data-testid="export-csv-btn">
                                    <Download className="w-4 h-4 mr-2" />
                                    Export CSV
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {registrations.length === 0 ? (
                            <div className="empty-state py-12">
                                <Users className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                                <h3 className="text-lg font-semibold text-slate-700 mb-2">No registrations yet</h3>
                                <p className="text-slate-500">Share your event to get more attendees!</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>#</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Registered At</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {registrations.map((reg, index) => (
                                        <TableRow key={reg.id} data-testid={`registration-${reg.id}`}>
                                            <TableCell className="text-slate-500">{index + 1}</TableCell>
                                            <TableCell className="font-medium">{reg.user_name}</TableCell>
                                            <TableCell>
                                                <a href={`mailto:${reg.user_email}`} className="flex items-center gap-1 text-blue-600 hover:underline">
                                                    <Mail className="w-4 h-4" />
                                                    {reg.user_email}
                                                </a>
                                            </TableCell>
                                            <TableCell className="text-slate-500">
                                                {format(new Date(reg.registered_at), 'MMM d, yyyy • h:mm a')}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
