from pydantic import BaseModel
from typing import List

class LoginRequest(BaseModel):
    login: str
    password: str

class RegisterRequest(BaseModel):
    login: str
    password: str
    email: str

class UserResponse(BaseModel):
    id: int
    login: str
    email: str

    class Config:
        orm_mode = True

class UsersList(BaseModel):
    users: List[UserResponse]