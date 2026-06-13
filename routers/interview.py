import os
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
import google.generativeai as genai

from database import get_db
from auth import get_current_user
from models import InterviewSession, ChatTranscript, EvaluationReport

router = APIRouter(prefix="/api/interview", tags=["interview"])

MOCK_QUESTIONS = {
    "Frontend Developer": [
        "Could you explain the difference between client-side rendering (CSR) and server-side rendering (SSR)?",
        "How do you handle state management in a large-scale React application?",
        "What are the best practices for optimizing the loading performance of a web application?",
        "Can you describe how CSS Flexbox and Grid differ, and when to use each?",
        "How do you ensure web accessibility (a11y) in your frontend components?",
        "Describe your experience with CSS-in-JS libraries or preprocessors like Sass.",
        "How do you approach testing frontend code, and what tools do you prefer?"
    ],
    "Backend Developer": [
        "What is the difference between SQL and NoSQL databases, and how do you choose?",
        "How do you design a secure and scalable RESTful API?",
        "Can you explain the concept of database indexing and how it affects query performance?",
        "How do you manage authentication and authorization (e.g., JWT, OAuth) in backend systems?",
        "What are some strategies for handling database migrations in a production environment?",
        "Explain the event loop in Node.js or concurrency model in Python/Go.",
        "How do you implement caching (e.g., Redis) to optimize database queries?"
    ],
    "QA Engineer": [
        "What is the difference between regression testing and sanity testing?",
        "How do you write a clear, reproducible bug report?",
        "What tools and frameworks do you use for automated UI testing?",
        "How do you approach API testing, and what tools do you use?",
        "Can you explain the concept of Boundary Value Analysis in test design?",
        "How do you integrate testing into a CI/CD pipeline?",
        "What is your approach to performance and load testing for web applications?"
    ],
    "Data Analyst": [
        "What is the difference between structured and unstructured data?",
        "How do you handle missing or outlier values in a dataset?",
        "Can you describe the difference between INNER JOIN, LEFT JOIN, and outer joins in SQL?",
        "What data visualization tools (e.g., Tableau, PowerBI) do you have experience with?",
        "How do you explain complex data insights to non-technical stakeholders?",
        "What is A/B testing, and how do you determine statistical significance?",
        "How do you write a SQL query to find the second highest salary in an employees table?"
    ]
}

def get_fallback_status(message: str) -> str:
    length = len(message.strip())
    if length > 100:
        return "Excellent"
    elif length >= 40:
        return "Good"
    else:
        return "Needs Improvement"

def generate_mock_evaluation(role: str, transcripts) -> str:
    import json
    
    # Filter only candidate answers
    user_answers = [t.message_text for t in transcripts if t.sender == "user"]
    if not user_answers:
        user_answers = ["Hello"] # Safe fallback
        
    scores = []
    for ans in user_answers:
        length = len(ans.strip())
        if length > 100:
            scores.append(5.0)
        elif length >= 40:
            scores.append(4.0)
        else:
            scores.append(2.5)
            
    avg_quality = round(sum(scores) / len(scores), 1)
    clarity = int(avg_quality * 20)
    
    # Target counts (e.g. "7/7")
    total_questions = len(user_answers)
    questions_answered = f"{total_questions}/7"
    
    if avg_quality >= 4.5:
        performance = "The candidate demonstrated outstanding communication and high technical confidence. Responses were comprehensive, structured, and clear."
        resume = "The candidate's resume shows strong alignment with modern engineering standards and clear highlights of technical frameworks."
        fit = "Highly qualified. The candidate shows strong potential for placement in the target role."
        strengths = "Deep theoretical understanding and excellent structured communication."
        focus = "Advanced System Design"
        rec_len = "Answers were perfectly concise and detailed."
        rec_core = "Review advanced system scalability patterns."
        rec_prac = "Elaborate more on testing configurations in production environments."
    elif avg_quality >= 3.5:
        performance = "The candidate demonstrated solid, reliable communication skills. Answers were generally correct but could use additional depth."
        resume = "The resume is well-written and professional, though it lacks direct focus on performance and optimization keywords."
        fit = "Qualified. Ready for entry-level or junior role responsibilities."
        strengths = "Solid grasp of core technologies and lifecycle methods."
        focus = "Technical Depth"
        rec_len = "Answers were slightly brief; consider adding more technical examples."
        rec_core = "Practice explaining core concurrency and framework lifecycle hooks."
        rec_prac = "Describe hands-on project architectures instead of just library APIs."
    else:
        performance = "Candidate responses were too brief and lacked the vocabulary, technical terminology, and depth required."
        resume = "The resume lists technologies but does not demonstrate clear project implementations and impact."
        fit = "Needs Improvement. The candidate requires further preparation to be fit for the target role."
        strengths = "Familiarity with role terminology and baseline concepts."
        focus = "Technical Definitions"
        rec_len = "Answers were extremely short. Provide detailed, multi-sentence answers in interviews."
        rec_core = "Revisit core documentation and fundamental computer science topics."
        rec_prac = "Build end-to-end applications to gain practical understanding of standard libraries."

    eval_data = {
        "interview_performance": performance,
        "resume_strength": resume,
        "role_fit": fit,
        "key_strengths": strengths,
        "questions_answered": questions_answered,
        "average_response_quality": avg_quality,
        "clarity_score": clarity,
        "focus_area": focus,
        "rec_answer_length": rec_len,
        "rec_core_fundamentals": rec_core,
        "rec_practical_experience": rec_prac
    }
    return json.dumps(eval_data)

