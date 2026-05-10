import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "./components/ui/sonner";

// Layouts
import MainLayout from "./components/layout/MainLayout";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/Dashboard";
import EventDetail from "./pages/events/EventDetail";
import MyTickets from "./pages/tickets/MyTickets";
import Notifications from "./pages/Notifications";
import OrganizerEvents from "./pages/organizer/OrganizerEvents";
import CreateEditEvent from "./pages/organizer/CreateEditEvent";
import EventRegistrations from "./pages/organizer/EventRegistrations";
import OrganizerAnalytics from "./pages/organizer/OrganizerAnalytics";

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Protected routes */}
                    <Route element={<MainLayout />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/events/:id" element={<EventDetail />} />
                        <Route path="/my-tickets" element={<MyTickets />} />
                        <Route path="/notifications" element={<Notifications />} />

                        {/* Organizer routes */}
                        <Route path="/organizer/events" element={<OrganizerEvents />} />
                        <Route path="/organizer/create" element={<CreateEditEvent />} />
                        <Route path="/organizer/edit/:id" element={<CreateEditEvent />} />
                        <Route path="/organizer/registrations/:id" element={<EventRegistrations />} />
                        <Route path="/organizer/analytics" element={<OrganizerAnalytics />} />
                    </Route>

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
            <Toaster position="top-right" richColors />
        </AuthProvider>
    );
}

export default App;
