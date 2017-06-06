import os
import sys
reload(sys)
sys.setdefaultencoding("utf-8")
os.chdir(os.path.dirname(os.path.abspath(__file__)))
WORK_DIR = os.path.dirname(os.path.abspath(__file__))

WORK_DIR = '/'.join(WORK_DIR.split('/')[0:-1])
sys.path.append(WORK_DIR)

from ui_api import app as application


if __name__ == '__main__':
    application.run(threaded=True, host='0.0.0.0')
