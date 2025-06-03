import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

const EventsPage = ({ onLogout }) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  // Navigation handlers and navLinks copied from HomepageLoggedIn
  const navLinks = [
    { label: 'HOME', action: () => handleNavigation('/home'), highlight: false },
    { label: 'DONATE', action: () => setDonateOpen(true), highlight: false },
    { label: 'BOOK A SERVICE', action: () => setBookingOpen(true), highlight: false },
    { label: 'EVENTS', action: () => handleNavigation('/events'), highlight: false },
    { label: 'BE A VOLUNTEER', action: () => setVolunteerOpen(true), highlight: false },
    { label: 'VIRTUAL TOUR', action: () => handleNavigation('/explore-parish'), highlight: false },
    { label: 'LOGOUT', action: onLogout, highlight: false }
  ];
  function handleNavigation(path) {
    navigate(path);
    setMobileMenuOpen(false);
  }
  function protectedNavClick(actionOrPath) {
    if (typeof actionOrPath === 'function') {
      actionOrPath();
    } else {
      handleNavigation(actionOrPath);
    }
  }
  // Dummy handlers for popups (if needed)
  const [DonateOpen, setDonateOpen] = React.useState(false);
  const [bookingOpen, setBookingOpen] = React.useState(false);
  const [volunteerOpen, setVolunteerOpen] = React.useState(false);

  const events = [
    {
      title: 'Ash Wednesday',
      date: '2025-02-23',
      description: 'A church event for Ash Wednesday.',
      img: '/path/to/ash-wednesday-image.jpg',
    },
    {
      title: 'Palm Sunday',
      date: '2025-03-23',
      description: 'A church event for Palm Sunday.',
      img: '/path/to/palm-sunday-image.jpg',
    },
    {
      title: 'Lenten Retreat',
      date: '2025-03-29',
      description: 'A church event for Lenten Retreat.',
      img: '/path/to/lenten-retreat-image.jpg',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-md py-4 px-6">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center cursor-pointer" onClick={() => handleNavigation('/home')}>
            <img 
              src="/images/logo.png"
              alt="SagradaGo Logo"
              className="h-10 w-auto mr-2"
            />
            <span className="text-2xl font-bold text-[#E1D5B8] hidden sm:block">SagradaGo</span>
          </div>
          <nav className="hidden md:flex space-x-6">
            {navLinks.map((link) => (
              link.label === 'LOGOUT' ? (
                <button
                  key={link.label}
                  onClick={onLogout}
                  className="text-white bg-[#E1D5B8] border border-[#E1D5B8] rounded px-4 py-2 hover:bg-[#d1c5a8] hover:text-black transition-colors duration-200"
                >
                  {link.label}
                </button>
              ) : (
                <button
                  key={link.label}
                  onClick={() => protectedNavClick(link.action)}
                  className={`text-black hover:text-[#E1D5B8] relative group transition-colors duration-200`}
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
                  onClick={onLogout}
                  className="block w-full text-left p-2 text-white bg-[#E1D5B8] border border-[#E1D5B8] rounded hover:bg-[#d1c5a8] hover:text-black transition-colors duration-200"
                >
                  {link.label}
                </button>
              ) : (
                <button
                  key={link.label}
                  onClick={() => protectedNavClick(link.action)}
                  className={`block w-full text-left p-2 text-black hover:text-[#E1D5B8]`}
                >
                  {link.label}
                </button>
              )
            ))}
          </div>
        )}
      </header>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 10 }}>
        <Typography variant="h4" gutterBottom>
          Upcoming Events
        </Typography>
        {events.map((event, index) => (
          <Box key={index} sx={{ mb: 3, width: '80%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <img src={event.img} alt={event.title} style={{ width: '100px', height: '100px', borderRadius: '8px' }} />
            <Box sx={{ marginLeft: '20px' }}>
              <Typography variant="h6">{event.title}</Typography>
              <Typography variant="body1">{event.date}</Typography>
              <Typography variant="body2">{event.description}</Typography>
              <Button variant="contained" sx={{ mt: 1 }}>
                <Link to={`/events/${event.title}`} style={{ textDecoration: 'none', color: 'white' }}>View Details</Link>
              </Button>
            </Box>
          </Box>
        ))}
      </Box>
    </div>
  );
};

export default EventsPage;
