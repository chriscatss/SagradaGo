import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const HomePageLoggedOut = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavigation = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { path: '/', label: 'HOME' },
    { path: '/donate', label: 'DONATE' },
    { path: '/events', label: 'EVENTS' },
    { path: '/booking', label: 'BOOK A SERVICE' },
    { path: '/volunteer', label: 'BE A VOLUNTEER' },
    { path: '/explore-parish', label: 'VIRTUAL TOUR' }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-md py-4 px-6">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => handleNavigation('/')}>
            <img 
              src="/images/logo.png"
              alt="SagradaGo Logo"
              className="h-10 w-auto mr-2"
            />
            <span className="text-2xl font-bold text-[#E1D5B8] hidden sm:block">SagradaGo</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => handleNavigation(link.path)}
                className={`text-black hover:text-[#E1D5B8] relative group transition-colors duration-200 ${
                  location.pathname === link.path ? 'text-[#E1D5B8] underline underline-offset-4' : ''
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => handleNavigation('/login')}
              className="px-4 py-2 bg-[#E1D5B8] text-white rounded hover:bg-opacity-90 text-sm sm:text-base"
            >
              LOGIN
            </button>
            <button 
              onClick={() => handleNavigation('/signup')}
              className="px-4 py-2 bg-[#E1D5B8] text-white rounded hover:bg-opacity-90 text-sm sm:text-base"
            >
              JOIN NOW
            </button>

            {/* Mobile Menu Button */}
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
                key={link.path}
                onClick={() => handleNavigation(link.path)}
                className={`block w-full text-left p-2 text-black hover:text-[#E1D5B8] ${
                  location.pathname === link.path ? 'text-[#E1D5B8] underline underline-offset-4' : ''
                }`}
              >
                {link.label}
              </button>
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
                  Management & Engagement.
                </h1>
                <p className="text-lg md:text-xl mb-8">
                  The Society has built a new, mature, strategic structure, and kept up-to-date
                  with success across all the past year.
                </p>
                <button 
                  onClick={() => handleNavigation('/booking')}
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
          {/* Logo & Description */}
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

          {/* Church Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">CHURCH</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-[#E1D5B8] hover:underline">Home</a></li>
              <li><a href="#" className="hover:text-[#E1D5B8] hover:underline">About us</a></li>
              <li><a href="#" className="hover:text-[#E1D5B8] hover:underline">Contact us</a></li>
              <li><a href="#" className="hover:text-[#E1D5B8] hover:underline">Privacy policy</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">GET IN TOUCH</h4>
            <ul className="text-sm space-y-2">
              <li><span className="text-gray-700">+1-212-456-7890</span></li>
              <li><span className="text-gray-700">greatstackdev@gmail.com</span></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-gray-300 text-center text-sm text-gray-500">
          Copyright © {new Date().getFullYear()} GreatStack - All Rights Reserved.
        </div>
      </footer>
    </div>
  );
};

export default HomePageLoggedOut;
