from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime


class DrugBase(BaseModel):
    drug_id: str
    name: str
    usage: Optional[str] = None
    warnings: Optional[str] = None
    side_effects: Optional[str] = None
    drug_class: Optional[str] = None
    generic_name: Optional[str] = None
    popularity: Optional[int] = None


class DrugCreate(DrugBase):
    pass


class Drug(DrugBase):
    id: int

    class Config:
        from_attributes = True


class UserBase(BaseModel):
    username: str


class UserCreate(UserBase):
    password: str


class User(UserBase):
    id: int
    drugs: List[Drug] = Field(default_factory=list)

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenPair(Token):
    refresh_token: str


class TokenData(BaseModel):
    username: Optional[str] = None


class UserDrugCreate(BaseModel):
    drug_id: int
    usage: Optional[str] = None


class ChatMessageBase(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str


class ChatMessageCreate(ChatMessageBase):
    pass


class ChatMessage(ChatMessageBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class ChatSessionBase(BaseModel):
    title: Optional[str] = None


class ChatSessionCreate(ChatSessionBase):
    title: str = "New chat"


class ChatSession(ChatSessionBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    messages: List[ChatMessage] = Field(default_factory=list)

    class Config:
        from_attributes = True
