# AI Chatbot by Amit 🤖

A modern, full-stack AI Chatbot application with a sleek dark-mode UI, built with a Next.js frontend and a high-performance FastAPI Python backend powered by LangChain and Groq.

**🔗 Live Demo:** [https://ai-chat-bot-xi-ten-70.vercel.app/](https://ai-chat-bot-xi-ten-70.vercel.app/)

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **UI/Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Language:** TypeScript / React
- **Deployment:** Vercel

### Backend
- **Framework:** [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **AI / LLM:** [LangChain](https://langchain.com/) + [Groq](https://groq.com/) (using `qwen/qwen3-32b`)
- **Database:** [TiDB](https://en.pingcap.com/tidb-serverless/) (MySQL via SQLAlchemy)
- **Deployment:** Render

---

## ✨ Features
- **Modern UI:** A beautiful, responsive glassmorphic black-and-grey aesthetic.
- **Conversational Memory:** The AI remembers the context of your conversation within a session.
- **Persistent Storage:** Chat histories are saved securely to a TiDB Serverless MySQL database (with an automatic in-memory fallback if the database goes offline).
- **High Speed:** Utilizing Groq's lightning-fast inference engine for instant AI responses.

---

## 📂 Project Structure

This repository is structured as a monorepo containing both the frontend and backend:

```text
📦 memory-chat-bot
 ┣ 📂 backend/        # Python FastAPI application
 ┃ ┣ 📜 main.py       # Core API, DB logic, and LangChain setup
 ┃ ┗ 📜 requirements.txt
 ┣ 📂 frontend/       # Next.js React application
 ┃ ┣ 📂 src/app/      # Main UI pages and Tailwind styles
 ┃ ┗ 📜 package.json
 ┗ 📜 README.md
```

---

## 💻 Local Setup Instructions

To run this project locally, you will need to start both the backend and frontend servers.

### 1. Backend Setup
Navigate into the backend directory and install the requirements:
```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file inside the `backend/` folder:
```env
TIDB_DATABASE_URL=mysql+pymysql://<user>:<password>@<host>:4000/<database>
GROQ_API_KEY=your_groq_api_key
```

Start the FastAPI server:
```bash
uvicorn main:app --reload --port 8000
```

### 2. Frontend Setup
Open a new terminal, navigate to the frontend directory, and install the Node modules:
```bash
cd frontend
npm install
```

Start the Next.js development server:
```bash
npm run dev
```

Visit `http://localhost:3000` in your browser. The frontend will automatically route API requests to your local backend at `http://127.0.0.1:8000`.

---

## 🚀 Deployment Guide

### Deploying the Backend (Render)
1. Go to Render.com and create a new **Web Service** connected to your GitHub repo.
2. Set the **Root Directory** to `backend`.
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add your `TIDB_DATABASE_URL` and `GROQ_API_KEY` to the Environment Variables.

### Deploying the Frontend (Vercel)
1. Go to Vercel.com and import your GitHub repo.
2. Set the **Root Directory** to `frontend`.
3. In Environment Variables, add `NEXT_PUBLIC_API_URL` and set it to your Render backend URL (e.g., `https://your-backend.onrender.com`).
4. Click Deploy!
