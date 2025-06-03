import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Box, TextField, Typography, Grid, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { FormControl, InputLabel, Select, MenuItem, Alert } from '@mui/material';
import { DatePicker, TimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import CardPopup from './CardPopUp.jsx';
import Chatbot from '../components/Chatbot.jsx';
import { styled } from '@mui/material/styles';

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
      <footer className="bg-white text-black py-12 px-6 border-t border-gray-200">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center mb-4">
              <img 
                src="/images/sagrada.png" 
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
              {/* Church links can be added here */}
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