export default function InterviewChat({ question, value, onChange, onSubmit, onNext, feedback }) {
  return (
    <div className="interview-chat">
      <div className="chat-top">
        <div className="question-box">
          <div className="q-label">Interviewer</div>
          <div className="q-text">{question}</div>
        </div>
      </div>
      <div className="chat-input">
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder="Type your answer here..." />
        <div className="chat-actions">
          <button className="secondary" onClick={onSubmit}>Submit Answer</button>
          <button className="ghost" onClick={onNext}>Next Question</button>
        </div>
      </div>
      <div className="chat-feedback">
        {feedback ? (
          <div className="feedback-cards">
            <div className="feedback-item"><strong>Clarity:</strong> {feedback.clarity}</div>
            <div className="feedback-item"><strong>Technical:</strong> {feedback.technical}</div>
            <div className="feedback-item"><strong>Confidence:</strong> {feedback.confidence}</div>
            <div className="feedback-item"><strong>Improve:</strong> {feedback.improvement}</div>
          </div>
        ) : (
          <div className="muted">Submit your answer to see AI-style feedback.</div>
        )}
      </div>
    </div>
  );
}
