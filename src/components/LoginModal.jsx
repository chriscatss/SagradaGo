import React, { useState } from 'react';
import { Dialog, Box, TextField, Button, Typography } from '@mui/material';

export default function LoginModal({ onLoginSuccess, onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    // Demo credentials
    if (email === 'user@example.com' && password === 'password123') {
      onLoginSuccess();
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth>
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h6" align="center">Login</Typography>
        {error && <Typography color="error">{error}</Typography>}
        <TextField
          label="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          fullWidth
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          fullWidth
        />
        <Button variant="contained" onClick={handleLogin} sx={{ mt: 2 }}>
          Login
        </Button>
        <Button onClick={onClose}>Cancel</Button>
      </Box>
    </Dialog>
  );
}
