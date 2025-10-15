from jose import JWTError, jwt
import smtplib
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from email.mime.text import MIMEText
from fastapi import HTTPException

SECRET_KEY = "SHIGY_ENJOYER"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60*24

oauth2_scheme = OAuth2PasswordBearer("/token")

def create_verification_token(email: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"sub": email, "exp": expire}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str) -> str:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=400, detail="Invalid token")
        return email
    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid or expired token")


def send_verification_email(email: str, login: str, token = None):
    msg = MIMEText(f"Подтвердите email, перейдя по ссылке: http://192.168.1.23:8000/verify-email?login={login}")
    msg["Subject"] = "Подтверждение email"
    msg["From"] = "shsshsovich@gmail.com"
    msg["To"] = email
    with smtplib.SMTP("smtp.gmail.com", 587) as server:
        server.starttls()
        server.login("shsshsovich@gmail.com", "ehgs trdl gahm ylfu")
        server.send_message(msg)
    return token