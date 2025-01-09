// backend/server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import chatController from './controllers/chatController.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Chat endpoint
app.post('/api/chat', chatController);

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
