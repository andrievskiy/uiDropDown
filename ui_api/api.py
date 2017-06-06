from flask import jsonify, request
from sqlalchemy import or_
from ui_api import app
from ui_api.models.user import User
import logging

from ui_api.util.keyboard import KeyBoardUtils


@app.route('/find')
def find():
    try:
        domain_variants = []
        find_prefix = request.args.get('domain', None)
        limit = request.args.get('limit', 10)
        if find_prefix:
            domain_variants = KeyBoardUtils.get_prefixes_variables(find_prefix)
        conditions = []
        for variant in domain_variants:
            conditions.append(
                User.domain.like(variant + u'%')
            )
        users = User.query.filter(or_(
           *conditions
        )).limit(limit).all()

        resp = jsonify(result=users)
        resp.headers['Access-Control-Allow-Origin'] = '*'
        return resp

    except Exception as err:
        logging.exception(err)
        raise err
