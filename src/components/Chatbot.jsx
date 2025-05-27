import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    // Initialize with welcome message only if there's no stored history
    const storedMessages = localStorage.getItem('chatHistory');
    return storedMessages ? JSON.parse(storedMessages) : [{ 
      from: 'bot', 
      text: 'Hello! I am the Sagrada Familia Parish assistant. How may I help you today?' 
    }];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const [genAI, setGenAI] = useState(null);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    const initializeAI = async () => {
      try {
        const apiKey = process.env.REACT_APP_GOOGLE_API_KEY;
        if (!apiKey) {
          throw new Error('API key not found in environment variables');
        }

        // Initialize with just the API key
        const ai = new GoogleGenerativeAI(apiKey);
        setGenAI(ai);
      } catch (err) {
        console.error('Initialization error:', err);
        setError(`Error initializing chatbot: ${err.message}`);
      }
    };

    initializeAI();
  }, []);

  // Scroll to bottom when messages change or chat is opened
  useEffect(() => {
    if (messagesEndRef.current && open) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, open]);

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear the chat history?')) {
      setMessages([{ 
        from: 'bot', 
        text: 'Hello! I am the Sagrada Familia Parish assistant. How may I help you today?' 
      }]);
      localStorage.removeItem('chatHistory');
    }
  };

  const sendMessage = async (msg) => {
    if (!msg.trim() || loading) return;
    
    if (!genAI) {
      setMessages(prev => [...prev, 
        { from: 'user', text: msg },
        { from: 'bot', text: 'Sorry, the chatbot is not properly initialized. Please try refreshing the page.' }
      ]);
      return;
    }

    setMessages(prev => [...prev, { from: 'user', text: msg }]);
    setInput('');
    setLoading(true);
    
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent({
        contents: [{
          parts: [{
            text: `You are a helpful assistant for the Sagrada Familia Parish. ${msg}`
          }]
        }]
      });
      const response = await result.response;
      let responseText = '';
      try {
        responseText = response.text();
      } catch (textError) {
        console.error('Error getting text from response:', textError);
        responseText = 'Sorry, I encountered an error processing the response. Please try again.';
      }
      setMessages(prev => [...prev, { from: 'bot', text: responseText }]);
    } catch (error) {
      console.error('Message error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      setMessages(prev => [...prev, { 
        from: 'bot', 
        text: `Error: ${error.message}. Please try again.` 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = (msg) => {
    if (typeof msg.text !== 'string') {
      console.error('Invalid message text:', msg.text);
      return 'Error displaying message';
    }
    return msg.text;
  };

  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
      {open ? (
        <div style={{ width: 340, height: 480, background: 'white', borderRadius: 14, boxShadow: '0 2px 16px #0002', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ background: '#E1D5B8', color: 'white', padding: 14, fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              Sagrada Familia Assistant
              <button 
                onClick={clearHistory} 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: 'white', 
                  fontSize: 14, 
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: 4,
                  opacity: 0.8
                }}
                title="Clear chat history"
              >
                🗑️
              </button>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: 22, cursor: 'pointer' }}>&times;</button>
          </div>
          <div style={{ flex: 1, padding: 14, overflowY: 'auto', background: '#f7f7f7' }}>
            {error && (
              <div style={{ 
                background: '#ffebee', 
                color: '#c62828', 
                padding: '10px', 
                borderRadius: '8px', 
                marginBottom: '10px',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} style={{ textAlign: msg.from === 'user' ? 'right' : 'left', margin: '10px 0' }}>
                <span style={{
                  display: 'inline-block',
                  background: msg.from === 'user' ? '#E1D5B8' : '#e3e3e3',
                  color: '#222',
                  borderRadius: 18,
                  padding: '10px 16px',
                  maxWidth: 240,
                  wordBreak: 'break-word',
                  fontSize: 15
                }}>{renderMessage(msg)}</span>
              </div>
            ))}
            {loading && (
              <div style={{ textAlign: 'left', margin: '10px 0' }}>
                <span style={{
                  display: 'inline-block',
                  background: '#e3e3e3',
                  color: '#888',
                  borderRadius: 18,
                  padding: '10px 16px',
                  fontSize: 15
                }}>Assistant is typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={e => { e.preventDefault(); sendMessage(input); }} style={{ display: 'flex', borderTop: '1px solid #eee', background: '#fff', padding: 8 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type your message..."
              style={{ flex: 1, border: 'none', padding: 12, outline: 'none', fontSize: 16, background: 'transparent' }}
              autoFocus={open}
              disabled={loading || !genAI}
            />
            <button 
              type="submit" 
              disabled={loading || !input.trim() || !genAI} 
              style={{ 
                background: '#E1D5B8', 
                color: 'white', 
                border: 'none', 
                padding: '0 18px', 
                fontSize: 16, 
                cursor: (loading || !input.trim() || !genAI) ? 'not-allowed' : 'pointer', 
                borderRadius: 0,
                opacity: (!genAI) ? 0.5 : 1
              }}
            >
              Send
            </button>
          </form>
        </div>
      ) : (
        <button 
          onClick={() => setOpen(true)} 
          style={{ 
            padding: '15px 22px', 
            backgroundColor: '#E1D5B8', 
            color: 'white', 
            border: 'none', 
            borderRadius: 24, 
            fontWeight: 600, 
            fontSize: 16, 
            boxShadow: '0 2px 8px #0002', 
            cursor: 'pointer' 
          }}
        >
          Chat with us!
        </button>
      )}
    </div>
  );
};

export default Chatbot;