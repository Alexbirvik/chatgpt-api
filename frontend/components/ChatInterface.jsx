import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const TOKEN_PRICES = {
  'gpt-4': { input: 0.03 / 1000, output: 0.06 / 1000 },
  'o1-2024-12-17': { input: 0.015 / 1000, output: 0.06 / 1000 },
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
  const inputRef = useRef(null);

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
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !loading) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleModelChange = (e) => {
    setModel(e.target.value);
  };

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
              <code {...props}>{children}</code>
            </pre>
          );
        },
        li({ children }) {
          return <li style={styles.bulletPoint}>{children}</li>;
        },
        p({ children }) {
          return <p style={styles.paragraph}>{children}</p>;
        },
      }}
    >
      {text}
    </ReactMarkdown>
  );

  return (
    <div style={styles.container}>
      <div style={styles.titleContainer}>
        <div style={styles.costContainer}>
          <span>Request Cost: ${currentCost.toFixed(6)}</span>
          <span>Total Cost per session: ${totalCost.toFixed(6)}</span>
        </div>

        <h1 style={styles.title}>Local ChatGPT</h1>

        <select value={model} onChange={handleModelChange} style={styles.modelSwitcher}>
          <option value="gpt-4">GPT-4💸💸</option>
          <option value="o1-preview">GPT-o1💸</option>
          <option value="gpt-4o-2024-08-06">GPT-4o</option>
          <option value="gpt-4o-mini">GPT-4o-mini</option>
        </select>
      </div>

      <div style={styles.chatBox}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={msg.role === 'user' ? styles.userMessage : styles.assistantMessage}
          >
            <strong>{msg.role}:</strong>
            {msg.role === 'assistant' || 'user' ? formatText(msg.content) : <span>{msg.content}</span>}
          </div>
        ))}
      </div>

      <div style={styles.inputContainer}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message... (Shift+Enter for new line)"
          style={styles.textarea}
        />
        <button onClick={sendMessage} disabled={loading} style={styles.button}>
          {loading ? 'Loading...' : 'Send'}
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
    cursor: 'pointer',
  },
  chatBox: {
    flex: 1,
    overflowY: 'auto',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    padding: '10px',
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
    borderRadius: '4px',
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
};
