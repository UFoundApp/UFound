import smtplib
import os
import random
import string
from email.mime.text import MIMEText
from dotenv import load_dotenv
from passlib.context import CryptContext

load_dotenv()

EMAIL_HOST = os.getenv("EMAIL_HOST")
EMAIL_PORT = int(os.getenv("EMAIL_PORT"))
EMAIL_USERNAME = os.getenv("EMAIL_USERNAME")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
EMAIL_FROM = os.getenv("EMAIL_FROM")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Function to generate a 6-digit verification code
def generate_verification_code():
    return ''.join(random.choices(string.digits, k=6))

# Function to send an email
def send_verification_email(to_email, verification_code):
    subject = "Your UFound Verification Code"
    body = f"Your verification code is: {verification_code}. It expires in 5 minutes."
    
    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = EMAIL_FROM
    msg["To"] = to_email

    try:
        server = smtplib.SMTP(EMAIL_HOST, EMAIL_PORT)
        server.starttls()  # Secure the connection
        server.login(EMAIL_USERNAME, EMAIL_PASSWORD)
        server.sendmail(EMAIL_FROM, to_email, msg.as_string())
        server.quit()
        return True
    except Exception as e:
        print(f"Email sending failed: {e}")
        return False

def hash_password(password: str) -> str:
    return pwd_context.hash(password)
