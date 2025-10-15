from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse
import user
from database import get_db, engine, Base
from user import User, check_user_exists, get_email_by_login
from schemas import LoginRequest, RegisterRequest, UserResponse, UsersList
from passlib.context import CryptContext
from email_service import create_verification_token, verify_token
from email_service import send_verification_email
import socket
from datetime import datetime, timedelta
import jwt
from fastapi import HTTPException, status


SECRET_KEY = "SHIGY_ENJOYER"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 24*60
Base.metadata.create_all(bind=engine)

app = FastAPI()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

REACT_DEVELOPER_IP = "192.168.1.16"
MY_IP = "192.168.1.23"
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",        # React по умолчанию
        "http://127.0.0.1:3000",
        f"http://{REACT_DEVELOPER_IP}:3000",  # IP React разработчика
        f"http://{MY_IP}:3000",               # Твой IP (на случай если ты тоже тестируешь фронтенд)
    ],
    allow_credentials=True,
    allow_methods=["*"],  # GET, POST, PUT, DELETE, OPTIONS - ВСЕ методы
    allow_headers=["*"],  # Все заголовки включая Authorization, Content-Type и т.д.
)


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

    token = create_verification_token(email)
    send_verification_email(email, login, token)
    return user


@app.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    login = data.login
    password = data.password
    if not check_user_exists(db, login, password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Invalid login or password")
    user = db.query(User).filter(User.login == login).first()
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.login, "user_id": user.id},
        expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
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


@app.get("/verify-email")
def verify_email(login:str, db: Session = Depends(get_db)):
    email = get_email_by_login(db, login)
    token = create_verification_token(email)
    email = verify_token(token)
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=400, detail="User not found")
    if user.is_verified:
        raise HTTPException(status_code=400, detail="Email already verified")
    user.is_verified = True
    db.commit()
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.login, "user_id": user.id},
        expires_delta=access_token_expires
    )
    return {
        "message": "Email verified successfully",
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "login": user.login,
        "email": user.email,
        "is_verified": True
    }

@app.post("/resend-verification")
def resend_verification_email(email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=400, detail="User not found")
    if user.is_verified:
        raise HTTPException(status_code=400, detail="Email already verified")
    token = create_verification_token(email)
    send_verification_email(email, token)
    return {"message": "Verification email resent"}

@app.post("/")
def send_JSON_with_func():

    return JSONResponse({"message": "Hello"})