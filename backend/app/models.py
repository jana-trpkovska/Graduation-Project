from sqlalchemy import Column, Integer, String, Text, Table, ForeignKey, DateTime, Enum, func, Index, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.orm import declarative_base

Base = declarative_base()

user_drugs = Table(
    "user_drugs",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("drug_id", Integer, ForeignKey("drugs.id"), primary_key=True)
)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)

    drugs = relationship("Drug", secondary=user_drugs, back_populates="users")


class Drug(Base):
    __tablename__ = "drugs"

    id = Column(Integer, primary_key=True, index=True)
    drug_id = Column(String, unique=True, index=True, nullable=False)

    name = Column(String, nullable=False)
    usage = Column(Text)
    warnings = Column(Text)
    side_effects = Column(Text)
    drug_class = Column(String)
    generic_name = Column(String)
    popularity = Column(Integer, default=0)

    users = relationship("User", secondary=user_drugs, back_populates="drugs")


class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False, default="New chat")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    user = relationship("User", back_populates="chat_sessions")
    messages = relationship("ChatMessage", back_populates="chat", cascade="all, delete-orphan",
                            order_by="ChatMessage.created_at")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    chat_id = Column(Integer, ForeignKey("chat_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(Enum("user", "assistant", "system", name="chat_role"), nullable=False)
    content = Column(Text, nullable=False)
    tokens = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    chat = relationship("ChatSession", back_populates="messages")


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    token_jti = Column(String(200), unique=True, nullable=False, index=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    revoked = Column(Boolean, default=False, nullable=False)
    replaced_by = Column(Integer, ForeignKey("refresh_tokens.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("User", back_populates="refresh_tokens")


Index("ix_chat_messages_chat_created", ChatMessage.chat_id, ChatMessage.created_at)

User.chat_sessions = relationship("ChatSession", back_populates="user", cascade="all, delete-orphan")

User.refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")
