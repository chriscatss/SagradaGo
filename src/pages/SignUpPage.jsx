// import React, { useState } from 'react';
// import { TextField, Button, Box, Typography } from '@mui/material';
// import { useNavigate } from 'react-router-dom';
// import CardPopup from './CardPopUp.jsx';

// export default function SignupScreen({ open, onClose }) {
//   const [firstName, setFirstName] = useState('');
//   const [lastName, setLastName] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const navigate = useNavigate();

//   const handleSignup = () => {
//     if (password !== confirmPassword) {
//       alert('Passwords do not match');
//       return;
//     }
//     if (password.length < 8 || confirmPassword.length < 8) {
//       alert('Password must be at least 8 characters long');
//       return;
//     }
//     // Implement signup logic
//     alert('Account created successfully');
//     localStorage.setItem('isAuthenticated', 'true');
//     onClose();
//     navigate('/home');
//   };

//   return (
//     <CardPopup open={open} onClose={onClose} title="Sign Up">
//       <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
//         <Typography variant="h5" gutterBottom>Sign Up</Typography>
//         <TextField
//           label="First Name"
//           fullWidth
//           margin="normal"
//           value={firstName}
//           onChange={(e) => setFirstName(e.target.value)}
//         />
//         <TextField
//           label="Last Name"
//           fullWidth
//           margin="normal"
//           value={lastName}
//           onChange={(e) => setLastName(e.target.value)}
//         />
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
//         <TextField
//           label="Confirm Password"
//           type="password"
//           fullWidth
//           margin="normal"
//           value={confirmPassword}
//           onChange={(e) => setConfirmPassword(e.target.value)}
//         />
//         <Button variant="contained" fullWidth onClick={handleSignup} sx={{ mt: 2 }}>
//           Sign Up
//         </Button>
//         <Button fullWidth onClick={() => {
//           onClose();
//           navigate('/login');
//         }} sx={{ mt: 2 }}>
//           Already have an account? Log in
//         </Button>
//       </Box>
//     </CardPopup>
//   );
// }