class ChatRequest(BaseModel):
    session_id: int
    message: str

class ChatResponse(BaseModel):
    response: str
    status: str

@router.post("/chat", response_model=ChatResponse)
def interview_chat(
    payload: ChatRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # 1. Security Check: Validate that the requested session exists and belongs to the authenticated user
    session = db.query(InterviewSession).filter(InterviewSession.id == payload.session_id).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview session not found"
        )
    
    if session.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this session"
        )

    # 2. Context Generation: Fetch existing transcripts and convert to Gemini SDK format
    transcripts = (
        db.query(ChatTranscript)
        .filter(ChatTranscript.session_id == payload.session_id)
        .order_by(ChatTranscript.timestamp.asc())
        .all()
    )

    history = []
    for t in transcripts:
        # Convert DB sender to "user" or "model" as expected by Gemini SDK
        role = "user" if t.sender == "user" else "model"
        history.append({"role": role, "parts": [t.message_text]})

    # Append user's newest message
    history.append({"role": "user", "parts": [payload.message]})

    # 3. Dynamic System Prompt
    resume_info = session.resume_text if session.resume_text else "No resume text provided."
    system_instruction = (
        f"You are a professional technical interviewer conducting a mock interview for the position of {session.target_role}.\n"
        "Analyze the candidate's resume/CV and target role to tailor your questions appropriately.\n\n"
        f"Candidate Resume Details:\n{resume_info}\n\n"
        "Crucial Instructions:\n"
        "1. Stay completely in character as a professional interviewer throughout the conversation.\n"
        "2. Ask exactly ONE technical question at a time.\n"
        "3. Evaluate the candidate's response to your previous question and ask a follow-up or the next question.\n"
        "4. Do not include any meta-commentary, introductory text, or filler phrases. Start directly with your question or feedback.\n"
        "5. You MUST return a JSON object with exactly two fields:\n"
        "   - 'response': (string) the interviewer's direct question or follow-up.\n"
        "   - 'status': (string) rating of the candidate's latest response. Must be one of 'Excellent', 'Good', or 'Needs Improvement'.\n"
        "Do not output markdown blocks or backticks. Output ONLY raw JSON."
    )

    # 4. API Call & Database Commit with Error Fallback
    try:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable is not set")

        genai.configure(api_key=api_key)

        model = genai.GenerativeModel(
            model_name="gemini-3.5-flash",
            system_instruction=system_instruction
        )

        # Generate response using history requesting JSON
        response = model.generate_content(
            history,
            generation_config={"response_mime_type": "application/json"}
        )
        
        raw_text = response.text
        if not raw_text:
            raise ValueError("Failed to generate response text from Gemini API")

        # Parse JSON structured output
        import json
        clean_json_str = raw_text.strip()
        if clean_json_str.startswith("```json"):
            clean_json_str = clean_json_str[7:]
        if clean_json_str.endswith("```"):
            clean_json_str = clean_json_str[:-3]
        clean_json_str = clean_json_str.strip()

        parsed_data = json.loads(clean_json_str)
        ai_response_text = parsed_data.get("response", "").strip()
        status_rating = parsed_data.get("status", "Good").strip()
        if status_rating not in ["Excellent", "Good", "Needs Improvement"]:
            status_rating = "Good"

        # Create DB transcripts
        user_transcript = ChatTranscript(
            session_id=payload.session_id,
            sender="user",
            message_text=payload.message,
            timestamp=datetime.utcnow()
        )
        ai_transcript = ChatTranscript(
            session_id=payload.session_id,
            sender="model",
            message_text=ai_response_text,
            timestamp=datetime.utcnow()
        )

        db.add(user_transcript)
        db.add(ai_transcript)
        db.commit()

        return ChatResponse(response=ai_response_text, status=status_rating)

    except Exception as exc:
        db.rollback()
        print(f"Gemini API chat error: {str(exc)}. Falling back to local mockup questions.")
        
        try:
            # Fallback local mockup question based on turns
            turn_idx = len(transcripts) // 2
            role_questions = MOCK_QUESTIONS.get(session.target_role, MOCK_QUESTIONS["Frontend Developer"])
            ai_response_text = role_questions[turn_idx % len(role_questions)]
            status_rating = get_fallback_status(payload.message)

            user_transcript = ChatTranscript(
                session_id=payload.session_id,
                sender="user",
                message_text=payload.message,
                timestamp=datetime.utcnow()
            )
            ai_transcript = ChatTranscript(
                session_id=payload.session_id,
                sender="model",
                message_text=ai_response_text,
                timestamp=datetime.utcnow()
            )

            db.add(user_transcript)
            db.add(ai_transcript)
            db.commit()

            return ChatResponse(response=ai_response_text, status=status_rating)
        except Exception as fallback_exc:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"An error occurred during generative chat: {str(fallback_exc)}"
            ) from fallback_exc



