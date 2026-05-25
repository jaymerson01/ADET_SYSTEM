import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SYSTEM_PROMPT = 'Welcome to your mock interview. Answer each prompt as if you were presenting yourself to an IT hiring manager.';

export default function InterviewRoom({ session }) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState(() => [
    {
      sender: 'ai',
      text: session?.role
        ? `Let\'s begin your ${session.role} mock interview. Please respond to each prompt clearly and confidently.`
        : SYSTEM_PROMPT,
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [turnCount, setTurnCount] = useState(0);
  const [showEvaluationAction, setShowEvaluationAction] = useState(false);
  const chatEndRef = useRef(null);

  const handleSendMessageToBackend = async (text) => {
    // Placeholder for backend integration with Python API
    await new Promise((resolve) => setTimeout(resolve, 750));
    return `AI: I received your answer: \"${text}\". Please continue with the next question.`;
  };

  const handleCompleteInterview = async () => {
    navigate('/evaluation');
  };

  useEffect(() => {
    if (turnCount >= 5) {
      setShowEvaluationAction(true);
    }
  }, [turnCount]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages, isLoading]);

  const appendMessage = (message) => {
    setMessages((prev) => [...prev, message]);
  };

  const handleSend = async () => {
    const trimmed = inputText.trim();
    if (!trimmed || isLoading) return;

    appendMessage({ sender: 'user', text: trimmed });
    setInputText('');
    setIsLoading(true);

    const response = await handleSendMessageToBackend(trimmed);
    appendMessage({ sender: 'ai', text: response });
    setIsLoading(false);
    setTurnCount((count) => count + 1);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const currentPrompt = messages.length > 0 ? messages[messages.length - 1]?.text : SYSTEM_PROMPT;

  return (
    <section className="section layout-shell">
      <div className="section-heading">
        <p className="eyebrow">Interview Room</p>
        <h2 className="heading-xl">{session?.role ? `${session.role} Mock Interview` : 'Mock Interview'}</h2>
        <p className="muted lead-text">
          {session?.file ? `Using resume: ${session.file.name}` : 'Upload a PDF resume first to connect it to your session.'}
        </p>
      </div>

      <div className="review-grid">
        <div className="card status-panel">
          <div className="panel-header">
            <h3>Status Overview</h3>
            <span className="tag">Turn {turnCount} / 5</span>
          </div>
          <div className="panel-body">
            <p><strong>Selected role:</strong> {session?.role || 'Not selected yet'}</p>
            <p><strong>Resume:</strong> {session?.file ? session.file.name : 'No file attached'}</p>
            <p className="muted">Current prompt shown in the chat window below.</p>
          </div>
        </div>

        <div className="card chat-panel">
          <div className="chat-surface">
            <div className="chat-log">
              {messages.map((message, index) => (
                <div key={index} className={`message ${message.sender}`}>
                  <div className="message-label">{message.sender === 'ai' ? 'Interviewer' : 'You'}</div>
                  <p>{message.text}</p>
                </div>
              ))}
              {isLoading && (
                <div className="thinking-indicator">
                  <span className="dot" />
                  <span className="dot" />
                  <span className="dot" />
                  <span>AI is thinking...</span>
                </div>
              )}
            </div>
          </div>

          <div className="chat-input-panel">
            <textarea
              className="dark-input"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your answer here and press Enter or click Send..."
            />
            <div className="chat-actions">
              <button className="button button-primary" type="button" onClick={handleSend} disabled={!inputText.trim() || isLoading}>
                Send
              </button>
              <button className="button button-ghost" type="button" onClick={() => setInputText('')}>
                Clear
              </button>
            </div>
          </div>

          {showEvaluationAction && (
            <div className="feedback-summary polished-summary">
              <p>You've completed the interview practice session.</p>
              <button className="button button-secondary" type="button" onClick={handleCompleteInterview}>
                Go to Evaluation Report
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
