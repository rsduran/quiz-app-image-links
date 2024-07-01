# app_init.py

from flask import Flask
from flask_cors import CORS
from .db import db
import os
import stat

app = Flask(__name__)

app.secret_key = '3c6e0b8a9c15224a8228b9a98ca1531d'

# Use the DATABASE_URL environment variable if available
DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///' + os.path.join(app.instance_path, 'quizapp.db'))

app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
CORS(app)

# Importing routes at the end to avoid circular dependency
from . import routes

# Database initialization
with app.app_context():
    db.create_all()