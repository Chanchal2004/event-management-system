import React, { useState, useEffect } from 'react';
import { analyticsApi } from 'lib/api';
import { TopNav } from 'components/layout/TopNav';
import { Card, CardContent, CardHeader, CardTitle } from 'components/ui/card';
import { Skeleton } from 'components/ui/skeleton';
import { Calendar, Users, Star, TrendingUp, PieChart } from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart as RechartsPieChart,
    Pie,
    Cell,
    Legend,
} from 'recharts';

const COLORS = ['#2563eb', '#10b981', '#94a3b8'];

export default function OrganizerAnalytics() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const response = await analyticsApi.getOverview();
            setAnalytics(response.data);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div data-testid="analytics-loading">
                <TopNav title="Analytics" showSearch={false} />
                <div className="p-6 max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="h-28 rounded-xl" />
                        ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Skeleton className="h-80 rounded-xl" />
                        <Skeleton className="h-80 rounded-xl" />
                    </div>
                </div>
            </div>
        );
    }

    const statusData = analytics?.status_breakdown
        ? Object.entries(analytics.status_breakdown).map(([name, value]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            value,
        }))
        : [];

    return (
        <div data-testid="analytics-page">
            <TopNav title="Analytics" showSearch={false} />

            <div className="p-6 max-w-6xl mx-auto">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 animate-fadeIn">
                    <Card className="bg-white border-slate-200">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Calendar className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Total Events</p>
                                    <p className="text-2xl font-bold text-slate-800">{analytics?.total_events || 0}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white border-slate-200">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                    <Users className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Total Registrations</p>
                                    <p className="text-2xl font-bold text-slate-800">{analytics?.total_registrations || 0}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white border-slate-200">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                    <Star className="w-6 h-6 text-yellow-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Average Rating</p>
                                    <p className="text-2xl font-bold text-slate-800">
                                        {analytics?.average_rating || 0}
                                        <span className="text-sm text-slate-400 ml-1">/ 5</span>
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white border-slate-200">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Total Capacity</p>
                                    <p className="text-2xl font-bold text-slate-800">{analytics?.total_capacity || 0}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Registrations by Event */}
                    <Card className="animate-fadeIn stagger-1">
                        <CardHeader>
                            <CardTitle style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                                Registrations by Event
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {analytics?.registrations_by_event?.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={analytics.registrations_by_event}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis
                                            dataKey="name"
                                            tick={{ fontSize: 12, fill: '#64748b' }}
                                            angle={-45}
                                            textAnchor="end"
                                            height={80}
                                        />
                                        <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#fff',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '8px',
                                            }}
                                        />
                                        <Bar
                                            dataKey="registrations"
                                            fill="#2563eb"
                                            radius={[4, 4, 0, 0]}
                                            name="Registrations"
                                        />
                                        <Bar
                                            dataKey="capacity"
                                            fill="#e2e8f0"
                                            radius={[4, 4, 0, 0]}
                                            name="Capacity"
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-64 text-slate-500">
                                    No event data available
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Event Status Distribution */}
                    <Card className="animate-fadeIn stagger-2">
                        <CardHeader>
                            <CardTitle style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                                Event Status Distribution
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {statusData.length > 0 && statusData.some(d => d.value > 0) ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <RechartsPieChart>
                                        <Pie
                                            data={statusData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {statusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#fff',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '8px',
                                            }}
                                        />
                                        <Legend />
                                    </RechartsPieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-64 text-slate-500">
                                    <div className="text-center">
                                        <PieChart className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                                        <p>No event data available</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Summary */}
                <Card className="mt-6 animate-fadeIn stagger-3">
                    <CardHeader>
                        <CardTitle style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                            Quick Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <p className="text-3xl font-bold text-blue-600">{analytics?.status_breakdown?.upcoming || 0}</p>
                                <p className="text-sm text-slate-600 mt-1">Upcoming Events</p>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <p className="text-3xl font-bold text-green-600">{analytics?.status_breakdown?.ongoing || 0}</p>
                                <p className="text-sm text-slate-600 mt-1">Ongoing Events</p>
                            </div>
                            <div className="text-center p-4 bg-slate-100 rounded-lg">
                                <p className="text-3xl font-bold text-slate-600">{analytics?.status_breakdown?.completed || 0}</p>
                                <p className="text-sm text-slate-600 mt-1">Completed Events</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
