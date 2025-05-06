import React, { useState } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';

const DonatePage = () => {
  const [amount, setAmount] = useState('');

  const handleDonate = () => {
    console.log('Donated:', amount);
    alert(`Thank you! You have donated PHP ${amount}`);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 10 }}>
      <Typography variant="h4" gutterBottom>
        Make a Donation
      </Typography>
      <TextField
        label="Enter Amount"
        variant="outlined"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        sx={{ mb: 2, width: '250px' }}
      />
      <Button variant="contained" onClick={handleDonate} sx={{ width: '250px' }}>
        Confirm Donation
      </Button>
    </Box>
  );
};

export default DonatePage;
