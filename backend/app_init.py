# app_init.py

import os
from flask import Flask
from flask_cors import CORS
from db import db
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Secret key for session management
app.secret_key = os.getenv('SECRET_KEY', 'your_default_secret_key')

# Determine if the app is running in development or production mode
ENV = os.getenv('FLASK_ENV', 'development')

# Configure PostgreSQL database URI using environment variables
DB_HOST = os.getenv('DB_HOST', 'localhost' if ENV == 'development' else 'db')
DB_NAME = os.getenv('DB_NAME', 'quizdb')
DB_USER = os.getenv('DB_USER', 'my_user')
DB_PASS = os.getenv('DB_PASS', 'password')

app.config['SQLALCHEMY_DATABASE_URI'] = f'postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:5432/{DB_NAME}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize the database
db.init_app(app)

# Enable CORS for cross-origin requests
CORS(app)

# Import routes (ensure you have a 'routes.py' file in your backend directory)
import routes

# Database initialization
with app.app_context():
    db.create_all()
