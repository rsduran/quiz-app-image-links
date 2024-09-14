# app_init.py

import os
from flask import Flask
from flask_cors import CORS
from db import db

app = Flask(__name__)

# Secret key for session management
app.secret_key = '3c6e0b8a9c15224a8228b9a98ca1531d'

# Configure PostgreSQL database URI
# Change 'localhost' to 'db' to point to the Docker service name
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://my_user:password@postgres:5432/quizdb'
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