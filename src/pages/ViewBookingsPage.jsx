import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Container, List, ListItem, ListItemText, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function ViewBookingsPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);

  // Fetch bookings from localStorage
  useEffect(() => {
    const storedBookings = JSON.parse(localStorage.getItem('bookings')) || [];
    setBookings(storedBookings);
  }, []);

  // If no bookings, show a message
  if (bookings.length === 0) {
    return (
      <Container component="main" maxWidth="xs">
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 8 }}>
          <Typography variant="h5">Your Bookings</Typography>
          <Typography variant="body1" sx={{ marginTop: 2 }}>
            You have no bookings yet.
          </Typography>
          <Button
            variant="contained"
            fullWidth
            sx={{ marginTop: 2 }}
            onClick={() => navigate('/booking')}
          >
            Book a Sacrament
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 8 }}>
        <Typography variant="h5">Your Bookings</Typography>

        {/* List of Bookings */}
        <List sx={{ width: '100%', marginTop: 2 }}>
          {bookings.map((booking, index) => (
            <Box key={index}>
              <ListItem>
                <ListItemText
                  primary={`${booking.sacrament} on ${booking.date}`}
                  secondary={`Time: ${booking.time}`}
                />
              </ListItem>
              <Divider />
            </Box>
          ))}
        </List>

        {/* Button to navigate back to home */}
        <Button
          variant="contained"
          fullWidth
          sx={{ marginTop: 2 }}
          onClick={() => navigate('/home')}
        >
          Back to Home
        </Button>
      </Box>
    </Container>
  );
}
