import json
from django.conf import settings
import uuid
import traceback
from groq import Groq

_client = None


def get_groq_client():
    """Lazily create the Groq client so a missing API key doesn't crash Django on startup."""
    global _client
    if _client is None:
        if not settings.GROQ_API_KEY:
            raise ValueError("GROQ_API_KEY is not configured")
        _client = Groq(api_key=settings.GROQ_API_KEY)
    return _client

class InterviewChatbot:
    """Groq-powered interview preparation chatbot using Llama 3"""
    
    def __init__(self):
        self.model = "llama-3.3-70b-versatile"
        self.predefined_faqs = {
            "tell me about yourself": "When answering 'Tell me about yourself', focus on your professional background, relevant skills, and experiences. Start with a brief introduction, highlight key achievements, and connect your background to the job you're applying for. Keep it concise (1-2 minutes) and avoid personal details not relevant to the position.",
            "what are your strengths": "When discussing strengths, choose 2-3 qualities relevant to the position. Provide specific examples that demonstrate these strengths in action. Focus on skills that will add value to the company and try to align them with the job requirements.",
            "what are your weaknesses": "When discussing weaknesses, choose something genuine but not critical to the job. Explain how you've recognized this weakness and the steps you're taking to improve. Demonstrate self-awareness and a commitment to professional growth.",
            "why should we hire you": "Focus on the unique combination of skills and experiences you bring. Connect your qualifications directly to the job requirements and company needs. Provide concrete examples of past achievements that demonstrate your value. Keep it confident but not arrogant.",
            "why do you want to work here": "Research the company thoroughly before answering. Highlight specific aspects of the company's mission, values, culture, or products that resonate with you. Explain how your career goals align with what the company offers. Be genuine in your interest.",
            "where do you see yourself in 5 years": "Show ambition while remaining realistic. Demonstrate a desire to grow within the company rather than using it as a stepping stone. Focus on developing skills and taking on increasing responsibility. Align your goals with the potential career path at the company.",
            "behavioral questions": "Use the STAR method (Situation, Task, Action, Result) to structure your answers to behavioral questions. Prepare specific examples from your past experiences that showcase relevant skills and qualities. Be concise but thorough in your responses.",
            "salary expectations": "Research industry standards for the position and your experience level. Provide a range rather than a specific number. Emphasize that you're flexible and more interested in the right opportunity than a specific salary. Consider the total compensation package, not just base salary.",
            "questions for the interviewer": "Prepare thoughtful questions that demonstrate your research and interest. Ask about the team, company culture, expectations for the role, or strategic direction. Avoid questions about salary, benefits, or time off at this stage."
        }
        
        # Add some additional common interview-related questions and answers
        self.additional_responses = {
            "job gap": "To explain employment gaps, be honest but concise. Focus on what you learned or did during the gap (such as freelance work, courses, or volunteering). Emphasize your enthusiasm to return to work and redirect the conversation to your qualifications. Remember that career gaps are common and nothing to apologize for.",
            
            "salary negotiation": "For successful salary negotiations: 1) Research industry standards, 2) Emphasize your value before discussing numbers, 3) Let the employer make the first offer when possible, 4) Consider the entire compensation package, and 5) Practice your negotiation conversation beforehand. Always maintain a professional, collaborative tone.",
            
            "remote work": "When discussing remote work preferences, emphasize your productivity, communication skills, and self-discipline. Mention specific tools you're comfortable with (Slack, Zoom, etc.) and how you maintain work-life boundaries. If the role requires office presence, express flexibility while clarifying your needs.",
            
            "teamwork": "When discussing teamwork, provide specific examples of successful collaboration. Emphasize your communication skills, ability to compromise, and how you handle disagreements constructively. Mention both how you contribute ideas and how you support others' contributions.",
            
            "leadership": "To demonstrate leadership, describe situations where you took initiative, motivated others, or resolved conflicts. Focus on results achieved and lessons learned. Even if you haven't had formal management roles, highlight project leadership, mentoring, or team coordination experience.",
            
            "stress": "To address handling stress, describe specific strategies you use like prioritization, time management, or breaking large tasks into smaller steps. Provide an example of a stressful work situation you navigated successfully, focusing on both your process and the positive outcome.",
            
            "conflict": "When discussing conflict resolution, use the STAR method to describe a specific situation. Emphasize your communication skills, empathy, and focus on finding mutually beneficial solutions. Highlight your ability to remain professional and separate personal feelings from work issues.",
            
            "failure": "When discussing failure, choose an example that's meaningful but not catastrophic. Explain what happened, take responsibility without making excuses, and most importantly, detail what you learned and how you've applied that lesson since. Show growth and resilience.",
            
            "strengths and weaknesses": "For the strengths and weaknesses question, choose strengths relevant to the job and provide specific examples. For weaknesses, select something non-critical that you're actively improving, and explain your improvement strategy. Demonstrate self-awareness and a commitment to growth.",
            
            "career change": "When explaining a career change, focus on the transferable skills from your previous experience. Explain your motivation positively (moving toward something, not just away from something). Show enthusiasm for the new direction and how your unique background adds value.",
            
            "company culture": "To answer questions about preferred company culture, research the company beforehand and align your response accordingly. Emphasize values like collaboration, innovation, or work-life balance that match their culture. Provide examples of environments where you've thrived previously.",
            
            "technical skills": "When discussing technical skills, be honest about your proficiency levels. Highlight your strongest skills relevant to the position, provide examples of how you've used them, and mention any recent learning or certifications. Express enthusiasm for continuing to develop your technical abilities.",
            
            "difficult boss": "When asked about dealing with a difficult boss, focus on a professional approach. Describe how you adapted your communication style, sought to understand their priorities, and maintained quality work. Avoid criticizing former supervisors and emphasize what you learned from the experience.",
            
            "overqualified": "If concerned about being overqualified, emphasize your interest in the specific role and company, not just any job. Explain how the position fits your career goals and how your advanced skills would benefit the team. Address concerns about retention by expressing your commitment to growth within the organization."
        }
    
    def generate_session_id(self):
        """Generate a unique session ID for a conversation"""
        return str(uuid.uuid4())
    
    def get_predefined_answer(self, query):
        """Check if the query matches a predefined FAQ or additional response"""
        query_lower = query.lower()
        
        # First check the predefined FAQs
        for key, answer in self.predefined_faqs.items():
            if key in query_lower:
                return answer
        
        # Then check additional responses
        for key, answer in self.additional_responses.items():
            if key in query_lower:
                return answer
        
        return None
    
    def get_smart_default_response(self, query):
        """Generate a smart default response for queries without predefined answers"""
        # Create some intelligent rules to generate responses for common types of questions
        query_lower = query.lower()
        
        if "how" in query_lower and "prepare" in query_lower:
            return f"To prepare for questions about {query_lower.replace('how do i prepare for', '').replace('how should i prepare for', '').strip()}, research common questions in this area, prepare specific examples from your experience, and practice your delivery. Focus on being concise, authentic, and relevant to the job you're applying for."
        
        if "tips" in query_lower or "advice" in query_lower:
            topic = query_lower.replace("tips", "").replace("advice", "").replace("for", "").replace("on", "").strip()
            return f"For {topic}, focus on preparation, authenticity, and relevance to the specific job. Research the company beforehand, prepare concrete examples from your experience, and practice your delivery. Remember to listen carefully to questions and be concise in your responses."
        
        # General career advice response
        return "For successful interviews, thoroughly research the company and position, prepare specific examples that demonstrate your skills, practice common questions, dress professionally, arrive early, and follow up with a thank-you note. Show enthusiasm for the role and come prepared with thoughtful questions about the position and company."
    
    # How many prior messages of a session to include as context. Keeps
    # "longer multi-turn memory" bounded so a very long-running session can't
    # blow past the model's context window — 40 messages is ~20 exchanges,
    # generous for interview prep without risking a truncated/failed call.
    MAX_HISTORY_MESSAGES = 40

    def _build_system_prompt(self, mode='advice', job_posting=None):
        if mode == 'reverse':
            base = (
                "You are conducting a mock interview AS THE INTERVIEWER. Ask the candidate one "
                "interview question at a time. After they answer, give brief (2-3 sentence) "
                "constructive feedback on their answer, then ask the next question. Vary "
                "question types (behavioral, situational, role-specific). Keep your turns concise."
            )
        else:
            base = (
                "You are an interview preparation assistant that helps job seekers prepare for "
                "interviews. Provide concise, practical advice tailored to common interview "
                "questions and scenarios. Be supportive, direct, and focus on actionable tips "
                "that will help the user succeed in their interviews. If you don't know "
                "something, be honest and suggest alternative resources. Keep responses brief "
                "and focused on professional interview preparation."
            )
        if job_posting:
            base += (
                "\n\nThe user is preparing for this specific job posting — tailor every answer "
                "to its role, requirements, and terminology wherever relevant:\n" + job_posting[:3000]
            )
        return base

    def get_response(self, user_message, session_messages=None, mode='advice', job_posting=None):
        """Get a response from the Groq chatbot using Llama 3"""
        # Try Groq/Llama3 first as our primary method
        try:
            print(f"Attempting to call Groq API with message: {user_message}")
            # Prepare conversation history
            messages = [
                {"role": "system", "content": self._build_system_prompt(mode, job_posting)}
            ]

            # Add conversation history if provided, capped to the most recent
            # MAX_HISTORY_MESSAGES so long-running sessions stay within the
            # model's context window instead of failing outright.
            if session_messages:
                recent_messages = list(session_messages)[-self.MAX_HISTORY_MESSAGES:]
                for msg in recent_messages:
                    role = "user" if msg.is_user else "assistant"
                    messages.append({"role": role, "content": msg.message})

            # Add the current user message
            messages.append({"role": "user", "content": user_message})

            # Call Groq API using Llama 3
            response = get_groq_client().chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.7,
                max_tokens=500
            )

            # Extract and return the response text
            result = response.choices[0].message.content.strip()
            print(f"Groq API response successful. First 50 chars: {result[:50]}...")
            return result

        except Exception as e:
            error_details = traceback.format_exc()
            print(f"Error calling Groq API: {str(e)}")
            print(f"Error details: {error_details}")

            # If Groq fails, try predefined answers
            predefined = self.get_predefined_answer(user_message)
            if predefined:
                print(f"Falling back to predefined answer due to API error")
                return predefined

            # If no predefined answer, use the smart default response
            smart_default = self.get_smart_default_response(user_message)
            print("Falling back to smart default response due to API error")
            return smart_default

    def get_adaptive_follow_up(self, question, transcript):
        """
        Generate one adaptive follow-up interview question that probes deeper
        into the candidate's just-given answer — e.g. asking for more detail
        on a claim, a metric, or a tradeoff they mentioned. Falls back to a
        generic clarifying prompt if Groq is unavailable.
        """
        try:
            response = get_groq_client().chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are an interviewer. Given the question that was asked and the "
                            "candidate's spoken answer, ask exactly ONE natural follow-up question "
                            "that digs deeper into something specific they said (a claim, a metric, "
                            "a decision, a tradeoff). Return ONLY the follow-up question, no preamble."
                        ),
                    },
                    {"role": "user", "content": f"Original question: {question}\n\nCandidate's answer: {transcript}"},
                ],
                temperature=0.7,
                max_tokens=80,
            )
            return response.choices[0].message.content.strip().strip('"')
        except Exception as e:
            print(f"Error generating adaptive follow-up: {str(e)}")
            return "Can you elaborate on that with a specific example?"

    def get_follow_up_questions(self, user_message, bot_response):
        """
        Suggest 3 short follow-up questions the user might want to ask next,
        based on the exchange that just happened. Best-effort: returns an
        empty list rather than raising if Groq is unavailable, since this is
        a secondary UI affordance, not the primary chat response.
        """
        try:
            response = get_groq_client().chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "Given the user's interview-prep question and the assistant's answer, "
                            "suggest exactly 3 short, natural follow-up questions the user might ask "
                            "next. Return ONLY the 3 questions, one per line, no numbering."
                        ),
                    },
                    {"role": "user", "content": f"Question: {user_message}\n\nAnswer: {bot_response}"},
                ],
                temperature=0.7,
                max_tokens=150,
            )
            lines = response.choices[0].message.content.strip().split("\n")
            return [line.strip("-•* ").strip() for line in lines if line.strip()][:3]
        except Exception as e:
            print(f"Error generating follow-up questions: {str(e)}")
            return []