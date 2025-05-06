import React, { useState } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

const ProfilePage = () => {
  const [profile, setProfile] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    contact: '09123456789',
    birthday: '1990-01-01',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSaveChanges = () => {
    console.log('Profile Updated:', profile);
    alert('Profile Updated Successfully!');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 10 }}>
      <Typography variant="h4" gutterBottom>
        Edit Profile
      </Typography>
      <TextField
        label="First Name"
        variant="outlined"
        name="firstName"
        value={profile.firstName}
        onChange={handleChange}
        sx={{ mb: 2, width: '250px' }}
      />
      <TextField
        label="Last Name"
        variant="outlined"
        name="lastName"
        value={profile.lastName}
        onChange={handleChange}
        sx={{ mb: 2, width: '250px' }}
      />
      <TextField
        label="Email"
        variant="outlined"
        name="email"
        value={profile.email}
        onChange={handleChange}
        sx={{ mb: 2, width: '250px' }}
      />
      <TextField
        label="Contact Number"
        variant="outlined"
        name="contact"
        value={profile.contact}
        onChange={handleChange}
        sx={{ mb: 2, width: '250px' }}
      />
      <TextField
        label="Birthday"
        variant="outlined"
        type="date"
        name="birthday"
        value={profile.birthday}
        onChange={handleChange}
        sx={{ mb: 2, width: '250px' }}
      />
      <TextField
        label="New Password (Optional)"
        variant="outlined"
        name="password"
        type="password"
        value={profile.password}
        onChange={handleChange}
        sx={{ mb: 2, width: '250px' }}
      />
      <TextField
        label="Confirm New Password"
        variant="outlined"
        name="confirmPassword"
        type="password"
        value={profile.confirmPassword}
        onChange={handleChange}
        sx={{ mb: 2, width: '250px' }}
      />
      <Button variant="contained" onClick={handleSaveChanges} sx={{ width: '250px' }}>
        Save Changes
      </Button>
      <Button variant="outlined" sx={{ mt: 2, width: '250px' }}>
        <Link to="/login" style={{ textDecoration: 'none', color: 'black' }}>Sign Out</Link>
      </Button>
    </Box>
  );
};

export default ProfilePage;
