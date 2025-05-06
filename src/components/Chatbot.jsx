import React, { useEffect } from 'react';

const Chatbot = () => {
  useEffect(() => {
    // Initialize Google Gemini API here
    console.log('Chatbot initialized');
  }, []);

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px' }}>
      <button style={{ padding: '15px', backgroundColor: '#007bff', color: 'white' }}>
        Chat with us!
      </button>
    </div>
  );
};

export default Chatbot;
