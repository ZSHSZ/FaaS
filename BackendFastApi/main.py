from fastapi import FastAPI, Body, Depends, HTTPException,status
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import user
from user import User, check_user_exists
from database import get_db, engine, Base
from passlib.context import CryptContext
from schemas import LoginRequest, RegisterRequest, UserResponse, UsersList



pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

Base.metadata.create_all(bind=engine)
app = FastAPI()


@app.post("/register", response_model=UserResponse)
def registration(data: RegisterRequest, db: Session = Depends(get_db)):
    login = data.login
    password = data.password
    email = data.email
    print(f"Received password: '{password}', length: {len(password.encode('utf-8'))} bytes")
    existing_errors = check_user_exists(db, login, email)
    if existing_errors:
        raise HTTPException(
            status_code=400,
            detail=existing_errors
        )

    hashed_password = pwd_context.hash(password)
    user = User(login=login, password=hashed_password, email=email)
    db.add(user)
    try:
        db.commit()
        db.refresh(user)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    return user


@app.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    login = data.login
    password = data.password
    if(not check_user_exists(db, login, password)):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid login or password")
    user = db.query(User).filter(User.login == login).first()
    return {
        "id": user.id,
        "login": user.login
    }
@app.get("/users", response_model=UsersList)
def get_all_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return {"users": users}
@app.delete("/clear-db")
def clear_database(confirm: bool = False, db: Session = Depends(get_db)):
    if not confirm:
        raise HTTPException(
            status_code=400,
            detail="To clear the database, set 'confirm' to true"
        )
    db.query(User).delete()
    db.commit()
    Base.metadata.drop_all(bind=engine, tables=[User.__table__])
    Base.metadata.create_all(bind=engine, tables=[User.__table__])
    return {"message": "Database cleared successfully"}

@app.get("/hello/{name}")
async def say_hello(name: str):
    return {"message": f"Hello {name}"}