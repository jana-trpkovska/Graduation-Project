from pydantic import BaseModel
from typing import List, Optional


class DrugBase(BaseModel):
    drug_id: str
    name: str
    usage: Optional[str] = None
    warnings: Optional[str] = None
    side_effects: Optional[str] = None
    drug_class: Optional[str] = None
    generic_name: Optional[str] = None


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
    drugs: List[Drug] = []

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


