

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from 'context/AuthContext';
import { eventApi, registrationApi, reviewApi } from '../lib/api';
import { TopNav } from 'components/layout/TopNav';
import { Button } from 'components/ui/button';
import { Badge } from 'components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from 'components/ui/card';
import { Textarea } from 'components/ui/textarea';
import { Skeleton } from 'components/ui/skeleton';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
    Calendar,
    Clock,
    MapPin,
    Users,
    Tag,
    User,
    Star,
    ArrowLeft,
    Check,
    X as XIcon,
    Globe,
    Building,
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function EventDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [event, setEvent] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isRegistered, setIsRegistered] = useState(false);
    const [registering, setRegistering] = useState(false);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [submittingReview, setSubmittingReview] = useState(false);
    const [myRegistrations, setMyRegistrations] = useState([]);

    const fetchEventData = useCallback(async () => {
        try {
            const [eventRes, reviewsRes, registrationsRes] = await Promise.all([
                eventApi.getOne(id),
                reviewApi.getEventReviews(id),
                registrationApi.getMyRegistrations(),
            ]);
            setEvent(eventRes.data);
            setReviews(reviewsRes.data);
            setMyRegistrations(registrationsRes.data);
            setIsRegistered(registrationsRes.data.some(r => r.event_id === id));
        } catch (error) {
            console.error('Failed to fetch event:', error);
            toast.error('Failed to load event details');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchEventData();
        // Poll for seat updates every 10 seconds
        const interval = setInterval(async () => {
            try {
                const eventRes = await eventApi.getOne(id);
                setEvent(eventRes.data);
            } catch (error) {
                console.error('Failed to poll event:', error);
            }
        }, 10000);
        return () => clearInterval(interval);
    }, [fetchEventData, id]);

    const handleRegister = async () => {
        setRegistering(true);
        try {
            await registrationApi.register(id);
            toast.success('Successfully registered! Check your tickets for the QR code.');
            fetchEventData();
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Registration failed');
        } finally {
            setRegistering(false);
        }
    };

    const handleUnregister = async () => {
        setRegistering(true);
        try {
            await registrationApi.unregister(id);
            toast.success('Successfully unregistered from the event');
            fetchEventData();
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to unregister');
        } finally {
            setRegistering(false);
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!newReview.comment.trim()) {
            toast.error('Please add a comment');
            return;
        }
        setSubmittingReview(true);
        try {
            await reviewApi.create({
                event_id: id,
                rating: newReview.rating,
                comment: newReview.comment,
            });
            toast.success('Review submitted successfully!');
            setNewReview({ rating: 5, comment: '' });
            fetchEventData();
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to submit review');
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) {
        return (
            <div data-testid="event-detail-loading">
                <TopNav title="Event Details" showSearch={false} />
                <div className="p-6 max-w-5xl mx-auto">
                    <Skeleton className="h-64 w-full rounded-xl mb-6" />
                    <Skeleton className="h-8 w-1/2 mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
            </div>
        );
    }

    if (!event) {
        return (
            <div data-testid="event-not-found">
                <TopNav title="Event Not Found" showSearch={false} />
                <div className="p-6 max-w-5xl mx-auto text-center py-16">
                    <h2 className="text-2xl font-bold text-slate-700 mb-4">Event not found</h2>
                    <Button onClick={() => navigate('/dashboard')} data-testid="back-to-dashboard">
                        Back to Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    const seatsLeft = event.max_participants - event.current_participants;
    const isFull = seatsLeft === 0;
    const isCompleted = event.status === 'completed';
    const canReview = isRegistered && isCompleted && !reviews.some(r => r.user_id === user?.id);
    const averageRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : null;

    const bannerUrl = event.banner_url
        ? (event.banner_url.startsWith('http') ? event.banner_url : `${BACKEND_URL}${event.banner_url}`)
        : 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop';

    return (
        <div data-testid="event-detail-page">
            <TopNav title="Event Details" showSearch={false} />

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

                {/* Banner */}
                <div className="relative h-64 md:h-80 rounded-xl overflow-hidden mb-6 animate-fadeIn">
                    <img
                        src={bannerUrl}
                        alt={event.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop';
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6">
                        <div className="flex flex-wrap gap-2 mb-3">
                            <Badge className={`${event.status === 'upcoming' ? 'status-upcoming' : event.status === 'ongoing' ? 'status-ongoing' : 'status-completed'} capitalize`}>
                                {event.status}
                            </Badge>
                            <Badge variant="secondary" className="bg-white/90 text-slate-700">
                                <Tag className="w-3 h-3 mr-1" />
                                {event.category}
                            </Badge>
                            <Badge variant="secondary" className="bg-white/90 text-slate-700">
                                {event.location_type === 'online' ? <Globe className="w-3 h-3 mr-1" /> : <Building className="w-3 h-3 mr-1" />}
                                {event.location_type === 'online' ? 'Online' : 'In-person'}
                            </Badge>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                            {event.title}
                        </h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Description */}
                        <Card className="animate-fadeIn stagger-1">
                            <CardHeader>
                                <CardTitle style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>About This Event</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{event.description}</p>
                            </CardContent>
                        </Card>

                        {/* Reviews */}
                        <Card className="animate-fadeIn stagger-2">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>Reviews</CardTitle>
                                    {averageRating && (
                                        <div className="flex items-center gap-2">
                                            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                            <span className="font-semibold">{averageRating}</span>
                                            <span className="text-slate-500">({reviews.length} reviews)</span>
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                {/* Review Form */}
                                {canReview && (
                                    <form onSubmit={handleSubmitReview} className="mb-6 p-4 bg-slate-50 rounded-lg" data-testid="review-form">
                                        <h4 className="font-medium text-slate-700 mb-3">Leave a Review</h4>
                                        <div className="flex items-center gap-1 mb-3">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setNewReview({ ...newReview, rating: star })}
                                                    className="focus:outline-none"
                                                    data-testid={`rating-star-${star}`}
                                                >
                                                    <Star
                                                        className={`w-6 h-6 transition-colors ${star <= newReview.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                        <Textarea
                                            placeholder="Share your experience..."
                                            value={newReview.comment}
                                            onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                            className="mb-3"
                                            data-testid="review-comment"
                                        />
                                        <Button type="submit" disabled={submittingReview} data-testid="submit-review-btn">
                                            {submittingReview ? 'Submitting...' : 'Submit Review'}
                                        </Button>
                                    </form>
                                )}

                                {/* Reviews List */}
                                {reviews.length === 0 ? (
                                    <p className="text-slate-500 text-center py-8">No reviews yet. Be the first to review!</p>
                                ) : (
                                    <div className="space-y-4">
                                        {reviews.map((review) => (
                                            <div key={review.id} className="border-b border-slate-100 pb-4 last:border-0" data-testid={`review-${review.id}`}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                            <User className="w-4 h-4 text-blue-600" />
                                                        </div>
                                                        <span className="font-medium text-slate-700">{review.user_name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <Star
                                                                key={star}
                                                                className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-slate-600 text-sm">{review.comment}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Event Info */}
                        <Card className="animate-fadeIn stagger-1">
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <Calendar className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-500">Date</p>
                                            <p className="font-medium text-slate-700">
                                                {format(new Date(event.date), 'EEEE, MMMM d, yyyy')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                            <Clock className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-500">Time</p>
                                            <p className="font-medium text-slate-700">{event.time}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                            <MapPin className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-500">Location</p>
                                            <p className="font-medium text-slate-700">{event.location}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                            <User className="w-5 h-5 text-orange-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-500">Organizer</p>
                                            <p className="font-medium text-slate-700">{event.organizer_name}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Seats & Registration */}
                        <Card className="animate-fadeIn stagger-2">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-5 h-5 text-slate-500" />
                                        <span className="text-slate-600">Seats</span>
                                    </div>
                                    <span className={`font-semibold ${isFull ? 'text-red-600' : seatsLeft <= 5 ? 'text-orange-500' : 'text-green-600'}`}>
                                        {isFull ? 'Full' : `${seatsLeft} / ${event.max_participants} available`}
                                    </span>
                                </div>

                                {/* Progress bar */}
                                <div className="h-2 bg-slate-100 rounded-full mb-6">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-red-500' : seatsLeft <= 5 ? 'bg-orange-500' : 'bg-green-500'}`}
                                        style={{ width: `${(event.current_participants / event.max_participants) * 100}%` }}
                                    />
                                </div>

                                {isCompleted ? (
                                    <div className="text-center py-4 text-slate-500">
                                        This event has ended
                                    </div>
                                ) : isRegistered ? (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
                                            <Check className="w-5 h-5" />
                                            <span className="font-medium">You're registered!</span>
                                        </div>
                                        <Link to="/my-tickets">
                                            <Button variant="outline" className="w-full" data-testid="view-ticket-btn">
                                                View My Ticket
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="ghost"
                                            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                                            onClick={handleUnregister}
                                            disabled={registering}
                                            data-testid="unregister-btn"
                                        >
                                            {registering ? 'Processing...' : 'Cancel Registration'}
                                        </Button>
                                    </div>
                                ) : isFull ? (
                                    <div className="text-center py-4 text-slate-500">
                                        <XIcon className="w-8 h-8 mx-auto text-red-400 mb-2" />
                                        <p>This event is full</p>
                                    </div>
                                ) : (
                                    <Button
                                        className="w-full bg-blue-600 hover:bg-blue-700"
                                        onClick={handleRegister}
                                        disabled={registering}
                                        data-testid="register-btn"
                                    >
                                        {registering ? 'Registering...' : 'Register Now'}
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
