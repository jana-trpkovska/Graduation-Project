from typing import Optional, List

from fastapi import FastAPI, HTTPException, Depends, Query, Path, status, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import desc

from . import models, schemas, auth
from .database import get_db
from .models import Drug
from .rag_utils import run_rag

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class QueryRequest(BaseModel):
    question: str


class QueryResponse(BaseModel):
    answer: str


@app.get("/")
def root():
    return {"message": "RAG API is running!"}


@app.post("/chats/{chat_id}/ask", response_model=schemas.ChatMessage)
def ask_question(
        chat_id: int,
        request: QueryRequest,
        current_user: schemas.User = Depends(auth.get_current_user),
        db: Session = Depends(get_db)
):
    chat = db.query(models.ChatSession).filter(
        models.ChatSession.id == chat_id,
        models.ChatSession.user_id == current_user.id
    ).first()

    if not chat:
        raise HTTPException(status_code=404, detail="Chat session not found")

    messages_history = [
        {"role": m.role, "content": m.content} for m in chat.messages
    ]
    answer = run_rag(request.question, messages_history)

    user_message = models.ChatMessage(chat_id=chat.id, role="user", content=request.question)
    assistant_message = models.ChatMessage(chat_id=chat.id, role="assistant", content=answer)
    db.add_all([user_message, assistant_message])
    db.commit()
    db.refresh(assistant_message)

    return assistant_message


