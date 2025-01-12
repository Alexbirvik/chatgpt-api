import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const TOKEN_PRICES = {
  'gpt-4': { input: 0.03 / 1000, output: 0.06 / 1000 },
  'o1-preview': { input: 0.015 / 1000, output: 0.06 / 1000 },
  'gpt-4o-2024-08-06': { input: 0.0025 / 1000, output: 0.01 / 1000 },
  'gpt-4o-mini': { input: 0.00015 / 1000, output: 0.0006 / 1000 },
};

export default function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState('gpt-4o-2024-08-06');
  const [currentCost, setCurrentCost] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const formatText = (text) => (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ node, inline, className, children, ...props }) {
          return inline ? (
            <code style={styles.inlineCode} {...props}>
              {children}
            </code>
          ) : (
            <pre style={styles.codeBlock}>
              <code {...props}>
                {children}
              </code>
            </pre>
          );
        },
      }}
    >
      {text}
    </ReactMarkdown>
  );

  useEffect(() => {
    document.body.style.backgroundColor = '#f1f2f6';
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, model }),
      });

      const data = await response.json();
      console.log('Backend Data:', data);

      const { prompt_tokens, completion_tokens } = data.usage || { prompt_tokens: 0, completion_tokens: 0 };

      const inputCost = prompt_tokens * (TOKEN_PRICES[model]?.input || 0);
      const outputCost = completion_tokens * (TOKEN_PRICES[model]?.output || 0);
      const requestCost = inputCost + outputCost;

      setCurrentCost(requestCost);
      setTotalCost((prev) => prev + requestCost);

      setMessages([...newMessages, { role: 'assistant', content: data.choices[0].message.content }]);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleModelChange = (e) => {
    setModel(e.target.value);
  };

  return (
    <div style={styles.container}>
      {error && (
        <div style={styles.errorMessage}>
          {error}
        </div>
      )}

      <div style={styles.titleContainer}>
        <div style={styles.costContainer}>
          <span>Request Cost: ${currentCost.toFixed(6)}</span>
          <span>Total Cost per session: ${totalCost.toFixed(6)}</span>
        </div>

        <h1 style={styles.title}>Local ChatGPT</h1>

        <select 
          value={model} 
          onChange={(e) => setModel(e.target.value)}
          disabled={loading}
          style={{
            ...styles.modelSwitcher,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          <option value="gpt-4">GPT-4💸💸</option>
          <option value="o1-preview">GPT-o1💸</option>
          <option value="gpt-4o-2024-08-06">GPT-4o</option>
          <option value="gpt-4o-mini">GPT-4o-mini</option>
        </select>
      </div>

      <div style={styles.messageContainer}>
        {messages.map((message, index) => (
          <div
            key={index}
            style={{
              ...styles[`${message.role}Message`],
              opacity: loading && index === messages.length - 1 ? 0.5 : 1
            }}
          >
            {formatText(message.content)}
          </div>
        ))}
        {loading && (
          <div style={styles.loadingIndicator}>
            <div className="typing-dots">
              <span>.</span><span>.</span><span>.</span>
            </div>
          </div>
        )}
      </div>

      <div style={styles.inputContainer}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !loading) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Type your message..."
          disabled={loading}
          style={{
            ...styles.textarea,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? 'not-allowed' : 'text'
          }}
        />
        <button 
          onClick={sendMessage} 
          disabled={loading} 
          style={{
            ...styles.button,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: '70%',
    height: '90vh',
    margin: '30px auto',
    padding: '15px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
    fontFamily: 'Arial, sans-serif',
    display: 'flex',
    flexDirection: 'column',
  },
  titleContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
    position: 'relative',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: '1.5em',
    fontWeight: 'bold',
  },
  costContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    fontSize: '12px',
    color: '#555',
    position: 'absolute',
    left: 0,
  },
  modelSwitcher: {
    position: 'absolute',
    right: 0,
    padding: '5px',
    fontSize: '14px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    backgroundColor: '#fff',
    transition: 'opacity 0.2s ease',
  },
  messageContainer: {
    flex: 1,
    overflowY: 'auto',
    border: '1px solid #e0e0e0',
    borderRadius: '6px',
    padding: '10px 15px',
    marginBottom: '20px',
    backgroundColor: '#fafafa',
  },
  userMessage: {
    textAlign: 'right',
    margin: '5px 0',
    color: '#007aff',
  },
  assistantMessage: {
    textAlign: 'left',
    margin: '5px 0',
    color: '#333',
  },
  inputContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textarea: {
    flex: 1,
    padding: '10px',
    fontSize: '14px',
    borderRadius: '6px',
    border: '1px solid #ccc',
  },
  button: {
    marginLeft: '15px',
    padding: '10px 20px',
    fontSize: '14px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: '#007aff',
    color: '#fff',
    cursor: 'pointer',
  },
  codeBlock: {
    backgroundColor: '#2f3640',
    color: '#26de81',
    padding: '10px',
    borderRadius: '4px',
    overflowX: 'auto',
  },
  inlineCode: {
    backgroundColor: '#2f3640',
    color: '#26de81',
    padding: '10px',
    borderRadius: '4px',
    overflowX: 'auto',
  },
  errorMessage: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: '10px',
    borderRadius: '4px',
    marginBottom: '10px',
    textAlign: 'center',
    fontSize: '14px',
  },
  loadingIndicator: {
    display: 'flex',
    justifyContent: 'center',
    padding: '10px',
    color: '#007aff',
    fontSize: '42px',
    lineHeight: '24px',
  },
};
