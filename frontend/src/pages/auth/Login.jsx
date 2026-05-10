

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from 'context/AuthContext';
import { Calendar, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from 'components/ui/button';
import { Input } from 'components/ui/input';
import { Label } from 'components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'components/ui/card';
import { toast } from 'sonner';

export default function Login() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // 🔥 NEW ERROR STATE
    const [errors, setErrors] = useState({});

    const { login } = useAuth();
    const navigate = useNavigate();

    // 🔥 VALIDATION
    const validate = () => {
        let newErrors = {};

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

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        setLoading(true);

        try {
            const user = await login(email, password);
            toast.success(`Welcome back, ${user.name}!`);
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Login failed. Please try again.');
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
                        <div className="w-12 h-12 bg-gradient-to-tr from-pink-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Calendar className="w-7 h-7 text-white" />
                        </div>
                        <span className="text-2xl font-bold tracking-wide text-white">
                            EventNexus
                        </span>
                    </Link>
                </div>

                {/* CARD */}
                <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl">

                    <CardHeader>
                        <CardTitle className="text-2xl text-center text-white">
                            Welcome Back
                        </CardTitle>
                        <CardDescription className="text-center text-slate-400">
                            Enter your credentials to access your account
                        </CardDescription>
                    </CardHeader>

                    <CardContent>

                        <form onSubmit={handleSubmit} className="space-y-4">

                            {/* EMAIL */}
                            <div className="space-y-1">
                                <Label className="text-white">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                                    />
                                </div>
                                {errors.email && <p className="text-red-400 text-xs">{errors.email}</p>}
                            </div>

                            {/* PASSWORD */}
                            <div className="space-y-1">
                                <Label className="text-white">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                    >
                                        {showPassword ? <EyeOff /> : <Eye />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-red-400 text-xs">{errors.password}</p>}
                            </div>

                            {/* BUTTON */}
                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 transition"
                                disabled={loading}
                            >
                                {loading ? 'Signing in...' : 'Sign In'}
                            </Button>

                        </form>

                        {/* FOOTER */}
                        <div className="mt-6 text-center text-sm">
                            <span className="text-slate-400">Don't have an account? </span>
                            <Link to="/register" className="text-pink-400 hover:underline font-medium">
                                Create one
                            </Link>
                        </div>

                    </CardContent>
                </Card>
            </div>
        </div>
    );
}