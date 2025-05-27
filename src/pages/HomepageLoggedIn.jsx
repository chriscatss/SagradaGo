import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Box, TextField, Typography } from '@mui/material';
import { FormControl, InputLabel, Select, MenuItem, Alert } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import CardPopup from '../components/CardPopup.jsx';
import Chatbot from '../components/Chatbot.jsx';

const HomePageLoggedIn = ({ onLogout }) => {
  const navigate = useNavigate();

  const [amount, setAmount] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [DonateOpen, setDonateOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedSacrament, setSelectedSacrament] = useState('');
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [volunteerOpen, setVolunteerOpen] = useState(false);
  const [isVolunteer, setIsVolunteer] = useState(false);

  // Check authentication and set up back button handling
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    // Handle back button press
    const handleBackButton = (event) => {
      event.preventDefault();
      const confirmLogout = window.confirm('Are you sure you want to go back? This will log you out.');
      if (confirmLogout) {
        // Perform logout
        localStorage.setItem('isAuthenticated', 'false');
        navigate('/');
      }
    };

    // Add event listeners for back button
    window.history.pushState(null, null, window.location.pathname);
    window.addEventListener('popstate', handleBackButton);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, [navigate]);

  // Navigation links for logged-in users, excluding LOGOUT
  const navLinks = [
    { label: 'HOME', action: () => handleNavigation('/home') },
    { label: 'DONATE', action: () => setDonateOpen(true) },
    { label: 'BOOK A SERVICE', action: () => setBookingOpen(true) },
    { label: 'EVENTS', action: () => handleNavigation('/events') },
    { label: 'BE A VOLUNTEER', action: () => setVolunteerOpen(true) },
    { label: 'VIRTUAL TOUR', action: () => handleNavigation('/explore-parish') }
  ];

  // Only allow navigation if authenticated
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const handleNavClick = (action) => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    action();
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const handleBooking = () => {
    if (!selectedSacrament || !date || !time) {
      setErrorMessage('Please select a sacrament, date, and time.');
      return;
    }
    alert(`Booking confirmed for ${selectedSacrament} on ${date} at ${time}`);
    setSelectedSacrament('');
    setDate(null);
    setTime(null);
    setErrorMessage('');
    setBookingOpen(false);
  };

  const handleDonate = () => {
    alert(`Thank you! You have donated PHP ${amount}`);
    setAmount('');
    setDonateOpen(false);
    navigate('/home');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-md py-4 px-6">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center cursor-pointer" onClick={() => handleNavigation('/home')}>
            <span className="text-2xl font-bold text-[#E1D5B8]">SagradaGo</span>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <nav className="flex items-center space-x-6">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.action)}
                  className={`text-black hover:text-[#E1D5B8] relative group transition-colors duration-200${
                    (link.label === 'DONATE' && DonateOpen) ||
                    (link.label === 'BOOK A SERVICE' && bookingOpen) ||
                    (link.label === 'BE A VOLUNTEER' && volunteerOpen)
                      ? ' text-[#E1D5B8] underline underline-offset-4'
                      : ''
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </nav>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 font-medium ml-4"
            >
              LOGOUT
            </button>
          </div>
          <div className="md:hidden flex items-center">
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 font-medium mr-2"
            >
              LOGOUT
            </button>
            <button 
              className="p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-white py-2 px-4 space-y-2 mt-2">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.action)}
                className={`block w-full text-left p-2 text-black hover:text-[#E1D5B8]${
                  (link.label === 'DONATE' && DonateOpen) ||
                  (link.label === 'BOOK A SERVICE' && bookingOpen) ||
                  (link.label === 'BE A VOLUNTEER' && volunteerOpen)
                    ? ' text-[#E1D5B8] underline underline-offset-4'
                    : ''
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>
        )}
      </header>
      <main className="flex-grow">
        <section className="relative h-[70vh] min-h-[500px] w-full overflow-hidden">
          <img 
            src="/images/SAGRADA-FAMILIA-PARISH.jpg"
            alt="Church Community"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          <div className="relative h-full flex items-center">
            <div className="container mx-auto px-6">
              <div className="max-w-2xl text-white">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                  Simplifying Church <br />
                  Management & Engagement.
                </h1>
                <p className="text-lg md:text-xl mb-8">
                  The Society has built a new, mature, strategic structure, and kept up-to-date
                  with success across all the past year.
                </p>
                <button 
                  onClick={() => setBookingOpen(true)}
                  className="px-8 py-3 bg-[#E1D5B8] text-black rounded-lg hover:bg-opacity-90 text-lg transition-all hover:scale-105"
                >
                  Book now
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="bg-white text-black py-12 px-6 border-t border-gray-200">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center mb-4">
              <img 
                src="/images/logo.png" 
                alt="SagradaGo Logo" 
                className="h-10 w-auto mr-2" 
              />
              <span className="text-2xl font-bold text-[#E1D5B8]">SagradaGo</span>
            </div>
            <p className="text-sm">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry.
              Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">CHURCH</h4>
            <ul className="space-y-2 text-sm">
              {/* <li><a href="#" className="hover:text-[#E1D5B8] hover:underline">Home</a></li>
              <li><a href="#" className="hover:text-[#E1D5B8] hover:underline">About us</a></li>
              <li><a href="#" className="hover:text-[#E1D5B8] hover:underline">Contact us</a></li>
              <li><a href="#" className="hover:text-[#E1D5B8] hover:underline">Privacy policy</a></li> */}
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">GET IN TOUCH</h4>
            <ul className="text-sm space-y-2">
              <li><span className="text-gray-700">+1-212-456-7890</span></li>
              <li><span className="text-gray-700">greatstackdev@gmail.com</span></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-gray-300 text-center text-sm text-gray-500">
          Copyright © {new Date().getFullYear()} GreatStack - All Rights Reserved.
        </div>
      </footer>

      {/* Donate Popup */}
      <CardPopup open={DonateOpen} onClose={() => setDonateOpen(false)} title="Make a Donation">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
          <Typography variant="body1" sx={{ mb: 1 }}>
            Support our parish by making a donation. Your generosity helps us continue our mission.
          </Typography>
          <TextField
            label="Enter Amount"
            variant="outlined"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            fullWidth
            autoFocus
          />
          <Button 
            variant="contained" 
            fullWidth 
            onClick={handleDonate}
            sx={{ bgcolor: '#E1D5B8', '&:hover': { bgcolor: '#d1c5a8' } }}
          >
            Confirm Donation
          </Button>
        </Box>
      </CardPopup>

      {/* Booking Popup */}
      <CardPopup open={bookingOpen} onClose={() => setBookingOpen(false)} title="Book a Sacrament">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
          <Typography variant="body1" sx={{ mb: 1 }}>
            Reserve a date and time for your chosen sacrament below.
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Select Sacrament</InputLabel>
            <Select
              value={selectedSacrament}
              onChange={(e) => setSelectedSacrament(e.target.value)}
              label="Select Sacrament"
            >
              <MenuItem value="Wedding">Wedding</MenuItem>
              <MenuItem value="Baptism">Baptism</MenuItem>
              <MenuItem value="Confession">Confession</MenuItem>
              <MenuItem value="Anointing of the Sick">Anointing of the Sick</MenuItem>
            </Select>
          </FormControl>
          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
          {selectedSacrament && (
            <>
              <Typography variant="h6" sx={{ mt: 1 }}>
                Selected Sacrament: {selectedSacrament}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <DatePicker
                  label="Select Date"
                  value={date}
                  onChange={(newValue) => setDate(newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
                <TimePicker
                  label="Select Time"
                  value={time}
                  onChange={(newValue) => setTime(newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Box>
              <Button
                variant="contained"
                fullWidth
                onClick={handleBooking}
                sx={{ mt: 2, bgcolor: '#E1D5B8', '&:hover': { bgcolor: '#d1c5a8' } }}
              >
                Confirm Booking
              </Button>
            </>
          )}
        </Box>
      </CardPopup>

      {/* Volunteer Popup */}
      <CardPopup open={volunteerOpen} onClose={() => setVolunteerOpen(false)} title="Become a Volunteer">
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, p: 2 }}>
          <Typography variant="h5" gutterBottom>
            Want to make a difference? Join our volunteer team!
          </Typography>
          {!isVolunteer ? (
            <Button
              variant="contained"
              onClick={() => {
                setIsVolunteer(true);
                alert('You are now a registered volunteer!');
              }}
              sx={{ width: '250px', bgcolor: '#E1D5B8', '&:hover': { bgcolor: '#d1c5a8' } }}
            >
              Sign Up as Volunteer
            </Button>
          ) : (
            <Typography variant="body1">Thank you for volunteering!</Typography>
          )}
        </Box>
      </CardPopup>

      {/* Chatbot Floating Button */}
      <Chatbot />
    </div>
  );
};

export default HomePageLoggedIn;