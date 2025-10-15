from pydantic import BaseModel, EmailStr
from typing import List

class UserResponse(BaseModel):
    id: int
    login: str
    email: EmailStr
    is_verified: bool

    class Config:
        orm_mode = True

class RegisterRequest(BaseModel):
    login: str
    password: str
    email: EmailStr

class LoginRequest(BaseModel):
    login: str
    password: str

class UsersList(BaseModel):
    users: List[UserResponse]