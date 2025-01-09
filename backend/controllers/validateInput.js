// backend/controllers/validateInput.js
export default function validateInput(messages) {
    return Array.isArray(messages) && messages.every(
      msg => msg.role && msg.content && typeof msg.role === 'string' && typeof msg.content === 'string'
    );
  }
  