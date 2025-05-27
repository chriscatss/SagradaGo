import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import LoginModal from './components/LoginModal';
import HomePageLoggedOut from './pages/HomePageLoggedOut';
import HomePageLoggedIn from './pages/HomepageLoggedIn';
import EventsPage from './pages/EventsPage';
import BookingPage from './pages/BookingPage';
import DonatePage from './pages/DonatePage';
import VolunteerPage from './pages/VolunteerPage';
import ProfilePage from './pages/ProfilePage';
import ViewBookingsPage from './pages/ViewBookingsPage';
import DonationConfirmationPage from './pages/DonationConfirmationPage';
import VolunteerConfirmationPage from './pages/VolunteerConfirmationPage';
import VirtualTour from './pages/VirtualTour';
import ProtectedRoute from './components/ProtectedRoute';

const AppContent = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated') === 'true';
    setIsAuthenticated(authStatus);
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setShowLogin(false);
    localStorage.setItem('isAuthenticated', 'true');
    navigate('/home');
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm('Are you sure you want to logout?');
    if (confirmLogout) {
      localStorage.setItem('isAuthenticated', 'false');
      setIsAuthenticated(false);
      setShowLogin(false);
      navigate('/');
    }
  };

  return (
    <>
      {!isAuthenticated && showLogin && (
        <LoginModal onLoginSuccess={handleLoginSuccess} onClose={() => setShowLogin(false)} />
      )}
      <Routes>
        <Route path="/" element={<HomePageLoggedOut onLoginClick={() => setShowLogin(true)} />} />
        <Route path="/home" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} onLoginClick={() => setShowLogin(true)}>
            <HomePageLoggedIn onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="/events" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} onLoginClick={() => setShowLogin(true)}>
            <EventsPage />
          </ProtectedRoute>
        } />
        <Route path="/booking" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} onLoginClick={() => setShowLogin(true)}>
            <BookingPage />
          </ProtectedRoute>
        } />
        <Route path="/donate" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} onLoginClick={() => setShowLogin(true)}>
            <DonatePage />
          </ProtectedRoute>
        } />
        <Route path="/volunteer" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} onLoginClick={() => setShowLogin(true)}>
            <VolunteerPage />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} onLoginClick={() => setShowLogin(true)}>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/view-bookings" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} onLoginClick={() => setShowLogin(true)}>
            <ViewBookingsPage />
          </ProtectedRoute>
        } />
        <Route path="/donation-confirmation" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} onLoginClick={() => setShowLogin(true)}>
            <DonationConfirmationPage />
          </ProtectedRoute>
        } />
        <Route path="/volunteer-confirmation" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} onLoginClick={() => setShowLogin(true)}>
            <VolunteerConfirmationPage />
          </ProtectedRoute>
        } />
        <Route path="/explore-parish" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} onLoginClick={() => setShowLogin(true)}>
            <VirtualTour />
          </ProtectedRoute>
        } />
      </Routes>
    </>
  );
};

const App = () => {
  return <AppContent />;
};

export default App;
