import os
from flask import Flask
from flask_cors import CORS
from db import db

app = Flask(__name__)

# Secret key for session management
app.secret_key = '3c6e0b8a9c15224a8228b9a98ca1531d'

# Configure PostgreSQL database URI using environment variables
DB_HOST = os.getenv('DB_HOST', 'postgres')
DB_NAME = os.getenv('DB_NAME', 'quizdb')
DB_USER = os.getenv('DB_USER', 'my_user')
DB_PASS = os.getenv('DB_PASS', 'password')
app.config['SQLALCHEMY_DATABASE_URI'] = f'postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:5432/{DB_NAME}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize the database
db.init_app(app)

# Enable CORS for cross-origin requests
CORS(app)

# Import routes
import routes

# Database initialization
with app.app_context():
    db.create_all()