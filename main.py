import pdfplumber
from fastapi import Depends, FastAPI, File, Form, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from auth import get_current_user, router as auth_router
from database import Base, engine, get_db
from models import InterviewSession

Base.metadata.create_all(bind=engine)

app = FastAPI(title="ADET_SYSTEM API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)


@app.post("/api/session/start", status_code=status.HTTP_201_CREATED)
def start_session(
    selectedRole: str = Form(...),
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only PDF files are allowed")

    try:
        with pdfplumber.open(file.file) as pdf:
            extracted_text = "\n".join(page.extract_text() or "" for page in pdf.pages)
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unable to read PDF file") from exc

    clean_text = " ".join(extracted_text.split())

    session = InterviewSession(
        user_id=current_user.id,
        target_role=selectedRole,
        resume_text=clean_text,
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    return {"session_id": session.id}


@app.get("/")
def read_root():
    return {"message": "ADET_SYSTEM API is running"}
