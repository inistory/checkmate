from flask import Blueprint, jsonify
from flask_restful import Api, Resource, reqparse
from db import db, User
from flask_login import current_user
from email_validator import validate_email, EmailNotValidError
from werkzeug.security import check_password_hash, generate_password_hash


bp = Blueprint('profile', __name__, url_prefix='/profile')
api = Api(bp)

parser = reqparse.RequestParser()
parser.add_argument('email')
parser.add_argument('cur_password')
parser.add_argument('new_password')


class Email(Resource):
    def get(self):
        req_user = User.query.filter_by(id = current_user.id).first()
        return jsonify(status = 'success', result = {
            'id':req_user.id, 'username':req_user.username, 'email':req_user.email
        })

    def put(self):
        args = parser.parse_args()
        email = args['email']
        try:
            valid = validate_email(email)
            email = valid.email 
            req_user = User.query.filter_by(id = current_user.id).first()
            req_user.email = email
            db.session.commit()
            return jsonify(status = 'success', result = {'username':req_user.username, 'email':req_user.email})
        except EmailNotValidError as e:
            return jsonify(status = 'failed', result = {'error_msg':str(e)})


class Password(Resource):
    def put(self):
        args = parser.parse_args()
        req_user = User.query.filter_by(id = current_user.id).first()
        if check_password_hash(req_user.password, args['cur_password']):
            req_user.password = generate_password_hash(args['new_password'], method='sha256')
            db.session.commit()
            return jsonify(status = 'success', result = {
                'username':req_user.username, 'success_msg':'비밀번호가 변경되었습니다.'
            })
        else:
            return jsonify(status = 'failed', result = {'error_msg':'비밀번호가 틀렸습니다.'})


class Withdrawal(Resource):
    def delete(self):
        db.session.delete(current_user)
        db.session.commit()
        return jsonify(status = 'success')


api.add_resource(Email, '/email')
api.add_resource(Password, '/password')
api.add_resource(Withdrawal, '/withdrawal')