class EvaluationResponse(BaseModel):
    interview_performance: str
    resume_strength: str
    role_fit: str
    key_strengths: str
    questions_answered: str
    average_response_quality: float
    clarity_score: int
    focus_area: str
    rec_answer_length: str
    rec_core_fundamentals: str
    rec_practical_experience: str

@router.post("/{session_id}/evaluate", response_model=EvaluationResponse)
def evaluate_session(
    session_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # 1. Security Check: Validate that the session exists and belongs to the current user
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview session not found"
        )
    
    if session.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this session"
        )

    # 2. Context Compilation: Fetch all ChatTranscript entries sorted chronologically
    transcripts = (
        db.query(ChatTranscript)
        .filter(ChatTranscript.session_id == session_id)
        .order_by(ChatTranscript.timestamp.asc())
        .all()
    )

    if not transcripts:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No chat transcript found for this session to evaluate"
        )

    script_parts = []
    for t in transcripts:
        label = "Candidate" if t.sender == "user" else "Interviewer (AI)"
        script_parts.append(f"{label}: {t.message_text}")
    transcript_script = "\n\n".join(script_parts)

    # 3. Gemini System Prompt and Model Configuration
    system_instruction = (
        "You are an expert technical resume screener and corporate talent acquisition specialist. "
        "Review the provided interview chat transcript against the target job role. Be highly critical, analytical, and fair. "
        "You MUST output a raw JSON object containing exactly the following keys and data types:\n"
        "- interview_performance: (string) A brief paragraph summarizing their communication style, soft skills, and overall interview delivery.\n"
        "- resume_strength: (string) A summary assessing how well-written, aligned, and professional their resume text is.\n"
        "- role_fit: (string) A clear rating or summary explaining how qualified they are for their selected target role based on this conversation.\n"
        "- key_strengths: (string) A highlight of their top 2-3 technical edge points.\n"
        "- questions_answered: (string) A string showing the actual total count (e.g., '7/7' or '6/7' based on the transcript turns).\n"
        "- average_response_quality: (float) A floating-point number from 1.0 to 5.0.\n"
        "- clarity_score: (integer) A percentage from 0 to 100 representing how concise and clear their explanations were.\n"
        "- focus_area: (string) A string highlighting their single biggest technical gap or area needing improvement (e.g., 'Technical Depth', 'System Design').\n"
        "- rec_answer_length: (string) Targeted feedback regarding whether their answers were too brief, too long, or perfectly concise.\n"
        "- rec_core_fundamentals: (string) Specific CS/IT fundamentals or theoretical concepts they missed or stumbled on.\n"
        "- rec_practical_experience: (string) Suggestions on how to better explain their actual project frameworks, tools, or hands-on problem-solving.\n\n"
        "You must strictly output the data in the requested JSON structure. Do not append conversational greeting text, markdown backticks, or trailing filler strings."
    )

    # 4. API call and DB state persistence with transaction rollback
    try:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable is not set")

        genai.configure(api_key=api_key)

        model = genai.GenerativeModel(
            model_name="gemini-3.5-flash",
            system_instruction=system_instruction
        )

        prompt = f"Please evaluate the following interview transcript script against the candidate's resume/CV:\n\nCandidate Resume:\n{session.resume_text if session.resume_text else 'No resume text provided.'}\n\nTranscript Script:\n{transcript_script}"
        
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        
        evaluation_json_str = response.text
        if not evaluation_json_str:
            raise ValueError("Empty response text from Gemini API")

        # Parse JSON to validate structure and compute overall_score for DB
        import json
        eval_data = json.loads(evaluation_json_str)
        quality = float(eval_data.get("average_response_quality", 4.0))
        score = int(quality * 20)

        # Update session
        session.evaluation_report = evaluation_json_str
        session.overall_score = score
        session.is_completed = True

        # Insert EvaluationReport record
        existing_report = db.query(EvaluationReport).filter(EvaluationReport.session_id == session.id).first()
        if existing_report:
            db.delete(existing_report)
            db.flush()

        eval_report_row = EvaluationReport(
            session_id=session.id,
            interview_performance=score,
            resume_strength=eval_data.get("resume_strength", ""),
            role_fit=eval_data.get("role_fit", ""),
            key_strength=eval_data.get("key_strengths", ""),
            questions_answered=eval_data.get("questions_answered", ""),
            response_quality=quality,
            clarity_score=int(eval_data.get("clarity_score", 0)),
            focus_area=eval_data.get("focus_area", "")
        )
        db.add(eval_report_row)
        db.commit()

        # Build clean response matching EvaluationResponse
        return EvaluationResponse(
            interview_performance=eval_data.get("interview_performance", ""),
            resume_strength=eval_data.get("resume_strength", ""),
            role_fit=eval_data.get("role_fit", ""),
            key_strengths=eval_data.get("key_strengths", ""),
            questions_answered=eval_data.get("questions_answered", ""),
            average_response_quality=quality,
            clarity_score=int(eval_data.get("clarity_score", 0)),
            focus_area=eval_data.get("focus_area", ""),
            rec_answer_length=eval_data.get("rec_answer_length", ""),
            rec_core_fundamentals=eval_data.get("rec_core_fundamentals", ""),
            rec_practical_experience=eval_data.get("rec_practical_experience", "")
        )

    except Exception as exc:
        db.rollback()
        print(f"Gemini API evaluation error: {str(exc)}. Falling back to local mockup evaluation report.")
        
        try:
            # Dynamic mock evaluation fallback
            evaluation_json_str = generate_mock_evaluation(session.target_role, transcripts)
            import json
            eval_data = json.loads(evaluation_json_str)
            quality = float(eval_data.get("average_response_quality", 4.0))
            score = int(quality * 20)

            session.evaluation_report = evaluation_json_str
            session.overall_score = score
            session.is_completed = True

            existing_report = db.query(EvaluationReport).filter(EvaluationReport.session_id == session.id).first()
            if existing_report:
                db.delete(existing_report)
                db.flush()

            eval_report_row = EvaluationReport(
                session_id=session.id,
                interview_performance=score,
                resume_strength=eval_data.get("resume_strength", ""),
                role_fit=eval_data.get("role_fit", ""),
                key_strength=eval_data.get("key_strengths", ""),
                questions_answered=eval_data.get("questions_answered", ""),
                response_quality=quality,
                clarity_score=int(eval_data.get("clarity_score", 0)),
                focus_area=eval_data.get("focus_area", "")
            )
            db.add(eval_report_row)
            db.commit()

            return EvaluationResponse(
                interview_performance=eval_data.get("interview_performance", ""),
                resume_strength=eval_data.get("resume_strength", ""),
                role_fit=eval_data.get("role_fit", ""),
                key_strengths=eval_data.get("key_strengths", ""),
                questions_answered=eval_data.get("questions_answered", ""),
                average_response_quality=quality,
                clarity_score=int(eval_data.get("clarity_score", 0)),
                focus_area=eval_data.get("focus_area", ""),
                rec_answer_length=eval_data.get("rec_answer_length", ""),
                rec_core_fundamentals=eval_data.get("rec_core_fundamentals", ""),
                rec_practical_experience=eval_data.get("rec_practical_experience", "")
            )
        except Exception as fallback_exc:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"An error occurred during performance evaluation: {str(fallback_exc)}"
            ) from fallback_exc


