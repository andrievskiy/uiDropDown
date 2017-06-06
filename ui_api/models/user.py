from ui_api import db


class User(db.Model):
    uid = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text)
    domain = db.Column(db.String(500))

    def __init__(self, name, domain):
        self.name = name
        self.domain = domain

    def __repr__(self):
        return '<User %r>' % self.name

    @property
    def dict(self):
        return {
            'name': self.name,
            'domain': self.domain,
            'uid': self.uid
        }
