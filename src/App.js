import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import HomePage from './pages/HomePage';
import EventsPage from './pages/EventsPage';
import BookingPage from './pages/BookingPage';
import DonatePage from './pages/DonatePage';
import VolunteerPage from './pages/VolunteerPage';
import ProfilePage from './pages/ProfilePage';
import ViewBookingsPage from './pages/ViewBookingsPage';
import DonationConfirmationPage from './pages/DonationConfirmationPage';
import VolunteerConfirmationPage from './pages/VolunteerConfirmationPage';
import VirtualTour from './pages/VirtualTour';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/donate" element={<DonatePage />} />
        <Route path="/volunteer" element={<VolunteerPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/view-bookings" element={<ViewBookingsPage />} />
        <Route path="/donation-confirmation" element={<DonationConfirmationPage />} />
        <Route path="/volunteer-confirmation" element={<VolunteerConfirmationPage />} />
        <Route path="/explore-parish" element={<VirtualTour />} />
      </Routes>
    </Router>
  );
};

export default App;
