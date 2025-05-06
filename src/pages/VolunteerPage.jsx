import React, { useState } from 'react';
import { Button, Box, Typography } from '@mui/material';

const VolunteerPage = () => {
  const [isVolunteer, setIsVolunteer] = useState(false);

  const handleVolunteerSignUp = () => {
    setIsVolunteer(true);
    alert('You are now a registered volunteer!');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 10 }}>
      <Typography variant="h4" gutterBottom>
        Become a Volunteer
      </Typography>
      {!isVolunteer ? (
        <Button variant="contained" onClick={handleVolunteerSignUp} sx={{ width: '250px' }}>
          Sign Up as Volunteer
        </Button>
      ) : (
        <Typography variant="body1">Thank you for volunteering!</Typography>
      )}
    </Box>
  );
};

export default VolunteerPage;
