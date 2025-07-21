from sqlalchemy import Column, Integer, String, Text, Table, ForeignKey
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

    users = relationship("User", secondary=user_drugs, back_populates="drugs")
