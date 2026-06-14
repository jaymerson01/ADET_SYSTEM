from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text, Float
from sqlalchemy.orm import relationship

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    course = Column(String(100), nullable=True)
    password_hash = Column(String(255), nullable=True)
    google_id = Column(String(100), unique=True, index=True, nullable=True)

    interview_sessions = relationship("InterviewSession", back_populates="user", cascade="all, delete-orphan")


class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    target_role = Column(String(100), nullable=False)
    resume_text = Column(Text, nullable=True)
    is_completed = Column(Boolean, default=False, nullable=False)
    evaluation_report = Column(Text, nullable=True)
    overall_score = Column(Integer, nullable=True)

    user = relationship("User", back_populates="interview_sessions")
    chat_transcripts = relationship("ChatTranscript", back_populates="session", cascade="all, delete-orphan")
    evaluation = relationship("EvaluationReport", back_populates="session", uselist=False, cascade="all, delete-orphan")


class ChatTranscript(Base):
    __tablename__ = "chat_transcripts"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("interview_sessions.id", ondelete="CASCADE"), nullable=False)
    sender = Column(String(50), nullable=False)
    message_text = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)

    session = relationship("InterviewSession", back_populates="chat_transcripts")


class EvaluationReport(Base):
    __tablename__ = "evaluation_reports"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("interview_sessions.id", ondelete="CASCADE"), nullable=False, unique=True)
    interview_performance = Column(Integer, nullable=True)
    resume_strength = Column(Text, nullable=True)
    role_fit = Column(Text, nullable=True)
    key_strength = Column(Text, nullable=True)
    questions_answered = Column(String(50), nullable=True)
    response_quality = Column(Float, nullable=True)
    clarity_score = Column(Integer, nullable=True)
    focus_area = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    session = relationship("InterviewSession", back_populates="evaluation")
