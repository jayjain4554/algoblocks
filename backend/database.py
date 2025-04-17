from flask_sqlalchemy import SQLAlchemy
import json

db = SQLAlchemy()

class Strategy(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)
    config = db.Column(db.Text, nullable=False)

    def __init__(self, name, config):
        self.name = name
        self.config = json.dumps(config)