class TranscriptResponse(BaseModel):
    sender: str
    message_text: str
    timestamp: datetime

    class Config:
        from_attributes = True

@router.get("/{session_id}/history", response_model=list[TranscriptResponse])
def get_session_history(
    session_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview session not found"
        )
    if session.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this session"
        )
    
    transcripts = (
        db.query(ChatTranscript)
        .filter(ChatTranscript.session_id == session_id)
        .order_by(ChatTranscript.timestamp.asc())
        .all()
    )
    return transcripts

@router.get("/{session_id}/evaluation", response_model=EvaluationResponse)
def get_session_evaluation(
    session_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview session not found"
        )
    if session.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this session"
        )
    if not session.is_completed or not session.evaluation_report:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Session has not been evaluated yet"
        )
    
    import json
    eval_data = json.loads(session.evaluation_report)
    return EvaluationResponse(
        interview_performance=eval_data.get("interview_performance", ""),
        resume_strength=eval_data.get("resume_strength", ""),
        role_fit=eval_data.get("role_fit", ""),
        key_strengths=eval_data.get("key_strengths", ""),
        questions_answered=eval_data.get("questions_answered", ""),
        average_response_quality=float(eval_data.get("average_response_quality", 0.0)),
        clarity_score=int(eval_data.get("clarity_score", 0)),
        focus_area=eval_data.get("focus_area", ""),
        rec_answer_length=eval_data.get("rec_answer_length", ""),
        rec_core_fundamentals=eval_data.get("rec_core_fundamentals", ""),
        rec_practical_experience=eval_data.get("rec_practical_experience", "")
    )


