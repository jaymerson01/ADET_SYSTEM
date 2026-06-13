import os
import sys

# Add root directory to python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from database import Base
from models import User, InterviewSession, ChatTranscript
from routers.interview import interview_chat, ChatRequest

# Setup test DB
TEST_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables
Base.metadata.create_all(bind=engine)

db = TestingSessionLocal()

try:
    # 1. Create a mock user
    test_user = User(
        name="Test Candidate",
        email="candidate@iskolarngbayan.pup.edu.ph",
        password_hash="hashed_password"
    )
    db.add(test_user)
    db.commit()
    db.refresh(test_user)

    # 2. Create another user for permission testing
    other_user = User(
        name="Other Candidate",
        email="other@iskolarngbayan.pup.edu.ph",
        password_hash="hashed_password"
    )
    db.add(other_user)
    db.commit()
    db.refresh(other_user)

    # 3. Create an interview session
    test_session = InterviewSession(
        user_id=test_user.id,
        target_role="Frontend Developer",
        resume_text="React expert with 3 years of experience in state management."
    )
    db.add(test_session)
    db.commit()
    db.refresh(test_session)

    print("SUCCESS: Mock database tables, users, and session created.")

    # 4. Test session existence validation (404 check)
    print("TEST: Testing session existence (404 status check)...")
    try:
        payload = ChatRequest(session_id=999, message="Hello")
        interview_chat(payload=payload, current_user=test_user, db=db)
    except HTTPException as e:
        assert e.status_code == 404
        print("PASS: Session not found correctly raises 404.")
    except Exception as e:
        print(f"FAIL: Unexpected error {e}")

    # 5. Test session ownership validation (403 check)
    print("TEST: Testing session ownership (403 status check)...")
    try:
        payload = ChatRequest(session_id=test_session.id, message="Hello")
        interview_chat(payload=payload, current_user=other_user, db=db)
    except HTTPException as e:
        assert e.status_code == 403
        print("PASS: Accessing other user's session correctly raises 403.")
    except Exception as e:
        print(f"FAIL: Unexpected error {e}")

    # 6. Test Gemini SDK configuration check & Rollback check
    # Since GEMINI_API_KEY is not set or we use a dummy value, calling generate_content will raise an exception.
    # We want to verify that the exception is caught, handled (500 status), and any database additions are rolled back.
    print("TEST: Testing API key configuration / validation and rollback behavior...")
    # Set a dummy key to trigger API level error instead of None variable error
    os.environ["GEMINI_API_KEY"] = "dummy_invalid_key"
    
    # We will verify that no transcript record is inserted because of rollback
    transcripts_before = db.query(ChatTranscript).filter(ChatTranscript.session_id == test_session.id).count()
    assert transcripts_before == 0

    try:
        payload = ChatRequest(session_id=test_session.id, message="Let's start the interview.")
        interview_chat(payload=payload, current_user=test_user, db=db)
    except HTTPException as e:
        assert e.status_code == 500
        print(f"PASS: API/DB error handled correctly, returned 500. Detail: {e.detail}")
    except Exception as e:
        print(f"FAIL: Unexpected error {e}")

    transcripts_after = db.query(ChatTranscript).filter(ChatTranscript.session_id == test_session.id).count()
    assert transcripts_after == 0
    print("PASS: Database transaction correctly rolled back. No transcripts were written.")

finally:
    db.close()
