import os
import sys

from ui_api.models.user import User

reload(sys)
sys.setdefaultencoding("utf-8")
os.chdir(os.path.dirname(os.path.abspath(__file__)))
WORK_DIR = os.path.dirname(os.path.abspath(__file__))

WORK_DIR = '/'.join(WORK_DIR.split('/')[0:-1])
sys.path.append(WORK_DIR)
from ui_api import app as application
from ui_api import db
db.create_all()

for _ in xrange(100):
    db.session.add(User(name='{0} test'.format(_), domain='/test{0}'.format(_)))
db.session.commit()

if __name__ == '__main__':
    application.run()
