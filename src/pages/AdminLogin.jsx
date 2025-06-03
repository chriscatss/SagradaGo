import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { useAdminAuth } from '../context/AdminAuthContext';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';

// Default admin credentials (these would normally be in .env)
const DEFAULT_ADMIN = {
  email: 'admin@sagradago.com',
  password: 'Admin123!'
};

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, logout } = useAdminAuth();

  const createDefaultAdmin = async () => {
    try {
      // First, create the user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: DEFAULT_ADMIN.email,
        password: DEFAULT_ADMIN.password,
        options: {
          data: {
            first_name: 'Admin',
            last_name: 'User',
            role: 'admin'
          }
        }
      });

      if (authError) {
        console.error('Error creating default admin:', authError);
        throw authError;
      }

      // Then, create the employee record
      const { error: employeeError } = await supabase
        .from('employee_tbl')
        .insert([
          {
            employee_email: DEFAULT_ADMIN.email,
            employee_role: 'admin',
            employee_firstname: 'Admin',
            employee_lastname: 'User'
          }
        ]);

      if (employeeError) {
        console.error('Error creating employee record:', employeeError);
        throw employeeError;
      }

      return authData;
    } catch (error) {
      console.error('Error in createDefaultAdmin:', error);
      throw error;
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    console.log('Login started:', new Date().toISOString());

    try {
      // Check if employee exists with provided email and password
      const { data: employee, error: employeeError } = await supabase
        .from('employee_tbl')
        .select('*')
        .eq('employee_email', email)
        .eq('employee_pword', password)
        .eq('employee_role', 'admin')
        .eq('is_deleted', false)
        .eq('status', 'active')
        .single();

      console.log('Employee check completed:', new Date().toISOString());

      if (employeeError) {
        console.error('Employee check error:', employeeError);
        throw employeeError;
      }

      if (!employee) {
        throw new Error('Invalid email or password');
      }

      // Store admin data in localStorage
      const adminData = {
        id: employee.id,
        email: employee.employee_email,
        firstName: employee.employee_firstname,
        lastName: employee.employee_lastname,
        role: employee.employee_role
      };

      // Call login function from AdminAuthContext
      login(adminData);
      console.log('Login successful:', new Date().toISOString());
      navigate('/admin');
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Admin Login
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box component="form" onSubmit={handleLogin} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default AdminLogin; 