// import React, { useState } from 'react';
// import { TextField, Button, Box, Typography } from '@mui/material';
// import CardPopup from './CardPopUp.jsx';

// const DonatePage = () => {
//   const [amount, setAmount] = useState('');
//   const [open, setOpen] = useState(true);

//   const handleDonate = () => {
//     alert(`Thank you! You have donated PHP ${amount}`);
//     setAmount('');
//     setOpen(false);
//   };

//   return (
//     <CardPopup open={open} onClose={() => setOpen(false)}>
//       <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 300, p: 2 }}>
//         <Typography variant="h5" gutterBottom>
//           Make a Donation
//         </Typography>
//         <TextField
//           label="Enter Amount"
//           variant="outlined"
//           type="number"
//           value={amount}
//           onChange={(e) => setAmount(e.target.value)}
//           sx={{ mb: 2, width: '100%' }}
//         />
//         <Button variant="contained" fullWidth onClick={handleDonate}>
//           Confirm Donation
//         </Button>
//       </Box>
//     </CardPopup>
//   );
// };

// export default DonatePage;