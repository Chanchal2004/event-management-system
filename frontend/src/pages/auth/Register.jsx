

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from 'context/AuthContext';
import { Calendar, Mail, Lock, Eye, EyeOff, User, Users } from 'lucide-react';
import { Button } from 'components/ui/button';
import { Input } from 'components/ui/input';
import { Label } from 'components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'components/ui/card';
import { RadioGroup, RadioGroupItem } from 'components/ui/radio-group';
import { toast } from 'sonner';

export default function Register() {

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('user');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // 🔥 NEW ERROR STATES
    const [errors, setErrors] = useState({});

    const { register } = useAuth();
    const navigate = useNavigate();

    // 🔥 VALIDATION FUNCTION
    const validate = () => {
        let newErrors = {};

        if (!name) newErrors.name = "Name is required";

        if (!email) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = "Invalid email format";
        }

        if (!password) {
            newErrors.password = "Password is required";
        } else if (password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        if (confirmPassword !== password) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        setLoading(true);

        try {
            const user = await register(name, email, password, role);
            toast.success(`Welcome to EventNexus, ${user.name}!`);
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0f0a1f] via-[#1a0f2e] to-[#0f0a1f] flex items-center justify-center p-4 text-white">

            <div className="w-full max-w-md">

                {/* LOGO */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2">
                        <div className="w-12 h-12 bg-gradient-to-tr from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <Calendar className="w-7 h-7 text-white" />
                        </div>
                        <span className="text-2xl font-bold tracking-wide">EventNexus</span>
                    </Link>
                </div>

                {/* CARD */}
                <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl">

                    <CardHeader>
                        <CardTitle className="text-2xl text-center text-white">Create Account</CardTitle>
                        <CardDescription className="text-center text-slate-400">
                            Join EventNexus to manage your events
                        </CardDescription>
                    </CardHeader>

                    <CardContent>

                        <form onSubmit={handleSubmit} className="space-y-4">

                            {/* NAME */}
                            <div className="space-y-1">
                                <Label className="text-white">Full Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <Input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Enter your name"
                                        className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                                    />
                                </div>
                                {errors.name && <p className="text-red-400 text-xs">{errors.name}</p>}
                            </div>

                            {/* EMAIL */}
                            <div className="space-y-1">
                                <Label className="text-white">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <Input
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                                    />
                                </div>
                                {errors.email && <p className="text-red-400 text-xs">{errors.email}</p>}
                            </div>

                            {/* PASSWORD */}
                            <div className="space-y-1">
                                <Label className="text-white">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Create password"
                                        className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                                    >
                                        {showPassword ? <EyeOff /> : <Eye />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-red-400 text-xs">{errors.password}</p>}
                            </div>

                            {/* CONFIRM PASSWORD */}
                            <div className="space-y-1">
                                <Label className="text-white">Confirm Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm password"
                                        className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                                    />
                                </div>
                                {errors.confirmPassword && (
                                    <p className="text-red-400 text-xs">{errors.confirmPassword}</p>
                                )}
                            </div>

                            {/* ROLE */}
                            <div className="space-y-3">
                                <Label className="text-white">Account Type</Label>

                                <RadioGroup value={role} onValueChange={setRole} className="grid grid-cols-2 gap-4">

                                    <div>
                                        <RadioGroupItem value="user" id="user" className="peer sr-only" />
                                        <Label
                                            htmlFor="user"
                                            className="flex flex-col items-center p-4 rounded-lg border cursor-pointer
                                            border-white/10 bg-white/5
                                            peer-data-[state=checked]:border-pink-500
                                            peer-data-[state=checked]:bg-pink-500/10"
                                        >
                                            <User className="mb-2 text-pink-400" />
                                            Attendee
                                        </Label>
                                    </div>

                                    <div>
                                        <RadioGroupItem value="organizer" id="organizer" className="peer sr-only" />
                                        <Label
                                            htmlFor="organizer"
                                            className="flex flex-col items-center p-4 rounded-lg border cursor-pointer
                                            border-white/10 bg-white/5
                                            peer-data-[state=checked]:border-pink-500
                                            peer-data-[state=checked]:bg-pink-500/10"
                                        >
                                            <Users className="mb-2 text-pink-400" />
                                            Organizer
                                        </Label>
                                    </div>

                                </RadioGroup>
                            </div>

                            {/* BUTTON */}
                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 transition"
                                disabled={loading}
                            >
                                {loading ? 'Creating...' : 'Create Account'}
                            </Button>

                        </form>

                        {/* FOOTER */}
                        <div className="mt-6 text-center text-sm text-slate-400">
                            Already have an account?{' '}
                            <Link to="/login" className="text-pink-400 hover:underline">
                                Sign in
                            </Link>
                        </div>

                    </CardContent>
                </Card>
            </div>
        </div>
    );
}