history_router = APIRouter(prefix="/api/history", tags=["history"])


class HistoryLogItem(BaseModel):
    session_id: int
    selectedRole: str
    interviewPerformance: int
    created_at: datetime


class DetailedHistoryReportResponse(BaseModel):
    session_id: int
    selectedRole: str
    interviewPerformance: int
    resumeStrength: str
    roleFit: str
    keyStrength: str
    questionsAnswered: str
    responseQuality: float
    clarityScore: int
    focusArea: str
    created_at: datetime
    interview_performance_text: str
    rec_answer_length: str
    rec_core_fundamentals: str
    rec_practical_experience: str


@history_router.get("/list", response_model=list[HistoryLogItem])
def get_history_list(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    results = (
        db.query(
            EvaluationReport.session_id,
            InterviewSession.target_role.label("selectedRole"),
            EvaluationReport.interview_performance.label("interviewPerformance"),
            EvaluationReport.created_at
        )
        .join(InterviewSession, EvaluationReport.session_id == InterviewSession.id)
        .filter(InterviewSession.user_id == current_user.id)
        .order_by(EvaluationReport.created_at.desc())
        .all()
    )
    return results


@history_router.get("/report/{session_id}", response_model=DetailedHistoryReportResponse)
def get_history_report(
    session_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Securely verify that the requested session exists and belongs to the authenticated user
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview session not found"
        )
    if session.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this session"
        )

    # Fetch report from EvaluationReport table
    report = db.query(EvaluationReport).filter(EvaluationReport.session_id == session_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evaluation report not found"
        )

    # Parse full original AI critique text/details from session.evaluation_report JSON
    import json
    eval_data = {}
    if session.evaluation_report:
        try:
            eval_data = json.loads(session.evaluation_report)
        except Exception:
            pass

    return DetailedHistoryReportResponse(
        session_id=report.session_id,
        selectedRole=session.target_role,
        interviewPerformance=report.interview_performance or 0,
        resumeStrength=report.resume_strength or "",
        roleFit=report.role_fit or "",
        keyStrength=report.key_strength or "",
        questionsAnswered=report.questions_answered or "",
        responseQuality=report.response_quality or 0.0,
        clarityScore=report.clarity_score or 0,
        focusArea=report.focus_area or "",
        created_at=report.created_at,
        interview_performance_text=eval_data.get("interview_performance", ""),
        rec_answer_length=eval_data.get("rec_answer_length", ""),
        rec_core_fundamentals=eval_data.get("rec_core_fundamentals", ""),
        rec_practical_experience=eval_data.get("rec_practical_experience", "")
    )



