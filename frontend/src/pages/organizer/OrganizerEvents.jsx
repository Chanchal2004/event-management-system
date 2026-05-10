import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
import { Calendar, Plus, Edit, Trash2, Users, Eye, MoreVertical } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from 'components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from 'components/ui/alert-dialog';
import { toast } from 'sonner';

export default function OrganizerEvents() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const response = await eventApi.getMyEvents();
            setEvents(response.data);
        } catch (error) {
            console.error('Failed to fetch events:', error);
            toast.error('Failed to load your events');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setDeleting(true);
        try {
            await eventApi.delete(deleteId);
            toast.success('Event deleted successfully');
            setEvents(events.filter(e => e.id !== deleteId));
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to delete event');
        } finally {
            setDeleting(false);
            setDeleteId(null);
        }
    };

    const getStatusBadge = (status) => {
        const statusClasses = {
            upcoming: 'status-upcoming',
            ongoing: 'status-ongoing',
            completed: 'status-completed',
        };
        return statusClasses[status] || 'status-upcoming';
    };

    if (loading) {
        return (
            <div data-testid="organizer-events-loading">
                <TopNav title="My Events" showSearch={false} />
                <div className="p-6 max-w-6xl mx-auto">
                    <Skeleton className="h-12 w-48 mb-6" />
                    <Skeleton className="h-96 rounded-xl" />
                </div>
            </div>
        );
    }

    return (
        <div data-testid="organizer-events-page">
            <TopNav title="My Events" showSearch={false} />

            <div className="p-6 max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                            Manage Your Events
                        </h2>
                        <p className="text-slate-500">Create, edit, and manage your event listings</p>
                    </div>
                    <Link to="/organizer/create">
                        <Button className="bg-blue-600 hover:bg-blue-700" data-testid="create-event-btn">
                            <Plus className="w-4 h-4 mr-2" />
                            Create Event
                        </Button>
                    </Link>
                </div>

                {events.length === 0 ? (
                    <Card>
                        <CardContent className="py-16">
                            <div className="empty-state">
                                <Calendar className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                                <h3 className="text-xl font-semibold text-slate-700 mb-2">No events yet</h3>
                                <p className="text-slate-500 mb-6">Start creating events to engage with your audience</p>
                                <Link to="/organizer/create">
                                    <Button data-testid="create-first-event-btn">Create Your First Event</Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Event</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Registrations</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {events.map((event) => (
                                        <TableRow key={event.id} data-testid={`event-row-${event.id}`}>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium text-slate-800">{event.title}</p>
                                                    <p className="text-sm text-slate-500">{event.category}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="text-slate-700">{format(new Date(event.date), 'MMM d, yyyy')}</p>
                                                    <p className="text-sm text-slate-500">{event.time}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={`${getStatusBadge(event.status)} capitalize`}>
                                                    {event.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-4 h-4 text-slate-400" />
                                                    <span className="text-slate-700">
                                                        {event.current_participants} / {event.max_participants}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" data-testid={`event-actions-${event.id}`}>
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem asChild>
                                                            <Link to={`/events/${event.id}`} className="flex items-center">
                                                                <Eye className="w-4 h-4 mr-2" />
                                                                View
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link to={`/organizer/edit/${event.id}`} className="flex items-center">
                                                                <Edit className="w-4 h-4 mr-2" />
                                                                Edit
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link to={`/organizer/registrations/${event.id}`} className="flex items-center">
                                                                <Users className="w-4 h-4 mr-2" />
                                                                Registrations
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-red-600 focus:text-red-600"
                                                            onClick={() => setDeleteId(event.id)}
                                                        >
                                                            <Trash2 className="w-4 h-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </div>

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Event</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this event? This action cannot be undone.
                            All registrations will be cancelled and attendees will be notified.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={deleting}
                            data-testid="confirm-delete-btn"
                        >
                            {deleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
