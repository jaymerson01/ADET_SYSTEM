import { useState, useRef, useEffect } from "react";
import "../styles/pages/InterviewRoom.css";

function InterviewRoom({ session: sessionBundle }) {
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [turnCount, setTurnCount] = useState(1);
  const [sessionTime, setSessionTime] = useState({ minutes: 0, seconds: 0 });
  const chatEndRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      type: "ai",
      text: "Hi! I’m your AI interviewer. Please introduce yourself and tell me about your technical background.",
    },
  ]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Session timer: counts up in minutes and seconds (mm:ss format)
  useEffect(() => {
    const timerInterval = setInterval(() => {
      setSessionTime((prev) => {
        if (prev.seconds === 59) {
          return { minutes: prev.minutes + 1, seconds: 0 };
        }
        return { minutes: prev.minutes, seconds: prev.seconds + 1 };
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, []);

  const handleSendMessage = async (event) => {
    event.preventDefault();
    if (!answer.trim() || isLoading) return;

    const messageText = answer.trim();

    setMessages((prev) => [...prev, { type: "user", text: messageText }]);
    setAnswer("");
    setIsLoading(true);

    try {
      // TODO: Replace this placeholder with the real Python backend request.
      // Example: const response = await fetch('/api/interview', { method: 'POST', body: jsonPayload });
      await new Promise((resolve) => setTimeout(resolve, 1200));

      setMessages((prev) => [
        ...prev,
        {
          type: "ai",
          text: "Nice answer. Now, can you explain one project you built and what your role was?",
        },
      ]);

      if (turnCount < 5) setTurnCount((count) => count + 1);
    } finally {
      setIsLoading(false);
    }
  };

  const clearAnswer = () => setAnswer("");

  // Empty boilerplate function: Future Speech-to-Text API logic here
  const handleVoiceInputToggle = () => {
    /* Future Speech-to-Text API logic here */
    startVoiceInput();
  };

  const startVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice recognition is not supported. Please use Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      setAnswer(event.results[0][0].transcript);
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  // Format time as mm:ss
  const formatTime = (mins, secs) => {
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="interview-page">
      <section className="interview-hero">
        <div>
          <span className="eyebrow">AI Mock Interview</span>
          <h1>Practice like it's the real thing.</h1>
          <p>
            Answer interview questions, use voice input, and prepare confidently
            for your target IT role.
          </p>
        </div>

        <div className="interview-badge">
          <span>● Live Session</span>
          <strong>Frontend Developer</strong>
        </div>
      </section>

      <section className="interview-layout">
        {/* Sidebar Column */}
        <aside className="interview-sidebar">
          {/* Session Progress Panel */}
          <div>
            <h3 style={{ marginBottom: "0.75rem" }}>Session Progress</h3>
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginBottom: "0.75rem" }}>
              <span style={{ fontSize: "1.875rem", fontWeight: "700" }}>{turnCount}</span>
              <span style={{ color: "var(--text-secondary)" }}>of</span>
              <span>5</span>
            </div>
            {/* Progress bar */}
            <div className="progress-wrap">
              <div
                className="progress-bar"
                style={{ width: `${(turnCount / 5) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Session Timer Panel */}
          <div style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "1.5rem" }}>
            <h3 style={{ marginBottom: "0.75rem" }}>Session Timer</h3>
            <div style={{ fontSize: "2.25rem", fontWeight: "700", fontFamily: "monospace", letterSpacing: "0.05em" }}>
              {formatTime(sessionTime.minutes, sessionTime.seconds)}
            </div>
            <p style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginTop: "0.5rem" }}>
              Interview duration
            </p>
          </div>

          {/* Interview Status Panel */}
          <div>
            <h3 style={{ marginBottom: "0.75rem" }}>Status</h3>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 0.75rem",
                borderRadius: "999px",
                backgroundColor: "#DCFCE7",
                border: "1px solid #86EFAC",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: "0.5rem",
                  height: "0.5rem",
                  backgroundColor: "#22C55E",
                  borderRadius: "50%",
                }}
              ></span>
              <span style={{ fontSize: "0.875rem", fontWeight: "500", color: "#15803D" }}>Good</span>
            </div>
            <p style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginTop: "0.75rem" }}>
              In Progress
            </p>
          </div>

          <div style={{ marginTop: "1.5rem" }}>
            <h3 style={{ marginBottom: "0.75rem" }}>Session Details</h3>
            <p style={{ margin: 0, color: "var(--text-secondary)" }}>
              Role: <strong>{sessionBundle?.role || "N/A"}</strong>
            </p>
            <p style={{ margin: "0.35rem 0 0", color: "var(--text-secondary)" }}>
              Resume: <strong>{sessionBundle?.file?.name || "No resume selected"}</strong>
            </p>
          </div>
        </aside>

        {/* Main Chat Column */}
        <main className="interview-chat-card">
          <div className="chat-topbar">
            <div>
              <h2>AI Interview Room</h2>
              <p>Answer clearly and professionally.</p>
            </div>

            <span className="session-pill" style={{ backgroundColor: isListening ? "#FEE2E2" : "var(--bg-light)", color: isListening ? "#991B1B" : "var(--text-secondary)" }}>
              {isListening ? "● Listening..." : "Ready"}
            </span>
          </div>

          <div className="chat-window">
            {messages.map((msg, index) => (
              <div key={index} className={`chat-message ${msg.type}`}>
                <div className="message-avatar">
                  {msg.type === "ai" ? "AI" : "YOU"}
                </div>

                <div className="message-bubble">
                  <span>{msg.type === "ai" ? "AI Interviewer" : "Your Answer"}</span>
                  <p>{msg.text}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="chat-message ai typing">
                <div className="message-avatar">AI</div>
                <div className="message-bubble">
                  <span>AI Interviewer</span>
                  <p>AI is typing...</p>
                </div>
              </div>
            )}

            {/* Auto-scroll anchor */}
            <div ref={chatEndRef} />
          </div>

          <form className="answer-box" onSubmit={handleSendMessage}>
            <textarea
              placeholder="Type your answer here or use voice command..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={isLoading}
            />

            <div className="answer-actions">
              <button className="button button-primary" type="submit" disabled={!answer.trim() || isLoading}>
                {isLoading ? 'Sending...' : 'Send Answer'}
              </button>

              <button
                type="button"
                className="button voice-btn"
                onClick={handleVoiceInputToggle}
                disabled={isLoading}
                style={{
                  backgroundColor: isListening ? "#EF4444" : "var(--bg-light)",
                  color: isListening ? "#FFFFFF" : "var(--text-secondary)",
                  boxShadow: isListening ? "0 0 20px rgba(239, 68, 68, 0.5)" : "none",
                  animation: isListening ? "pulse 2s infinite" : "none",
                }}
              >
                🎤 {isListening ? "Recording..." : "Voice Answer"}
              </button>

              <button type="button" className="button button-secondary" onClick={clearAnswer} disabled={isLoading}>
                Clear
              </button>
            </div>
          </form>
        </main>
      </section>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}

export default InterviewRoom;