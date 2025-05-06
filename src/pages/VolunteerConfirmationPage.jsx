import React from 'react';
import { Box, Typography, Button } from '@mui/material';

const VolunteerConfirmationPage = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 10 }}>
      <Typography variant="h4" gutterBottom>
        Volunteer Registration Successful
      </Typography>
      <Typography variant="body1" gutterBottom>
        You are now a registered volunteer!
      </Typography>
      <Button variant="contained" sx={{ width: '250px' }} onClick={() => window.location.href = '/'}>
        OK
      </Button>
    </Box>
  );
};

export default VolunteerConfirmationPage;
