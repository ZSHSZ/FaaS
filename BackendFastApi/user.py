from sqlalchemy import Column, Integer, String
from database import Base
from typing import Optional
from sqlalchemy.orm import Session
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    login = Column(String, unique=True, index=True)
    password = Column(String)
    email = Column(String, index=True)

def get_user_by_login(db: Session, login: str) -> Optional[User]:
    return db.query(User).filter(User.login == login).first()


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()


def check_user_exists(db: Session, login: str, email: str) -> dict:
    errors = {}
    if get_user_by_login(db, login):
        errors["login"] = "User with this login already exists"
    if get_user_by_email(db, email):
        errors["email"] = "User with this email already exists"
    return errors if errors else None

def check_user_for_existing(db: Session, login: str, password: str) -> bool:
    hashed_password = pwd_context.hash(password)
    return db.query(User).filter(User.login == login, User.password == hashed_password).first() is not None