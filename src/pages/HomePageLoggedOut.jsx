import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Box, Typography, Container, Grid, Card, CardContent, CardMedia, useTheme, useMediaQuery } from '@mui/material';
import { ThemeProvider, createTheme, styled } from '@mui/material/styles';
import LoginModal from '../config/UserAuth.jsx';
import { useAuth } from '../context/AuthContext';
import Chatbot from '../components/Chatbot.jsx';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#E1D5B8',
    },
  },
});

const HeroSection = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  textAlign: 'center',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1,
  },
}));

const HeroContent = styled(Box)(({ theme }) => ({
  position: 'relative',
  zIndex: 2,
  padding: theme.spacing(3),
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-10px)',
  },
}));

const HomePageLoggedOut = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Navigation state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modal states
  const [loginOpen, setLoginOpen] = useState(false);
  const [isSignupMode, setIsSignupMode] = useState(false);

  // Navigation links configuration
  const navLinks = [
    { path: '/', label: 'HOME' },
    { label: 'DONATE', action: () => handleRequireLogin() },
    { label: 'BOOK A SERVICE', action: () => handleRequireLogin() },
    { label: 'EVENTS', action: () => handleRequireLogin() },
    { label: 'BE A VOLUNTEER', action: () => handleRequireLogin() },
    { label: 'VIRTUAL TOUR', action: () => handleRequireLogin() }
  ];

  // Navigation handlers
  const handleNavigation = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const handleNavClick = (link) => {
    if (link.path) {
      handleNavigation(link.path);
    } else if (link.action) {
      link.action();
    }
  };

  const handleRequireLogin = (signup = false) => {
    setIsSignupMode(signup);
    setLoginOpen(true);
  };

  const handleLoginSuccess = (userData) => {
    login();
    navigate('/home');
  };

  const features = [
    {
      title: 'Book Sacrament',
      description: 'Book your sacrament here.',
      action: () => handleRequireLogin(false)
    },
    {
      title: 'Online Donations',
      description: 'Support our parish through secure online donations.',
      action: () => handleRequireLogin(false)
    },
    {
      title: 'Volunteer Programs',
      description: 'Join our community of volunteers and make a difference.',
      action: () => handleRequireLogin(false)
    },
    {
      title: 'Virtual Tour',
      description: 'Explore our beautiful church through a virtual tour.',
      action: () => handleRequireLogin(false)
    },
  ];

  const onLoginClick = (isSignup) => {
    setIsSignupMode(isSignup);
    setLoginOpen(true);
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="min-h-screen flex flex-col" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fff' }}>
        {/* Header Section */}
        <header className="bg-white shadow-md py-4 px-6">
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            {/* Logo */}
            <div className="flex items-center cursor-pointer" onClick={() => handleNavigation('/')}>
              <img 
                src="/images/sagrada.png" 
                alt="Sagrada Familia Parish Logo" 
                className="h-12 w-12 mr-2" 
                style={{ background: 'transparent' }}
              />
              <span className="text-2xl font-bold text-[#E1D5B8]">SagradaGo</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-6">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link)}
                  className="text-black hover:text-[#E1D5B8] relative group transition-colors duration-200"
                >
                  {link.label}
                </button>
              ))}
            </nav>

            {/* Authentication Buttons */}
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => handleRequireLogin(false)}
                className="px-4 py-2 bg-[#E1D5B8] text-white rounded hover:bg-opacity-90 text-sm sm:text-base"
              >
                LOGIN
              </button>
              <button 
                onClick={() => handleRequireLogin(true)}
                className="px-4 py-2 bg-[#E1D5B8] text-white rounded hover:bg-opacity-90 text-sm sm:text-base"
              >
                JOIN NOW
              </button>

              {/* Mobile Menu Toggle */}
              <button 
                className="md:hidden p-2 ml-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? '✕' : '☰'}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-white py-2 px-4 space-y-2 mt-2">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link)}
                  className="block w-full text-left p-2 text-black hover:text-[#E1D5B8]"
                >
                  {link.label}
                </button>
              ))}
            </div>
          )}
        </header>

        {/* Main Content */}
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
                    Management & Engagement
                  </h1>
                  <p className="text-lg md:text-xl mb-8">
                    The Society has built a new, mature, strategic structure, and kept up-to-date
                    with success across all the past year
                  </p>
                  <button 
                    onClick={() => handleRequireLogin(false)}
                    className="px-8 py-3 bg-[#E1D5B8] text-black rounded-lg hover:bg-opacity-90 text-lg transition-all hover:scale-105"
                  >
                    Book now
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="py-8">
            <Container maxWidth="lg">
              <Typography
                variant="h3"
                component="h2"
                align="center"
                gutterBottom
                sx={{
                  color: '#333',
                  mb: 6,
                  fontWeight: 'bold',
                }}
              >
                Our Services
              </Typography>
              <Grid container spacing={4}>
                {features.map((feature, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <FeatureCard onClick={feature.action}>
                      <CardContent sx={{ flexGrow: 1, bgcolor: 'white' }}>
                        <Typography
                          gutterBottom
                          variant="h5"
                          component="h3"
                          sx={{ color: '#E1D5B8', fontWeight: 'bold' }}
                        >
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
            </Container>
          </section>

          <section className="py-8 bg-gray-100">
            <Container maxWidth="md">
              <Typography
                variant="h3"
                component="h2"
                align="center"
                gutterBottom
                sx={{
                  color: '#333',
                  mb: 4,
                  fontWeight: 'bold',
                }}
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
                Be part of our growing parish family Connect with fellow parishioners,
                participate in church activities, and strengthen your faith journey with us.
              </Typography>
              <Box sx={{ textAlign: 'center' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => handleRequireLogin(true)}
                  sx={{
                    bgcolor: '#E1D5B8',
                    color: 'white',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    '&:hover': {
                      bgcolor: '#d4c4a1',
                    },
                  }}
                >
                  Sign Up Now
                </Button>
              </Box>
            </Container>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-white text-black py-12 px-6 border-t border-gray-200">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
            <div>
              <div className="flex items-center mb-4">
                <img src="/images/sagrada.png" alt="SagradaGo Logo" className="h-10 w-auto mr-2" />
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
                {/* Add church-related links here */}
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

        {/* Login/Signup Modal */}
        {loginOpen && (
          <LoginModal
            onClose={() => setLoginOpen(false)}
            onLoginSuccess={handleLoginSuccess}
            isSignupMode={isSignupMode}
          />
        )}

        {/* Chatbot Component */}
        <Chatbot />
      </div>
    </ThemeProvider>
  );
};

export default HomePageLoggedOut;