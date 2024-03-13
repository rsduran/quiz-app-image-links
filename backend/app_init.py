# app_init.py

from flask import Flask
from flask_cors import CORS
from .db import db
import os
import stat 

app = Flask(__name__)

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

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + DB_PATH
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
CORS(app)

# Importing routes at the end to avoid circular dependency
from . import routes

# Database initialization
with app.app_context():
    db.create_all()