@app.post("/register", response_model=schemas.User)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.username == user.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")

    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(username=user.username, password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@app.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()

    if not user or not auth.verify_password(form_data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = auth.create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/me", response_model=schemas.User)
def read_users_me(current_user: schemas.User = Depends(auth.get_current_user)):
    return current_user


@app.get("/drugs/popular", response_model=List[schemas.Drug])
def get_popular_drugs(db: Session = Depends(get_db)):
    top_drugs = db.query(Drug).order_by(Drug.popularity.desc()).limit(12).all()
    return top_drugs


@app.get("/drugs", response_model=List[schemas.Drug])
def get_all_drugs(
        db: Session = Depends(get_db),
        query: Optional[str] = Query(None),
        letter: Optional[str] = Query(None),
        drug_class: Optional[str] = Query(None)
):
    drugs_query = db.query(Drug)

    if query:
        query_lower = query.lower()
        drugs_query = drugs_query.filter(
            (Drug.name.ilike(f"%{query_lower}%")) |
            (Drug.generic_name.ilike(f"%{query_lower}%"))
        )

    if letter:
        if letter == "0-9":
            drugs_query = drugs_query.filter(Drug.name.op("~")(r'^[0-9]'))
        else:
            drugs_query = drugs_query.filter(Drug.name.ilike(f"{letter}%"))

    if drug_class:
        drugs_query = drugs_query.filter(Drug.drug_class.ilike(f"%{drug_class}%"))

    return drugs_query.all()


@app.get("/drugs/{drug_id}", response_model=schemas.Drug)
def get_drug_by_id(drug_id: int, db: Session = Depends(get_db)):
    drug = db.query(Drug).filter(Drug.id == drug_id).first()
    if not drug:
        raise HTTPException(status_code=404, detail="Drug not found")

    return drug


@app.post("/drugs/{drug_id}/increment-popularity")
def increment_popularity(drug_id: int = Path(...), db: Session = Depends(get_db)):
    drug = db.query(Drug).filter(Drug.id == drug_id).first()
    if not drug:
        raise HTTPException(status_code=404, detail="Drug not found")

    drug.popularity += 1
    db.commit()
    return {"message": "Popularity incremented", "popularity": drug.popularity}


@app.get("/users/me/drugs", response_model=List[schemas.Drug])
def get_my_drugs(current_user: schemas.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == current_user.id).first()
    return user.drugs


@app.post("/users/me/drugs", response_model=schemas.Drug)
def add_drug_to_user(
        drug_data: schemas.UserDrugCreate,
        current_user: schemas.User = Depends(auth.get_current_user),
        db: Session = Depends(get_db)
):
    drug = db.query(models.Drug).filter(models.Drug.id == drug_data.drug_id).first()
    if not drug:
        raise HTTPException(status_code=404, detail="Drug not found")

    user = db.query(models.User).filter(models.User.id == current_user.id).first()
    if drug in user.drugs:
        raise HTTPException(status_code=400, detail="Drug already added")

    user.drugs.append(drug)
    db.commit()
    db.refresh(drug)
    return drug


@app.delete("/users/me/drugs/{drug_id}", status_code=204)
def remove_drug_from_user(
        drug_id: int,
        current_user: schemas.User = Depends(auth.get_current_user),
        db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.id == current_user.id).first()
    drug = db.query(models.Drug).filter(models.Drug.id == drug_id).first()

    if not drug:
        raise HTTPException(status_code=404, detail="Drug not found")

    if drug not in user.drugs:
        raise HTTPException(status_code=400, detail="Drug not in user's list")

    user.drugs.remove(drug)
    db.commit()


@app.get("/chats/", response_model=List[schemas.ChatSession])
def get_chat_sessions(
        current_user: schemas.User = Depends(auth.get_current_user),
        db: Session = Depends(get_db)
):
    chats = db.query(models.ChatSession).filter(
        models.ChatSession.user_id == current_user.id
    ).order_by(desc(models.ChatSession.updated_at)).all()
    return chats


@app.post("/chats/", response_model=schemas.ChatSession, status_code=status.HTTP_201_CREATED)
def create_chat_session(
        chat_data: schemas.ChatSessionCreate,
        current_user: schemas.User = Depends(auth.get_current_user),
        db: Session = Depends(get_db)
):
    new_chat = models.ChatSession(
        user_id=current_user.id,
        title=chat_data.title or "New chat"
    )
    db.add(new_chat)
    db.commit()
    db.refresh(new_chat)
    return new_chat


@app.get("/chats/{chat_id}/messages", response_model=List[schemas.ChatMessage])
def get_chat_messages(
        chat_id: int,
        current_user: schemas.User = Depends(auth.get_current_user),
        db: Session = Depends(get_db)
):
    chat = db.query(models.ChatSession).filter(
        models.ChatSession.id == chat_id,
        models.ChatSession.user_id == current_user.id
    ).first()

    if not chat:
        raise HTTPException(status_code=404, detail="Chat session not found")

    return chat.messages


@app.post("/chats/{chat_id}/messages", response_model=schemas.ChatMessage, status_code=status.HTTP_201_CREATED)
def add_chat_message(
        chat_id: int,
        message_data: schemas.ChatMessageCreate,
        current_user: schemas.User = Depends(auth.get_current_user),
        db: Session = Depends(get_db)
):
    chat = db.query(models.ChatSession).filter(
        models.ChatSession.id == chat_id,
        models.ChatSession.user_id == current_user.id
    ).first()

    if not chat:
        raise HTTPException(status_code=404, detail="Chat session not found")

    new_message = models.ChatMessage(
        chat_id=chat.id,
        role=message_data.role,
        content=message_data.content
    )
    db.add(new_message)
    db.commit()
    db.refresh(new_message)
    return new_message


@app.put("/chats/{chat_id}", response_model=schemas.ChatSession)
def update_chat_title(
        chat_id: int,
        chat_data: schemas.ChatSessionCreate = Body(...),
        current_user: schemas.User = Depends(auth.get_current_user),
        db: Session = Depends(get_db)
):
    chat = db.query(models.ChatSession).filter(
        models.ChatSession.id == chat_id,
        models.ChatSession.user_id == current_user.id
    ).first()

    if not chat:
        raise HTTPException(status_code=404, detail="Chat session not found")

    chat.title = chat_data.title or chat.title
    db.commit()
    db.refresh(chat)

    return chat


@app.delete("/chats/{chat_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_chat_session(
        chat_id: int,
        current_user: schemas.User = Depends(auth.get_current_user),
        db: Session = Depends(get_db)
):
    chat = db.query(models.ChatSession).filter(
        models.ChatSession.id == chat_id,
        models.ChatSession.user_id == current_user.id
    ).first()

    if not chat:
        raise HTTPException(status_code=404, detail="Chat session not found")

    db.delete(chat)
    db.commit()
    return
