# app_init.py

import os
import stat
from flask import Flask
from flask_cors import CORS
from db import db  # Relative import

app = Flask(__name__)

# Secret key for session management
app.secret_key = '3c6e0b8a9c15224a8228b9a98ca1531d'

# Define the database path
DB_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'instance')
DB_PATH = os.path.join(DB_DIR, 'quizapp.db')

# Ensure the instance directory exists
if not os.path.exists(DB_DIR):
    os.makedirs(DB_DIR)

# Check and set the database file permissions
if not os.path.exists(DB_PATH):
    open(DB_PATH, 'a').close()
os.chmod(DB_PATH, stat.S_IWUSR | stat.S_IRUSR)

# Configure the database URI
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + DB_PATH
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize the database
db.init_app(app)

# Enable CORS for cross-origin requests
CORS(app)

# Import routes
import routes  # Relative import

# Database initialization
with app.app_context():
    db.create_all()