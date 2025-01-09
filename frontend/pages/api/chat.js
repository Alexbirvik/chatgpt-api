// frontend/pages/api/chat.js
export default async function handler(req, res) {
    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body)
      });
  
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      console.error('Frontend API Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
  