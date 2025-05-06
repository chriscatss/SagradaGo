import React from 'react';
import { Box, Typography } from '@mui/material';

const VirtualTour = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 10 }}>
      <Typography variant="h4" gutterBottom>
        Explore the Parish
      </Typography>
      <Typography variant="h6" color="grey" gutterBottom>
        Coming Soon...
      </Typography>
    </Box>
  );
};

export default VirtualTour;
