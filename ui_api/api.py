from flask import jsonify
from ui_api import app

DATASET = [
    {
        'domain': '/mixryta',
        'name': 'MiMI',
        'uid': 998
    },
]


@app.route('/find')
def find():
    # Access-Control-Allow-Origin
    resp = jsonify(result=DATASET)
    resp.headers['Access-Control-Allow-Origin'] = '*'
    return resp
