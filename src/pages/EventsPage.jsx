import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

const EventsPage = () => {
  const events = [
    {
      title: 'Ash Wednesday',
      date: '2025-02-23',
      description: 'A church event for Ash Wednesday.',
      img: '/path/to/ash-wednesday-image.jpg',
    },
    {
      title: 'Palm Sunday',
      date: '2025-03-23',
      description: 'A church event for Palm Sunday.',
      img: '/path/to/palm-sunday-image.jpg',
    },
    {
      title: 'Lenten Retreat',
      date: '2025-03-29',
      description: 'A church event for Lenten Retreat.',
      img: '/path/to/lenten-retreat-image.jpg',
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 10 }}>
      <Typography variant="h4" gutterBottom>
        Upcoming Events
      </Typography>
      {events.map((event, index) => (
        <Box key={index} sx={{ mb: 3, width: '80%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <img src={event.img} alt={event.title} style={{ width: '100px', height: '100px', borderRadius: '8px' }} />
          <Box sx={{ marginLeft: '20px' }}>
            <Typography variant="h6">{event.title}</Typography>
            <Typography variant="body1">{event.date}</Typography>
            <Typography variant="body2">{event.description}</Typography>
            <Button variant="contained" sx={{ mt: 1 }}>
              <Link to={`/events/${event.title}`} style={{ textDecoration: 'none', color: 'white' }}>View Details</Link>
            </Button>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default EventsPage;
