import React, { useState, useRef } from 'react';
import { TextField, Button, Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Avatar } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { supabase } from '../config/supabase';

const ProfilePage = ({ onLogout }) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [profileImage, setProfileImage] = useState('/images/wired-outline-21-avatar-hover-jumping.webp');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');

  const getInitialProfile = () => {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData) {
      return {
        firstName: '',
        lastName: '',
        email: '',
        contact: '',
        birthday: '',
        password: '',
        confirmPassword: '',
      };
    }
    return {
      firstName: userData.user_firstname || '',
      lastName: userData.user_lastname || '',
      email: userData.user_email || '',
      contact: userData.user_mobile || '',
      birthday: userData.user_bday || '',
      password: '',
      confirmPassword: '',
    };
  };

  const [profile, setProfile] = useState(getInitialProfile());

  // Update profile live if userData in localStorage changes
  React.useEffect(() => {
    const handleStorage = () => {
      const userData = JSON.parse(localStorage.getItem('userData'));
      if (userData) {
        setProfile({
          firstName: userData.user_firstname || '',
          lastName: userData.user_lastname || '',
          email: userData.user_email || '',
          contact: userData.user_mobile || '',
          birthday: userData.user_bday || '',
          password: '',
          confirmPassword: '',
        });
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSaveChanges = async () => {
    if (!editMode) return;

    // Validate all fields first
    const validationErrors = [];
    
    if (!profile.firstName.trim()) {
      validationErrors.push('First name is required');
    }
    if (!profile.lastName.trim()) {
      validationErrors.push('Last name is required');
    }
    if (!profile.contact.trim()) {
      validationErrors.push('Contact number is required');
    }
    if (!profile.birthday) {
      validationErrors.push('Birthday is required');
    }

    // If there are validation errors, show them and stay in edit mode
    if (validationErrors.length > 0) {
      alert(validationErrors.join('\n'));
      return;
    }

    // Password validation and update
    if (profile.password || profile.confirmPassword) {
      if (!profile.password || !profile.confirmPassword) {
        setPasswordMessage('Please fill in both password fields.');
        return;
      }
      if (profile.confirmPassword.length < 6) {
        setPasswordMessage('New password must be at least 6 characters.');
        return;
      }
      if (profile.password === profile.confirmPassword) {
        setPasswordMessage('New password must be different from the current password.');
        return;
      }

      try {
        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setPasswordMessage('Failed to verify your session. Please try logging in again.');
          return;
        }

        if (!session) {
          setPasswordMessage('No active session found. Please log in again.');
          return;
        }

        // First verify the current password
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: profile.email,
          password: profile.password
        });

        if (signInError) {
          console.error('Current password verification error:', signInError);
          setPasswordMessage('Current password is incorrect.');
          return;
        }

        // Update password using the current session
        const { error: updateError } = await supabase.auth.updateUser({
          password: profile.confirmPassword
        });

        if (updateError) {
          console.error('Password update error:', updateError);
          setPasswordMessage(updateError.message || 'Failed to update password.');
          return;
        }

        // Clear password fields and show success message
        setProfile(prev => ({
          ...prev,
          password: '',
          confirmPassword: ''
        }));
        setPasswordMessage('Password updated successfully!');
        alert('Password has been successfully updated!');
        return; // Return here to prevent profile update if password was changed
      } catch (err) {
        console.error('Password update error:', err);
        setPasswordMessage('An unexpected error occurred. Please try again.');
        return;
      }
    }

    // Update profile information
    try {
      const { data: userData, error: userError } = await supabase
        .from('user_tbl')
        .update({
          user_firstname: profile.firstName.trim(),
          user_lastname: profile.lastName.trim(),
          user_mobile: profile.contact.trim(),
          user_bday: profile.birthday,
          updated_at: new Date().toISOString()
        })
        .eq('user_email', profile.email)
        .select();

      if (userError) {
        console.error('Profile update error:', userError);
        alert('Failed to update profile information.');
        return;
      }

      // Update localStorage with new user data
      if (userData && userData[0]) {
        localStorage.setItem('userData', JSON.stringify(userData[0]));
      }

      // Only exit edit mode and show success message if everything was successful
      setEditMode(false);
      alert('Profile Updated Successfully!');
    } catch (err) {
      console.error('Profile update error:', err);
      alert('Failed to update profile information.');
    }
  };

  const navLinks = [
    { label: 'HOME', action: () => handleNavigation('/home'), highlight: false },
    { label: 'DONATE', action: () => navigate('/home', { state: { openDonate: true } }), highlight: false },
    { label: 'BOOK A SERVICE', action: () => navigate('/home', { state: { openBooking: true } }), highlight: false },
    { label: 'EVENTS', action: () => handleNavigation('/events'), highlight: false },
    { label: 'BE A VOLUNTEER', action: () => setVolunteerOpen(true), highlight: false },
    { label: 'VIRTUAL TOUR', action: () => handleNavigation('/explore-parish'), highlight: false },
    { label: 'LOGOUT', action: () => setShowLogoutConfirm(true), highlight: false }
  ];

  function handleNavigation(path, state) {
    navigate(path, state ? { state } : undefined);
    setMobileMenuOpen(false);
  }

  function protectedNavClick(actionOrPath) {
    if (typeof actionOrPath === 'function') {
      actionOrPath();
    } else {
      handleNavigation(actionOrPath);
    }
  }

  const [DonateOpen, setDonateOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [volunteerOpen, setVolunteerOpen] = useState(false);

  const handleEditClick = () => setShowConfirm(true);
  const handleConfirmEdit = () => {
    setEditMode(true);
    setShowConfirm(false);
  };
  const handleCancelEdit = () => {
    setEditMode(false);
    setProfileImage('/images/wired-outline-21-avatar-hover-jumping.webp');
  };

  // Drag and drop handlers
  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setProfileImage(ev.target.result);
      reader.readAsDataURL(file);
    }
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };
  const handleImageClick = () => {
    if (editMode && fileInputRef.current) fileInputRef.current.click();
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setProfileImage(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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
                  onClick={link.action}
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
                  onClick={link.action}
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
        {/* Profile Image */}
        <Box
          sx={{ position: 'relative', mb: 3, cursor: editMode ? 'pointer' : 'default' }}
          onClick={handleImageClick}
          onDrop={editMode ? handleDrop : undefined}
          onDragOver={editMode ? handleDragOver : undefined}
          onDragLeave={editMode ? handleDragLeave : undefined}
        >
          <Avatar
            src={profileImage}
            alt="Profile"
            sx={{ width: 100, height: 100, border: dragActive ? '3px dashed #E1D5B8' : '3px solid #E1D5B8', transition: 'border 0.2s', boxShadow: dragActive ? 3 : 1 }}
          />
          {editMode && (
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          )}
        </Box>
        <Typography variant="h4" gutterBottom>
          Profile
        </Typography>
        <TextField
          label="First Name"
          variant="outlined"
          name="firstName"
          value={profile.firstName}
          onChange={handleChange}
          sx={{ mb: 2, width: '250px' }}
          InputProps={{ readOnly: !editMode }}
        />
        <TextField
          label="Last Name"
          variant="outlined"
          name="lastName"
          value={profile.lastName}
          onChange={handleChange}
          sx={{ mb: 2, width: '250px' }}
          InputProps={{ readOnly: !editMode }}
        />
        <TextField
          label="Email"
          variant="outlined"
          name="email"
          value={profile.email}
          onChange={handleChange}
          sx={{ mb: 2, width: '250px' }}
          InputProps={{ readOnly: true }}
        />
        <TextField
          label="Contact Number"
          variant="outlined"
          name="contact"
          value={profile.contact}
          onChange={handleChange}
          sx={{ mb: 2, width: '250px' }}
          InputProps={{ readOnly: !editMode }}
        />
        <TextField
          label="Birthday"
          variant="outlined"
          type="date"
          name="birthday"
          value={profile.birthday}
          onChange={handleChange}
          sx={{ mb: 2, width: '250px' }}
          InputLabelProps={{ shrink: true }}
          InputProps={{ readOnly: !editMode }}
        />
        {editMode && (
          <>
            <TextField
              label="Old Password"
              variant="outlined"
              name="password"
              type={showOldPassword ? 'text' : 'password'}
              value={profile.password}
              onChange={handleChange}
              sx={{ mb: 2, width: '250px' }}
              InputProps={{
                endAdornment: (
                  <Button onClick={() => setShowOldPassword((v) => !v)} tabIndex={-1} size="small">
                    {showOldPassword ? <VisibilityOff /> : <Visibility />}
                  </Button>
                )
              }}
            />
            <TextField
              label="New Password"
              variant="outlined"
              name="confirmPassword"
              type={showNewPassword ? 'text' : 'password'}
              value={profile.confirmPassword}
              onChange={handleChange}
              sx={{ mb: 2, width: '250px' }}
              InputProps={{
                endAdornment: (
                  <Button onClick={() => setShowNewPassword((v) => !v)} tabIndex={-1} size="small">
                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                  </Button>
                )
              }}
            />
            {passwordMessage && (
              <Typography color={passwordMessage.includes('success') ? 'green' : 'error'} sx={{ mb: 2, width: '250px' }}>
                {passwordMessage}
              </Typography>
            )}
          </>
        )}
        {!editMode && (
          <Button 
            variant="contained" 
            onClick={handleEditClick} 
            sx={{ width: '250px', mt: 2 }}
          >
            Edit Profile
          </Button>
        )}
        {editMode && (
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button 
              variant="contained" 
              onClick={handleSaveChanges} 
              sx={{ width: '120px' }}
            >
              Save
            </Button>
            <Button 
              variant="outlined" 
              onClick={handleCancelEdit} 
              sx={{ width: '120px' }}
            >
              Cancel
            </Button>
          </Box>
        )}
        <Button variant="outlined" sx={{ mt: 2, width: '250px' }} onClick={() => setShowLogoutConfirm(true)}>
          Sign Out
        </Button>
        <Dialog open={showLogoutConfirm} onClose={() => setShowLogoutConfirm(false)}>
          <DialogTitle>Confirm Logout</DialogTitle>
          <DialogContent>
            Are you sure you want to log out?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowLogoutConfirm(false)}>Cancel</Button>
            <Button 
              onClick={() => {
                setShowLogoutConfirm(false);
                onLogout();
              }} 
              color="primary"
              variant="contained"
            >
              Logout
            </Button>
          </DialogActions>
        </Dialog>
        {/* Confirm Dialog */}
        <Dialog open={showConfirm} onClose={() => setShowConfirm(false)}>
          <DialogTitle>Confirm Edit</DialogTitle>
          <DialogContent>Are you sure you want to edit your profile?</DialogContent>
          <DialogActions>
            <Button onClick={() => setShowConfirm(false)}>No</Button>
            <Button onClick={handleConfirmEdit} autoFocus>Yes</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </div>
  );
};

export default ProfilePage;
