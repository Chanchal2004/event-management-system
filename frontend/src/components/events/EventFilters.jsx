import React, { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../components/ui/select';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '../components/ui/popover';
import { Calendar } from '../components/ui/calendar';
import { format } from 'date-fns';
import { eventApi } from '../lib/api';

export const EventFilters = ({ onFilterChange, initialFilters = {} }) => {
    const [categories, setCategories] = useState([]);
    const [filters, setFilters] = useState({
        search: '',
        category: '',
        location_type: '',
        date_from: null,
        date_to: null,
        sort_by: 'date',
        sort_order: 'asc',
        ...initialFilters,
    });
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => { fetchCategories(); }, []);

    const fetchCategories = async () => {
        try {
            const response = await eventApi.getCategories();
            setCategories(response.data.categories);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const clearFilters = () => {
        const clearedFilters = {
            search: '',
            category: '',
            location_type: '',
            date_from: null,
            date_to: null,
            sort_by: 'date',
            sort_order: 'asc',
        };
        setFilters(clearedFilters);
        onFilterChange(clearedFilters);
    };

    const activeFilterCount = [
        filters.category,
        filters.location_type,
        filters.date_from,
        filters.date_to,
    ].filter(Boolean).length;

    const inputStyle = {
        background: 'var(--bg-card)',
        border: '1px solid rgba(139,92,246,0.2)',
        borderRadius: 10,
        color: 'var(--text-primary)',
        fontSize: '0.875rem',
        padding: '0 14px',
        height: 40,
        outline: 'none',
        transition: 'border-color 0.2s',
        width: '100%',
    };

    const btnStyle = {
        background: 'var(--bg-card)',
        border: '1px solid rgba(139,92,246,0.2)',
        borderRadius: 10,
        color: 'var(--text-secondary)',
        fontSize: '0.875rem',
        height: 40,
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        cursor: 'pointer',
        transition: 'all 0.2s',
        whiteSpace: 'nowrap',
    };

    return (
        <div data-testid="event-filters" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 220, position: 'relative' }}>
                    <Search style={{
                        position: 'absolute',
                        left: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 15,
                        height: 15,
                        color: 'var(--text-muted)',
                        pointerEvents: 'none',
                    }} />
                    <input
                        type="text"
                        placeholder="Search events by title, description, or location..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        data-testid="search-filter"
                        style={{ ...inputStyle, paddingLeft: 38 }}
                        onFocus={e => e.target.style.borderColor = 'var(--purple-primary)'}
                        onBlur={e => e.target.style.borderColor = 'rgba(139,92,246,0.2)'}
                    />
                </div>

                <button
                    onClick={() => setShowFilters(!showFilters)}
                    data-testid="toggle-filters-btn"
                    style={{
                        ...btnStyle,
                        borderColor: showFilters ? 'rgba(139,92,246,0.5)' : 'rgba(139,92,246,0.2)',
                        color: showFilters ? 'var(--purple-bright)' : 'var(--text-secondary)',
                    }}
                >
                    <Filter style={{ width: 14, height: 14 }} />
                    Filters
                    {activeFilterCount > 0 && (
                        <span style={{
                            background: 'linear-gradient(135deg, var(--purple-primary), var(--pink-accent))',
                            color: '#fff',
                            borderRadius: 20,
                            padding: '0 7px',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            lineHeight: '18px',
                            height: 18,
                        }}>
                            {activeFilterCount}
                        </span>
                    )}
                </button>

                <Select
                    value={`${filters.sort_by}-${filters.sort_order}`}
                    onValueChange={(value) => {
                        const [sortBy, sortOrder] = value.split('-');
                        handleFilterChange('sort_by', sortBy);
                        handleFilterChange('sort_order', sortOrder);
                    }}
                >
                    <SelectTrigger style={{ width: 180, ...inputStyle, padding: '0 12px' }} data-testid="sort-select">
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="date-asc">Date (Earliest)</SelectItem>
                        <SelectItem value="date-desc">Date (Latest)</SelectItem>
                        <SelectItem value="title-asc">Title (A-Z)</SelectItem>
                        <SelectItem value="title-desc">Title (Z-A)</SelectItem>
                        <SelectItem value="participants-desc">Most Popular</SelectItem>
                        <SelectItem value="participants-asc">Least Popular</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {showFilters && (
                <div style={{
                    background: 'var(--bg-card)',
                    border: '1px solid rgba(139,92,246,0.2)',
                    borderRadius: 14,
                    padding: 20,
                }} className="animate-fadeIn">
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                        gap: 16,
                    }}>
                        <div>
                            <Label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                                Category
                            </Label>
                            <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                                <SelectTrigger data-testid="category-filter" style={inputStyle}>
                                    <SelectValue placeholder="All categories" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All categories</SelectItem>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                                Location Type
                            </Label>
                            <Select value={filters.location_type} onValueChange={(value) => handleFilterChange('location_type', value)}>
                                <SelectTrigger data-testid="location-type-filter" style={inputStyle}>
                                    <SelectValue placeholder="All types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All types</SelectItem>
                                    <SelectItem value="online">Online</SelectItem>
                                    <SelectItem value="offline">In-person</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                                From Date
                            </Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <button style={btnStyle} data-testid="date-from-filter">
                                        {filters.date_from ? format(new Date(filters.date_from), 'PPP') : 'Pick a date'}
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent style={{ width: 'auto', padding: 0 }}>
                                    <Calendar
                                        mode="single"
                                        selected={filters.date_from ? new Date(filters.date_from) : undefined}
                                        onSelect={(date) => handleFilterChange('date_from', date ? format(date, 'yyyy-MM-dd') : null)}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div>
                            <Label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                                To Date
                            </Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <button style={btnStyle} data-testid="date-to-filter">
                                        {filters.date_to ? format(new Date(filters.date_to), 'PPP') : 'Pick a date'}
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent style={{ width: 'auto', padding: 0 }}>
                                    <Calendar
                                        mode="single"
                                        selected={filters.date_to ? new Date(filters.date_to) : undefined}
                                        onSelect={(date) => handleFilterChange('date_to', date ? format(date, 'yyyy-MM-dd') : null)}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    {activeFilterCount > 0 && (
                        <div style={{
                            marginTop: 16,
                            paddingTop: 16,
                            borderTop: '1px solid rgba(139,92,246,0.12)',
                            display: 'flex',
                            justifyContent: 'flex-end',
                        }}>
                            <button
                                onClick={clearFilters}
                                data-testid="clear-filters-btn"
                                style={{
                                    ...btnStyle,
                                    border: 'none',
                                    background: 'transparent',
                                    color: 'var(--text-muted)',
                                    fontSize: '0.82rem',
                                }}
                            >
                                <X style={{ width: 13, height: 13 }} />
                                Clear all filters
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default EventFilters;
