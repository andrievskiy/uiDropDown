from flask import Flask
from flask.json import JSONEncoder
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite://'
db = SQLAlchemy(app)


class SqlAlchemyJSONEncoder(JSONEncoder):
    def default(self, obj):
        return obj.dict

app.json_encoder = SqlAlchemyJSONEncoder

import api