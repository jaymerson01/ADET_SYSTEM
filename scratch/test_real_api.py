import os
import sys

# Add root directory to python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from dotenv import load_dotenv
load_dotenv(override=True)

import database
import models
from routers.interview import interview_chat, ChatRequest

db = next(database.get_db())
try:
    user = db.query(models.User).filter(models.User.id == 2).first()
    session = db.query(models.InterviewSession).filter(models.InterviewSession.id == 6).first()
    print("User:", user.email)
    print("Session:", session.id, "Role:", session.target_role)
    
    payload = ChatRequest(session_id=6, message="Hello! I am ready to start")
    
    response = interview_chat(payload=payload, current_user=user, db=db)
    print("Response:", response)
except Exception as e:
    import traceback
    traceback.print_exc()
finally:
    db.close()
