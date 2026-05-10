import React, { useState, useEffect } from 'react';
import { notificationApi } from 'lib/api';
import { TopNav } from 'components/layout/TopNav';
import { Card, CardContent } from 'components/ui/card';
import { Button } from 'components/ui/button';
import { Skeleton } from 'components/ui/skeleton';
import { format } from 'date-fns';
import { Bell, Check, CheckCheck, Ticket, RefreshCw, Info } from 'lucide-react';
import { toast } from 'sonner';

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await notificationApi.getAll();
            setNotifications(response.data);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkRead = async (id) => {
        try {
            await notificationApi.markRead(id);
            setNotifications(notifications.map(n => 
                n.id === id ? { ...n, read: true } : n
            ));
        } catch (error) {
            toast.error('Failed to mark as read');
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationApi.markAllRead();
            setNotifications(notifications.map(n => ({ ...n, read: true })));
            toast.success('All notifications marked as read');
        } catch (error) {
            toast.error('Failed to mark all as read');
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'registration':
                return <Ticket className="w-5 h-5 text-green-600" />;
            case 'reminder':
                return <Bell className="w-5 h-5 text-orange-600" />;
            case 'update':
                return <RefreshCw className="w-5 h-5 text-blue-600" />;
            default:
                return <Info className="w-5 h-5 text-slate-600" />;
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    if (loading) {
        return (
            <div data-testid="notifications-loading">
                <TopNav title="Notifications" showSearch={false} />
                <div className="p-6 max-w-3xl mx-auto">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-24 mb-4 rounded-lg" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div data-testid="notifications-page">
            <TopNav title="Notifications" showSearch={false} />

            <div className="p-6 max-w-3xl mx-auto">
                {notifications.length > 0 && unreadCount > 0 && (
                    <div className="flex justify-end mb-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleMarkAllRead}
                            data-testid="mark-all-read-btn"
                        >
                            <CheckCheck className="w-4 h-4 mr-2" />
                            Mark all as read
                        </Button>
                    </div>
                )}

                {notifications.length === 0 ? (
                    <div className="empty-state">
                        <Bell className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                        <h3 className="text-xl font-semibold text-slate-700 mb-2">No notifications</h3>
                        <p className="text-slate-500">You're all caught up!</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {notifications.map((notif) => (
                            <Card
                                key={notif.id}
                                className={`transition-all duration-200 ${!notif.read ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}
                                data-testid={`notification-${notif.id}`}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                            notif.type === 'registration' ? 'bg-green-100' :
                                            notif.type === 'reminder' ? 'bg-orange-100' :
                                            notif.type === 'update' ? 'bg-blue-100' : 'bg-slate-100'
                                        }`}>
                                            {getIcon(notif.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className="font-medium text-slate-800">{notif.title}</h4>
                                                {!notif.read && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleMarkRead(notif.id)}
                                                        data-testid={`mark-read-${notif.id}`}
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-600 mb-2">{notif.message}</p>
                                            <p className="text-xs text-slate-400">
                                                {format(new Date(notif.created_at), 'MMM d, yyyy • h:mm a')}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
