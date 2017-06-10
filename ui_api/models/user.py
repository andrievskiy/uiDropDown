from ui_api import db

AVATAR_URL = 'https://vk.com/images/deactivated_50.png'

class User(db.Model):
    uid = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text)
    domain = db.Column(db.String(500))
    avatar_url = db.Column(db.String(500))

    def __init__(self, name, domain, avatar_url=AVATAR_URL):
        self.name = name
        self.domain = domain
        self.avatar_url = avatar_url

    def __repr__(self):
        return '<User %r>' % self.name

    @property
    def dict(self):
        return {
            'name': self.name,
            'domain': self.domain,
            'uid': self.uid,
            'avatarUrl': self.avatar_url
        }
