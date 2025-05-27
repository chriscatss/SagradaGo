import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Box, TextField, Typography, Alert } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CardPopup from '../components/CardPopup.jsx';
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

const HomePageLoggedOut = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Navigation state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Authentication states
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [loginMessage, setLoginMessage] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Signup states
  const [signupData, setSignupData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [otpPopupOpen, setOtpPopupOpen] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState('');

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

  // Authentication handlers
  function handleRequireLogin() {
    setLoginMessage('You need to login first');
    setLoginOpen(true);
  }

  const handleLogin = () => {
    // Check demo credentials
    if (email === 'user@example.com' && password === 'password123') {
      login();
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/home');
      return;
    }

    // Check stored user credentials
    const storedUser = JSON.parse(localStorage.getItem('signupUser'));
    if (storedUser && storedUser.email === email && storedUser.password === password) {
      login();
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/home');
    } else {
      alert('Invalid credentials');
    }
  };

  // Signup handlers
  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupData(prev => ({ ...prev, [name]: value }));
  };

  const handleSignup = () => {
    if (signupData.password !== signupData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);
    setOtpPopupOpen(true);
    alert(`OTP sent to ${signupData.email}: ${otp}`);
  };

  const handleOtpConfirm = () => {
    if (enteredOtp === generatedOtp) {
      localStorage.setItem('signupUser', JSON.stringify(signupData));
      alert('Account created successfully');
      setSignupOpen(false);
      setOtpPopupOpen(false);
      setEnteredOtp('');
      setGeneratedOtp('');
      setOtpError('');
      login();
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/home');
    } else {
      setOtpError('Invalid OTP. Please check your email and try again.');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="min-h-screen flex flex-col" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fff' }}>
        {/* Header Section */}
        <header className="bg-white shadow-md py-4 px-6">
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            {/* Logo */}
            <div className="flex items-center cursor-pointer" onClick={() => handleNavigation('/')}>
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
                onClick={() => setLoginOpen(true)}
                className="px-4 py-2 bg-[#E1D5B8] text-white rounded hover:bg-opacity-90 text-sm sm:text-base"
              >
                LOGIN
              </button>
              <button 
                onClick={() => setSignupOpen(true)}
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
                    Management & Engagement.
                  </h1>
                  <p className="text-lg md:text-xl mb-8">
                    The Society has built a new, mature, strategic structure, and kept up-to-date
                    with success across all the past year.
                  </p>
                  <button 
                    onClick={() => handleRequireLogin()}
                    className="px-8 py-3 bg-[#E1D5B8] text-black rounded-lg hover:bg-opacity-90 text-lg transition-all hover:scale-105"
                  >
                    Book now
                  </button>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-white text-black py-12 px-6 border-t border-gray-200">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
            <div>
              <div className="flex items-center mb-4">
                <img src="/images/logo.png" alt="SagradaGo Logo" className="h-10 w-auto mr-2" />
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

        {/* Login Dialog */}
        <CardPopup open={loginOpen} onClose={() => { setLoginOpen(false); setLoginMessage(''); }} title="Login">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
            {loginMessage && (
              <Alert severity="warning" sx={{ mb: 1 }}>{loginMessage}</Alert>
            )}
            <TextField
              label="Email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button 
              variant="contained" 
              fullWidth 
              onClick={handleLogin}
              sx={{ mt: 2, bgcolor: '#E1D5B8', '&:hover': { bgcolor: '#d1c5a8' } }}
            >
              Login
            </Button>
            <Button 
              fullWidth 
              onClick={() => {
                setLoginOpen(false);
                setSignupOpen(true);
                setLoginMessage('');
              }}
              sx={{ mt: 1 }}
            >
              Don't have an account? Sign up
            </Button>
          </Box>
        </CardPopup>

        {/* Signup Dialog */}
        <CardPopup open={signupOpen} onClose={() => setSignupOpen(false)} title="Sign Up">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Fill out the form to create your account. You will receive an OTP via email for confirmation.
            </Typography>
            <TextField
              label="First Name"
              fullWidth
              name="firstName"
              value={signupData.firstName}
              onChange={handleSignupChange}
              autoFocus
            />
            <TextField
              label="Last Name"
              fullWidth
              name="lastName"
              value={signupData.lastName}
              onChange={handleSignupChange}
            />
            <TextField
              label="Email"
              fullWidth
              name="email"
              value={signupData.email}
              onChange={handleSignupChange}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              name="password"
              value={signupData.password}
              onChange={handleSignupChange}
            />
            <TextField
              label="Confirm Password"
              type="password"
              fullWidth
              name="confirmPassword"
              value={signupData.confirmPassword}
              onChange={handleSignupChange}
            />
            <Button 
              variant="contained" 
              fullWidth 
              onClick={handleSignup}
              sx={{ mt: 2, bgcolor: '#E1D5B8', '&:hover': { bgcolor: '#d1c5a8' } }}
            >
              Sign Up
            </Button>
            <Button 
              fullWidth 
              onClick={() => {
                setSignupOpen(false);
                setLoginOpen(true);
              }}
              sx={{ mt: 1 }}
            >
              Already have an account? Log in
            </Button>
          </Box>
        </CardPopup>

        {/* OTP Confirmation Dialog */}
        <CardPopup open={otpPopupOpen} onClose={() => setOtpPopupOpen(false)} title="Confirm OTP">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Please enter the 6-digit OTP sent to your email to complete your registration.
            </Typography>
            <TextField
              label="Enter OTP"
              fullWidth
              value={enteredOtp}
              onChange={e => setEnteredOtp(e.target.value)}
              autoFocus
            />
            {otpError && <Alert severity="error">{otpError}</Alert>}
            <Button
              variant="contained"
              fullWidth
              onClick={handleOtpConfirm}
              sx={{ mt: 2, bgcolor: '#E1D5B8', '&:hover': { bgcolor: '#d1c5a8' } }}
            >
              Confirm OTP
            </Button>
          </Box>
        </CardPopup>

        {/* Chatbot Component */}
        <Chatbot />
      </div>
    </ThemeProvider>
  );
};

export default HomePageLoggedOut;