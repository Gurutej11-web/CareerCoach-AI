# CareerCoach AI

An AI-powered job application assistant that helps you tailor your resume, practice mock interviews, and prep with an AI interview chatbot.

## Introduction

CareerCoach AI is a comprehensive solution designed to address the challenges faced by job seekers in today's competitive job market. With the increasing complexity of application processes and the growing use of applicant tracking systems (ATS), candidates need intelligent tools to stand out from the crowd.

This application harnesses the power of modern AI technologies — including natural language processing, machine learning, and cognitive services — to provide personalized assistance throughout the entire job application journey. From optimizing resumes to match specific job descriptions to preparing for interviews through AI-driven simulations, this platform offers end-to-end support to maximize your chances of landing your dream job.

## Features

### Resume Analysis and Tailoring
- AI-powered resume analysis that identifies strengths and weaknesses
- Keyword extraction to match your resume with job descriptions
- Automated suggestions for resume improvements
- Content suggestions based on your resume and the job requirements
- PDF and DOCX resume parsing

### Mock Interview Preparation
- Virtual interview simulation with AI-generated questions
- Real-time feedback on your responses
- BERT analysis for sentiment and content evaluation
- Speech-to-text capabilities for verbal practice
- Industry-specific interview question banks

### Interview Chatbot
- AI chatbot to answer common interview questions using LLaMA 3 (via Groq)

### User Profile Management
- Secure JWT-based authentication
- Profile customization

## Technologies Used

### Frontend
- React 19 + TypeScript
- Material-UI
- React Router
- Axios for API requests
- Context API for state management

### Backend
- Django + Django REST Framework
- Simple JWT for authentication
- SQLite database

### AI Services
- Azure Cognitive Services (Language, Computer Vision, Speech)
- BERT / Hugging Face Transformers for text analysis
- Groq API (LLaMA 3) for the interview chatbot
- PyTorch for the machine learning components

## Running without any API keys (demo mode)

The app is designed to **boot and run without any Azure or Groq keys configured**. Every AI integration has a fallback:
- The interview chatbot falls back to a library of predefined interview-prep answers if Groq is unreachable or unconfigured.
- Resume/text analysis falls back to simple keyword/embedding logic if Azure Language isn't configured, or to a lightweight BERT model.
- Speech/vision features return a clear error in the response if Azure Speech/Vision aren't configured, rather than crashing the server.

This means you can clone, install, and click through the whole app immediately. To get **live** AI responses (real Groq/Azure output instead of fallbacks), add your own keys as described below — none of these are required to demo the app end to end.

## Installation

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)
- Python (v3.10–3.12 recommended)
- pip
- Git

### Clone the Repository
```bash
git clone https://github.com/Gurutej11-web/CareerCoach-AI.git
cd CareerCoach-AI
```

### Backend Setup
```bash
# Create and activate a virtual environment (recommended)
python -m venv .venv
# On Windows
.venv\Scripts\activate
# On macOS/Linux
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables (see below) — copy .env.example to backend/.env

# Run migrations
python backend/manage.py migrate

# Start the backend development server
python backend/manage.py runserver
```
Backend runs at `http://127.0.0.1:8000/`.

### Frontend Setup
In a separate terminal, from the repo root:
```bash
npm install
npm start
```
Frontend runs at `http://localhost:3000/`.

Both servers need to be running at the same time for the app to work.

## Environment Variables

Copy `.env.example` to `backend/.env` (backend variables) and to `.env` at the repo root (frontend `REACT_APP_*` variables), then fill in whichever keys you have. All are optional — see "Running without any API keys" above.

| Variable | Used for | Where to get it |
|---|---|---|
| `DJANGO_SECRET_KEY` | Django session/token signing | Generate with `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"` |
| `GROQ_API_KEY` | LLaMA 3 interview chatbot | Free tier at [console.groq.com](https://console.groq.com) |
| `AZURE_LANGUAGE_KEY` / `AZURE_LANGUAGE_ENDPOINT` | Resume sentiment/key-phrase analysis | Azure Portal → Language service resource |
| `AZURE_VISION_KEY` / `AZURE_VISION_ENDPOINT` | OCR text extraction from scanned resumes | Azure Portal → Computer Vision resource |
| `AZURE_SPEECH_KEY` / `AZURE_SPEECH_ENDPOINT` / `AZURE_SPEECH_REGION` | Mock interview speech-to-text | Azure Portal → Speech service resource |
| `REACT_APP_API_BASE_URL` | Frontend → backend URL | Defaults to `http://localhost:8000`, only change for non-local setups |

Azure offers a free trial with credits; Groq's API has a free tier — neither requires a paid plan to try this project.

## Usage

1. Register for an account or log in
2. Navigate to the dashboard to access all features
3. Upload your resume and a job description for analysis and tailoring
4. Practice interviews with the mock interview tool to get immediate feedback and suggestions
5. Use the AI chatbot to ask interview-prep questions

### Admin Access

A Django admin interface is available at `http://127.0.0.1:8000/admin/` once you create your own superuser:
```bash
python backend/manage.py createsuperuser
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Azure Cognitive Services for AI capabilities
- Groq API for natural language processing
- The open-source community for the various libraries and tools used
