import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { eventApi, uploadApi } from '../../lib/api';
import { TopNav } from 'components/layout/TopNav';
import { Card, CardContent, CardHeader, CardTitle } from 'components/ui/card';
import { Button } from 'components/ui/button';
import { Input } from 'components/ui/input';
import { Label } from 'components/ui/label';
import { Textarea } from 'components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from 'components/ui/select';
import { RadioGroup, RadioGroupItem } from 'components/ui/radio-group';
import { Calendar } from 'components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from 'components/ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Image, ArrowLeft, Globe, Building } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateEditEvent() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: null,
        time: '',
        location: '',
        location_type: 'offline',
        max_participants: '',
        category: '',
        banner_url: '',
    });

    const fetchCategories = useCallback(async () => {
        try {
            const res = await eventApi.getCategories();
            setCategories(res.data.categories);
        } catch {
            console.error('Failed categories');
        }
    }, []);

    const fetchEvent = useCallback(async () => {
        try {
            const res = await eventApi.getOne(id);
            const e = res.data;
            setFormData({
                title: e.title,
                description: e.description,
                date: new Date(e.date),
                time: e.time,
                location: e.location,
                location_type: e.location_type,
                max_participants: e.max_participants.toString(),
                category: e.category,
                banner_url: e.banner_url || '',
            });
        } catch {
            toast.error('Failed to load');
            navigate('/organizer/events');
        }
    }, [id, navigate]);

    useEffect(() => {
        fetchCategories();
        if (isEdit) fetchEvent();
    }, [fetchCategories, fetchEvent, isEdit]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title.trim()) return toast.error('Enter title');
        if (!formData.description.trim()) return toast.error('Enter description');
        if (!formData.date) return toast.error('Select date');
        if (!formData.time) return toast.error('Enter time');
        if (!formData.location.trim()) return toast.error('Enter location');
        if (!formData.max_participants) return toast.error('Participants?');
        if (!formData.category) return toast.error('Select category');

        setLoading(true);
        try {
            const payload = {
                ...formData,
                date: format(formData.date, 'yyyy-MM-dd'),
                max_participants: parseInt(formData.max_participants),
            };

            if (isEdit) await eventApi.update(id, payload);
            else await eventApi.create(payload);

            navigate('/organizer/events');
        } catch {
            toast.error('Failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <TopNav title={isEdit ? 'Edit Event' : 'Create Event'} showSearch={false} />

            <div className="p-6 max-w-3xl mx-auto">
                <Button onClick={() => navigate(-1)} className="mb-4">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>

                <Card>
                    <CardHeader>
                        <CardTitle>{isEdit ? 'Edit Event' : 'Create Event'}</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Title */}
                            <div>
                                <Label>Title</Label>
                                <Input
                                    value={formData.title}
                                    onChange={e => handleInputChange('title', e.target.value)}
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <Label>Description</Label>
                                <Textarea
                                    value={formData.description}
                                    onChange={e => handleInputChange('description', e.target.value)}
                                />
                            </div>

                            {/* Date */}
                            <div>
                                <Label>Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline">
                                            <CalendarIcon className="mr-2 w-4 h-4" />
                                            {formData.date ? format(formData.date, 'PPP') : 'Pick date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent>
                                        <Calendar
                                            mode="single"
                                            selected={formData.date}
                                            onSelect={(d) => handleInputChange('date', d)}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* Time */}
                            <Input
                                type="time"
                                value={formData.time}
                                onChange={e => handleInputChange('time', e.target.value)}
                            />

                            {/* Location */}
                            <Input
                                placeholder="Location"
                                value={formData.location}
                                onChange={e => handleInputChange('location', e.target.value)}
                            />

                            {/* Category */}
                            <Select onValueChange={(v) => handleInputChange('category', v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map(c => (
                                        <SelectItem key={c} value={c}>{c}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Submit */}
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Saving...' : 'Submit'}
                            </Button>

                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
