// import React, { useState, useEffect } from 'react';
// import { TextField, Button, Box, Typography, Container } from '@mui/material';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../App'; // adjust path if needed

// export default function LoginScreen() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const { login } = useAuth();
//   const navigate = useNavigate();

//   // 🔒 Redirect if already logged in
//   useEffect(() => {
//     if (localStorage.getItem('isAuthenticated') === 'true') {
//       navigate('/home');
//     }
//   }, [navigate]);

//   const handleLogin = () => {
//     if (email === 'user@example.com' && password === 'password123') {
//       login(); // set auth state + localStorage
//       navigate('/home');
//     } else {
//       alert('Invalid credentials');
//     }
//   };

//   return (
//     <Container component="main" maxWidth="xs">
//       <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 8 }}>
//         <Typography variant="h5">Login</Typography>
//         <TextField
//           label="Email"
//           fullWidth
//           margin="normal"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//         />
//         <TextField
//           label="Password"
//           type="password"
//           fullWidth
//           margin="normal"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//         />
//         <Button variant="contained" fullWidth onClick={handleLogin}>
//           Login
//         </Button>
//         <Button fullWidth onClick={() => navigate('/signup')} sx={{ marginTop: 2 }}>
//           Don't have an account? Sign up
//         </Button>
//       </Box>
//     </Container>
//   );
// }
