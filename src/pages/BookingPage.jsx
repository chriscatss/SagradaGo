import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Container, Alert, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useNavigate } from 'react-router-dom';

export default function BookingScreen() {
  const [selectedSacrament, setSelectedSacrament] = useState('');
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleBooking = () => {
    if (!selectedSacrament) {
      setErrorMessage('Please select a sacrament first.');
      return;
    }

    if (!date || !time) {
      setErrorMessage('Please select both date and time.');
      return;
    }

    setErrorMessage('');
    alert(`Booking confirmed for ${selectedSacrament} on ${date.toDateString()} at ${time.toLocaleTimeString()}`);
    navigate('/home'); // Navigate back to home screen after booking
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 8 }}>
        <Typography variant="h5">Book a Sacrament</Typography>

        {/* Sacrament Selection */}
        <FormControl fullWidth margin="normal">
          <InputLabel>Select Sacrament</InputLabel>
          <Select
            value={selectedSacrament}
            onChange={(e) => setSelectedSacrament(e.target.value)}
            label="Select Sacrament"
          >
            <MenuItem value="Wedding">Wedding</MenuItem>
            <MenuItem value="Baptism">Baptism</MenuItem>
            <MenuItem value="Confession">Confession</MenuItem>
            <MenuItem value="Anointing of the Sick">Anointing of the Sick</MenuItem>
          </Select>
        </FormControl>

        {/* Error Message */}
        {errorMessage && <Alert severity="error" sx={{ width: '100%', marginTop: 2 }}>{errorMessage}</Alert>}

        {/* Date and Time Picker */}
        {selectedSacrament && (
          <>
            <Typography variant="h6" sx={{ marginTop: 2 }}>
              Selected Sacrament: {selectedSacrament}
            </Typography>

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Select Date"
                value={date}
                onChange={setDate}
                renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
              />
            </LocalizationProvider>

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <TimePicker
                label="Select Time"
                value={time}
                onChange={setTime}
                renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
              />
            </LocalizationProvider>

            {/* Confirm Booking Button */}
            <Button variant="contained" fullWidth onClick={handleBooking} sx={{ marginTop: 2 }}>
              Confirm Booking
            </Button>
          </>
        )}
      </Box>
    </Container>
  );
}

