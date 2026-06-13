import os
import sys

# Add root directory to python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from dotenv import load_dotenv
load_dotenv(override=True)

import database
import models
from routers.interview import evaluate_session

db = next(database.get_db())
try:
    user = db.query(models.User).filter(models.User.id == 2).first()
    session = db.query(models.InterviewSession).filter(models.InterviewSession.id == 7).first()
    
    # Reset columns if they were previously modified to start fresh
    session.is_completed = False
    session.overall_score = None
    session.evaluation_report = None
    db.commit()
    db.refresh(session)

    print("User:", user.email)
    print("Session ID:", session.id)
    print("Initial State - is_completed:", session.is_completed)
    print("Initial State - overall_score:", session.overall_score)
    print("Initial State - evaluation_report:", session.evaluation_report)
    
    print("\nTEST: Triggering evaluate_session route...")
    response = evaluate_session(session_id=7, current_user=user, db=db)
    
    print("\nSUCCESS: API response received:")
    print("Score:", response.overall_score)
    print("Summary:", response.summary)
    print("Strengths:", response.strengths)
    print("Weaknesses:", response.weaknesses)
    print("Recommendations:", response.recommendations)
    
    # Reload session from DB to check if columns updated
    db.refresh(session)
    print("\nDatabase State - is_completed:", session.is_completed)
    print("Database State - overall_score:", session.overall_score)
    print("Database State - evaluation_report:", session.evaluation_report is not None)
    
    assert session.is_completed is True
    assert session.overall_score == response.overall_score
    assert session.evaluation_report is not None
    print("\nPASS: Database columns updated successfully.")

except Exception as e:
    import traceback
    traceback.print_exc()
finally:
    db.close()
