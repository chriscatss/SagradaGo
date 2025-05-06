import Chatbot from '../components/Chatbot';

const HomePage = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 10 }}>
      <Typography variant="h4" gutterBottom>
        Welcome, User!
      </Typography>
      {/* Buttons */}
      <Button variant="contained" color="primary" sx={{ mb: 2, width: '250px' }}>
        <Link to="/booking" style={{ textDecoration: 'none', color: 'white' }}>Book a Sacrament</Link>
      </Button>
      {/* Other Buttons */}
      <Chatbot />
    </Box>
  );
};
