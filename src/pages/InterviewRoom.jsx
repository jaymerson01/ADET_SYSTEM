import { useState } from "react";

function InterviewRoom() {
  const [answer, setAnswer] = useState("");
  const [isListening, setIsListening] = useState(false);

  const [messages, setMessages] = useState([
    {
      type: "ai",
      text: "Hi! I’m your AI interviewer. Please introduce yourself and tell me about your technical background.",
    },
  ]);

  const sendAnswer = () => {
    if (!answer.trim()) return;

    setMessages((prev) => [
      ...prev,
      { type: "user", text: answer },
      {
        type: "ai",
        text: "Nice answer. Now, can you explain one project you built and what your role was?",
      },
    ]);

    setAnswer("");
  };

  const clearAnswer = () => setAnswer("");

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

  return (
    <div className="interview-page">
      <section className="interview-hero">
        <div>
          <span className="eyebrow">AI Mock Interview</span>
          <h1>Practice like it’s the real thing.</h1>
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
        <aside className="interview-sidebar">
          <div className="ai-avatar">AI</div>

          <h3>Interview Progress</h3>
          <p>Question 2 of 5</p>

          <div className="progress-wrap">
            <div className="progress-bar"></div>
          </div>

          <div className="interview-stats">
            <div>
              <span>92%</span>
              <p>Confidence</p>
            </div>

            <div>
              <span>4m</span>
              <p>Time Used</p>
            </div>

            <div>
              <span>Good</span>
              <p>Status</p>
            </div>
          </div>
        </aside>

        <main className="interview-chat-card">
          <div className="chat-topbar">
            <div>
              <h2>AI Interview Room</h2>
              <p>Answer clearly and professionally.</p>
            </div>

            <span className="session-pill">
              {isListening ? "Listening..." : "Ready"}
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
          </div>

          <div className="answer-box">
            <textarea
              placeholder="Type your answer here or use voice command..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />

            <div className="answer-actions">
              <button className="button button-primary" onClick={sendAnswer}>
                Send Answer
              </button>

              <button className="button voice-btn" onClick={startVoiceInput}>
                {isListening ? "Listening..." : "🎤 Voice Answer"}
              </button>

              <button className="button button-secondary" onClick={clearAnswer}>
                Clear
              </button>
            </div>
          </div>
        </main>
      </section>
    </div>
  );
}

export default InterviewRoom;