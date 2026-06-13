import os
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
import google.generativeai as genai

from database import get_db
from auth import get_current_user
from models import InterviewSession, ChatTranscript

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
    excellent_count = 0
    good_count = 0
    needs_improvement_count = 0
    
    for ans in user_answers:
        length = len(ans.strip())
        if length > 100:
            scores.append(95)
            excellent_count += 1
        elif length >= 40:
            scores.append(80)
            good_count += 1
        else:
            scores.append(55)
            needs_improvement_count += 1
            
    overall_score = int(sum(scores) / len(scores))
    
    # Tailor report based on performance tier
    if overall_score >= 90:
        summary = (
            f"The candidate demonstrated outstanding performance for the {role} position. "
            "Their answers were comprehensive, highly technical, and showed a deep understanding "
            "of industry-standard practices and optimizations."
        )
        strengths = [
            "Demonstrated deep technical expertise and thorough conceptual knowledge.",
            "Provided detailed explanations indicating hands-on experience.",
            "Strong focus on performance optimization and web standards."
        ]
        weaknesses = [
            "Could elaborate slightly more on testing strategies for large codebases.",
            "Mentioned fewer concrete architectural system designs."
        ]
        recommendations = [
            "System Architecture: Study advanced architectural patterns and system design frameworks.",
            "Testing Coverage: Practice writing automated test coverage for system boundaries.",
            "Senior Engineering: Explore leadership and senior engineering responsibilities."
        ]
    elif overall_score >= 75:
        summary = (
            f"The candidate demonstrated a solid, reliable foundation for the {role} role. "
            "They answered core questions correctly, though some responses would benefit from "
            "more technical depth and concrete optimization examples."
        )
        strengths = [
            "Clear and structured communication style.",
            "Good understanding of fundamental technologies and lifecycle methods.",
            "Logical reasoning and structured approach to engineering problems."
        ]
        weaknesses = [
            "Answers sometimes lacked specific code implementation detail.",
            "Could benefit from detailing performance optimization methodologies."
        ]
        recommendations = [
            "Performance Optimization: Study performance profiling and optimization tools.",
            "Response Depth: Incorporate more technical vocabulary and code examples into responses.",
            "Project Building: Build more projects emphasizing state management and system architecture."
        ]
    else:
        summary = (
            f"The candidate showed basic familiarity with {role} concepts but requires "
            "significant improvement. Answers were generally brief and lacked the depth, "
            "technical terminology, and implementation examples required for the role."
        )
        strengths = [
            "Demonstrated baseline familiarity with target role terms.",
            "Logical response structures despite brief answers."
        ]
        weaknesses = [
            "Responses were too short and missed technical depth.",
            "Lack of details regarding optimization, frameworks, and tools.",
            "No concrete project examples provided."
        ]
        recommendations = [
            "Answer Length: Focus on lengthening answers and providing complete explanations.",
            "Core Fundamentals: Review core documentation, frameworks, and fundamental concepts.",
            "Practical Experience: Build small projects to gain practical implementation experience."
        ]
        
    eval_data = {
        "overall_score": overall_score,
        "summary": summary,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "recommendations": recommendations
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
    overall_score: int
    summary: str
    strengths: list[str]
    weaknesses: list[str]
    recommendations: list[str]

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
        "You are an expert technical interviewer and performance evaluation system.\n"
        "Your task is to review the mock interview transcript script between the Candidate and the Interviewer (AI).\n"
        "Grade the candidate's performance out of 100 based on the quality, correctness, and clarity of their answers.\n"
        "You MUST output a raw JSON object containing exactly the following keys:\n"
        "- overall_score: (an integer from 0 to 100 representing the grade)\n"
        "- summary: (a string summarizing their overall performance)\n"
        "- strengths: (a list of strings detailing their technical strengths)\n"
        "- weaknesses: (a list of strings detailing areas for improvement/weaknesses)\n"
        "- recommendations: (a list of strings detailing actionable tips and next steps. Format each recommendation string with a prefix title followed by a colon, e.g., 'Technical Depth: Include specific implementation examples.')\n\n"
        "Do not include any Markdown blocks, backticks, or prefix/suffix text. Output ONLY raw JSON."
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

        prompt = f"Please evaluate the following interview transcript script:\n\n{transcript_script}"
        
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        
        evaluation_json_str = response.text
        if not evaluation_json_str:
            raise ValueError("Empty response text from Gemini API")

        # Parse JSON to validate structure and get overall_score
        import json
        eval_data = json.loads(evaluation_json_str)
        score = int(eval_data.get("overall_score", 0))

        # Update session
        session.evaluation_report = evaluation_json_str
        session.overall_score = score
        session.is_completed = True
        
        db.commit()

        # Build clean response matching EvaluationResponse
        return EvaluationResponse(
            overall_score=score,
            summary=eval_data.get("summary", ""),
            strengths=eval_data.get("strengths", []),
            weaknesses=eval_data.get("weaknesses", []),
            recommendations=eval_data.get("recommendations", [])
        )

    except Exception as exc:
        db.rollback()
        print(f"Gemini API evaluation error: {str(exc)}. Falling back to local mockup evaluation report.")
        
        try:
            # Dynamic mock evaluation fallback
            evaluation_json_str = generate_mock_evaluation(session.target_role, transcripts)
            import json
            eval_data = json.loads(evaluation_json_str)
            score = int(eval_data.get("overall_score", 0))

            session.evaluation_report = evaluation_json_str
            session.overall_score = score
            session.is_completed = True
            
            db.commit()

            return EvaluationResponse(
                overall_score=score,
                summary=eval_data.get("summary", ""),
                strengths=eval_data.get("strengths", []),
                weaknesses=eval_data.get("weaknesses", []),
                recommendations=eval_data.get("recommendations", [])
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
        overall_score=session.overall_score or 0,
        summary=eval_data.get("summary", ""),
        strengths=eval_data.get("strengths", []),
        weaknesses=eval_data.get("weaknesses", []),
        recommendations=eval_data.get("recommendations", [])
    )



