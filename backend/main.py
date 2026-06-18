import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.sql import func

from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.messages import HumanMessage, AIMessage

load_dotenv()

app = FastAPI(title="AI Chatbot Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, set to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# TiDB / MySQL Database Configuration
# Expecting TIDB_DATABASE_URL like mysql+pymysql://user:password@host:port/dbname
DATABASE_URL = os.getenv("TIDB_DATABASE_URL")

engine = None
SessionLocal = None
Base = declarative_base()

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(255), index=True)
    role = Column(String(50)) # 'human' or 'ai'
    content = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

if DATABASE_URL:
    try:
        engine = create_engine(DATABASE_URL, pool_recycle=3600)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print("Could not connect to TiDB:", e)
        engine = None

class ChatRequest(BaseModel):
    message: str
    session_id: str

# LangChain Setup
llm = ChatGroq(model='qwen/qwen3-32b', reasoning_format="parsed")

prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistant, always answer in 1 line"),
    ("placeholder", "{history}"),
    ("human", "{input}")
])

chain = prompt | llm

def get_session_history(session_id: str):
    history = ChatMessageHistory()
    if engine and SessionLocal:
        # Load from TiDB
        db = SessionLocal()
        try:
            messages = db.query(ChatMessage).filter(ChatMessage.session_id == session_id).order_by(ChatMessage.created_at.asc()).all()
            for msg in messages:
                if msg.role == 'human':
                    history.add_user_message(msg.content)
                elif msg.role == 'ai':
                    history.add_ai_message(msg.content)
        finally:
            db.close()
    return history

chain_with_memory = RunnableWithMessageHistory(
    chain,
    get_session_history,
    input_messages_key="input",
    history_messages_key="history"
)

@app.get("/")
def read_root():
    return {"message": "Chatbot Backend is Running"}

@app.post("/chat")
def chat_endpoint(request: ChatRequest):
    if not request.message:
        raise HTTPException(status_code=400, detail="No message provided")
        
    try:
        # Get response from LangChain
        response = chain_with_memory.invoke(
            {"input": request.message},
            config={"configurable": {"session_id": request.session_id}}
        )
        ai_response = response.content
        
        # Save to DB if configured
        if engine and SessionLocal:
            db = SessionLocal()
            try:
                user_msg = ChatMessage(session_id=request.session_id, role='human', content=request.message)
                ai_msg = ChatMessage(session_id=request.session_id, role='ai', content=ai_response)
                db.add(user_msg)
                db.add(ai_msg)
                db.commit()
            except Exception as e:
                db.rollback()
                print("Error saving to DB:", e)
            finally:
                db.close()
                
        return {"response": ai_response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
