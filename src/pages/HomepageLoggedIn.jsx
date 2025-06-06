import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Box, TextField, Typography, Grid, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { FormControl, InputLabel, Select, MenuItem, Alert } from '@mui/material';
import { DatePicker, TimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import CardPopup from './CardPopUp.jsx';
import Chatbot from '../components/Chatbot.jsx';
import { styled } from '@mui/material/styles';
import { supabase } from '../config/supabase';

// Styled components
const FeatureCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-10px)',
  },
}));

const HomePageLoggedIn = ({ onLogout }) => {
  const navigate = useNavigate();

  const [amount, setAmount] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [DonateOpen, setDonateOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedSacrament, setSelectedSacrament] = useState('');
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [pax, setPax] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [volunteerOpen, setVolunteerOpen] = useState(false);
  const [isVolunteer, setIsVolunteer] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [navigate]);

  // Navigation links for logged-in users
  const navLinks = [
    { label: 'HOME', action: () => handleNavigation('/home'), highlight: !DonateOpen && !bookingOpen && !volunteerOpen },
    { label: 'DONATE', action: () => setDonateOpen(true), highlight: DonateOpen },
    { label: 'BOOK A SERVICE', action: () => setBookingOpen(true), highlight: bookingOpen },
    { label: 'EVENTS', action: () => handleNavigation('/events'), highlight: false },
    { label: 'BE A VOLUNTEER', action: () => setVolunteerOpen(true), highlight: volunteerOpen },
    { label: 'VIRTUAL TOUR', action: () => handleNavigation('/explore-parish'), highlight: false },
    { label: 'LOGOUT', action: onLogout, highlight: false }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const handleBooking = async () => {
    if (!selectedSacrament || !date || !time || !pax) {
      setErrorMessage('Please select a sacrament, date, time, and number of people.');
      return;
    }

    try {
      // Get the current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setErrorMessage('You must be logged in to make a booking.');
        return;
      }

      // Generate a transaction ID
      const transactionId = `TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // Insert the booking into the database
      const { error } = await supabase
        .from('booking_tbl')
        .insert([
          {
            user_id: user.id,
            booking_sacrament: selectedSacrament,
            booking_date: date.toISOString().split('T')[0],
            booking_time: time.toLocaleTimeString('en-US', { hour12: false }),
            booking_pax: parseInt(pax),
            booking_status: 'pending',
            booking_transaction: transactionId
          }
        ]);

      if (error) throw error;

      alert(`Booking confirmed for ${selectedSacrament} on ${date.toLocaleDateString()} at ${time.toLocaleTimeString()} for ${pax} people`);
      setSelectedSacrament('');
      setDate(null);
      setTime(null);
      setPax('');
      setErrorMessage('');
      setBookingOpen(false);
    } catch (error) {
      console.error('Error creating booking:', error);
      setErrorMessage('Failed to create booking. Please try again.');
    }
  };

  const handleDonate = () => {
    alert(`Thank you! You have donated PHP ${amount}`);
    setAmount('');
    setDonateOpen(false);
    navigate('/home');
  };

  const features = [
    {
      title: 'Book Sacrament',
      description: 'Book your sacrament here.',
      action: () => setBookingOpen(true)
    },
    {
      title: 'Online Donations',
      description: 'Support our parish through secure online donations.',
      action: () => setDonateOpen(true)
    },
    {
      title: 'Volunteer Programs',
      description: 'Join our community of volunteers and make a difference.',
      action: () => setVolunteerOpen(true)
    },
    {
      title: 'Virtual Tour',
      description: 'Explore our beautiful church through a virtual tour.',
      action: () => handleNavigation('/explore-parish')
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header Section */}
      <header className="bg-white shadow-md py-4 px-6">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center cursor-pointer" onClick={() => handleNavigation('/home')}>
            <img 
              src="/images/sagrada.png" 
              alt="Sagrada Familia Parish Logo" 
              className="h-12 w-12 mr-2" 
              style={{ background: 'transparent' }}
            />
            <span className="text-2xl font-bold text-[#E1D5B8] hidden sm:block">SagradaGo</span>
          </div>
          <nav className="hidden md:flex space-x-6">
            {navLinks.map((link) => (
              link.label === 'LOGOUT' ? (
                <button
                  key={link.label}
                  onClick={() => setShowLogoutConfirm(true)}
                  className="text-white bg-[#E1D5B8] border border-[#E1D5B8] rounded px-4 py-2 hover:bg-[#d1c5a8] hover:text-black transition-colors duration-200"
                >
                  {link.label}
                </button>
              ) : (
                <button
                  key={link.label}
                  onClick={link.action}
                  className={`text-black hover:text-[#E1D5B8] relative group transition-colors duration-200${
                    link.highlight ? ' text-[#E1D5B8] underline underline-offset-4' : ''
                  }`}
                >
                  {link.label}
                </button>
              )
            ))}
          </nav>
          <div className="flex items-center space-x-4">
            <button 
              className="md:hidden p-2 ml-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
            <a
              href="/profile"
              className="ml-4"
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                navigate('/profile');
              }}
            >
              <img
                src="/images/wired-outline-21-avatar-hover-jumping.webp"
                alt="Profile"
                className="w-10 h-10 rounded-full border-2 border-[#E1D5B8] hover:shadow-lg transition-shadow duration-200"
                style={{ objectFit: 'cover' }}
              />
            </a>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-white py-2 px-4 space-y-2 mt-2">
            {navLinks.map((link) => (
              link.label === 'LOGOUT' ? (
                <button
                  key={link.label}
                  onClick={() => setShowLogoutConfirm(true)}
                  className="block w-full text-left p-2 text-white bg-[#E1D5B8] border border-[#E1D5B8] rounded hover:bg-[#d1c5a8] hover:text-black transition-colors duration-200"
                >
                  {link.label}
                </button>
              ) : (
                <button
                  key={link.label}
                  onClick={link.action}
                  className={`block w-full text-left p-2 text-black hover:text-[#E1D5B8]${
                    link.highlight ? ' text-[#E1D5B8] underline underline-offset-4' : ''
                  }`}
                >
                  {link.label}
                </button>
              )
            ))}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section */}
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
                  Management & Engagement
                </h1>
                <p className="text-lg md:text-xl mb-8">
                  The Society has built a new, mature, strategic structure, and kept up-to-date
                  with success across all the past year
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

        {/* Features/Services Section */}
        <section className="py-8">
          <Box maxWidth="lg" sx={{ mx: 'auto' }}>
            <Typography
              variant="h3"
              component="h2"
              align="center"
              gutterBottom
              sx={{ color: '#333', mb: 6, fontWeight: 'bold' }}
            >
              Our Services
            </Typography>
            <Grid container spacing={4}>
              {features.map((feature, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <FeatureCard onClick={feature.action}>
                    <CardContent sx={{ flexGrow: 1, bgcolor: 'white' }}>
                      <Typography gutterBottom variant="h5" component="h3" sx={{ color: '#E1D5B8', fontWeight: 'bold' }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </FeatureCard>
                </Grid>
              ))}
            </Grid>
          </Box>
        </section>

        {/* Join Community Section */}
        <section className="py-8 bg-gray-100">
          <Box maxWidth="md" sx={{ mx: 'auto' }}>
            <Typography
              variant="h3"
              component="h2"
              align="center"
              gutterBottom
              sx={{ color: '#333', mb: 4, fontWeight: 'bold' }}
            >
              Join Our Community
            </Typography>
            <Typography
              variant="h6"
              align="center"
              color="text.secondary"
              paragraph
              sx={{ mb: 4 }}
            >
              Be part of our growing parish family. Connect with fellow parishioners,
              participate in church activities, and strengthen your faith journey with us.
            </Typography>
            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => setVolunteerOpen(true)}
                sx={{ bgcolor: '#E1D5B8', color: 'white', px: 4, py: 1.5, fontSize: '1.1rem', '&:hover': { bgcolor: '#d4c4a1' } }}
              >
                Become a Volunteer
              </Button>
            </Box>
          </Box>
        </section>
      </main>

      {/* Footer Section */}
      <footer className="bg-gradient-to-b from-white to-gray-50 text-black py-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Top Section with Logo and Description */}
          <div className="flex flex-col md:flex-row items-center justify-between mb-12 pb-8 border-b border-gray-200">
            <div className="flex items-center mb-6 md:mb-0">
              <img 
                src="/images/sagrada.png" 
                alt="SagradaGo Logo" 
                className="h-16 w-auto mr-4" 
              />
              <div>
                <span className="text-3xl font-bold text-[#E1D5B8]">SagradaGo</span>
                <p className="text-sm text-gray-600 mt-2 max-w-md">
                  A digital gateway to Sagrada Familia Parish, connecting faith and community through modern technology.
                </p>
              </div>
            </div>
            <div className="flex space-x-4">
              <a 
                href="https://www.facebook.com/sfpsanctuaryoftheholyfaceofmanoppello"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#E1D5B8] p-3 rounded-full hover:bg-[#d1c5a8] transition-colors duration-200"
              >
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-[#E1D5B8] relative inline-block">
                Quick Links
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#E1D5B8] transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></span>
              </h4>
              <ul className="space-y-4">
                <li>
                  <button 
                    onClick={() => handleNavigation('/home')}
                    className="text-gray-600 hover:text-[#E1D5B8] transition-colors duration-200 flex items-center"
                  >
                    <span className="mr-2">→</span>
                    Home
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleNavigation('/events')}
                    className="text-gray-600 hover:text-[#E1D5B8] transition-colors duration-200 flex items-center"
                  >
                    <span className="mr-2">→</span>
                    Events
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleNavigation('/explore-parish')}
                    className="text-gray-600 hover:text-[#E1D5B8] transition-colors duration-200 flex items-center"
                  >
                    <span className="mr-2">→</span>
                    Virtual Tour
                  </button>
                </li>
              </ul>
            </div>

            {/* About Section */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-[#E1D5B8]">About Us</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                Sagrada Go is a mobile and web-based appointment and record management system designed for Sagrada Familia Parish. It streamlines parish services by allowing users to schedule appointments, access records, and stay updated with church events—anytime, anywhere.
              </p>
            </div>

            {/* Contact Section */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-[#E1D5B8]">Contact Us</h4>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-[#E1D5B8] mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  <span className="text-gray-600">Sagrada Familia Parish, Sanctuary of the Holy Face of Manoppello, Manila, Philippines</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="pt-8 border-t border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-500 text-sm mb-4 md:mb-0">
                © 2025 Sagrada Familia Parish. All rights reserved.
              </p>
              <p className="text-gray-500 text-sm">
                Designed and Developed by Group 2 – Sagrada Go Capstone Team
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals and Popups */}
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
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Select Date"
                  value={date}
                  onChange={setDate}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <TimePicker
                  label="Select Time"
                  value={time}
                  onChange={setTime}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
              <TextField
                fullWidth
                label="Number of People"
                type="number"
                value={pax}
                onChange={(e) => setPax(e.target.value)}
                inputProps={{ min: 1 }}
                required
              />
              <Button
                variant="contained"
                fullWidth
                onClick={handleBooking}
                sx={{ mt: 2, bgcolor: '#E1D5B8', '&:hover': { bgcolor: '#d1c5a8' } }}
              >
                Request Booking
              </Button>
            </>
          )}
        </Box>
      </CardPopup>

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

      {/* Chatbot and Logout Confirmation */}
      <Chatbot />
      <Dialog open={showLogoutConfirm} onClose={() => setShowLogoutConfirm(false)}>
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>Are you sure you want to log out?</DialogContent>
        <DialogActions>
          <Button onClick={() => setShowLogoutConfirm(false)}>No</Button>
          <Button onClick={() => { setShowLogoutConfirm(false); onLogout(); }} autoFocus>Yes</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default HomePageLoggedIn;