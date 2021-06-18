from flask import Blueprint, jsonify
from flask_restful import Api, Resource, reqparse
from db import db, TodoList, Category
from flask_login import current_user

bp = Blueprint('todo', __name__, url_prefix='/todo')
api = Api(bp)

parser = reqparse.RequestParser()
# for todo api
parser.add_argument('todo_id')
parser.add_argument('content')
parser.add_argument('status')
parser.add_argument('start_date')
parser.add_argument('end_date')
parser.add_argument('important')
#for category api
parser.add_argument('category_id')
parser.add_argument('name')
parser.add_argument('color')

class Todo(Resource):
    def get(self, category_id):
        result = []
        query = TodoList.query.filter(
            (TodoList.category_id == category_id) & (TodoList.user_id == current_user.id)
        ).all()
        for todo in query:
            result.append(
                {'id':todo.id, 'content':todo.content, 
                'start_date':todo.start_date, 'end_date':todo.end_date, 
                'status':todo.status, 'important':todo.important}
            )
        return jsonify(status = 'success', result=result)

    def post(self, category_id):
        args = parser.parse_args()
        new_todo = TodoList()
        new_todo.content = args['content']
        new_todo.category_id = category_id
        new_todo.user_id = current_user.id 
        db.session.add(new_todo)
        db.session.commit()
        return jsonify(
            status = 'success', 
            result = {'todo_id': new_todo.id, 'content':new_todo.content, 'start-date':new_todo.start_date}
        )

    def put(self, category_id):
        args = parser.parse_args()
        todo = TodoList.query.filter_by(id = args['todo_id']).first()
        if args['content']:
            todo.content = args['content']
        if args['status']:
            todo.status = int(args['status']) 
        if args['start_date']:
            todo.start_date = args['start_date']
        if args['end_date']:
            todo.end_date = args['end_date']
        if args['important']:
            todo.important = int(args['important']) 
        db.session.commit()
        return jsonify(
            status = 'success', 
            result = {'content':todo.content, 'status':todo.status, 
                    'start_date':todo.start_date, 'end_date':todo.end_date, 'important':todo.important}
        )

    def delete(self, category_id):
        args = parser.parse_args()
        todo = TodoList.query.filter_by(id = args['todo_id']).first()
        db.session.delete(todo)
        db.session.commit()
        return jsonify(
            status = 'success', 
            result = {'id':todo.id, 'content':todo.content}
        )

class Categories(Resource):
    def get(self):
        result = []
        query = Category.query.filter_by(user_id = current_user.id).all()
        for category in query:
            result.append(
                {'id':category.id, 'name':category.name, 'color':category.color}
            )
        return jsonify(status = 'success', result = result)

    def post(self):
        args = parser.parse_args()
        new_category = Category()
        new_category.name = args['name']
        new_category.color = args['color']
        new_category.user_id = current_user.id
        db.session.add(new_category)
        db.session.commit()
        return jsonify(
            status = 'success', 
            result = {'id':new_category.id, 'name':new_category.name, 'color':new_category.color}
        )

    def put(self):
        args = parser.parse_args()
        category = Category.query.filter_by(id = args['category_id']).first()
        if args['name']:
            category.name = args['name']
        if args['color']:
            category.color = args['color']
        db.session.commit()
        return jsonify(
            status = 'success', 
            result = {'id':category.id, 'name':category.name, 'color':category.color}
        )


    def delete(self):
        args = parser.parse_args()
        category = Category.query.filter_by(id = args['category_id']).first()
        db.session.delete(category)
        db.session.commit()
        return jsonify(
            status = 'success', 
            result = {'id':category.id, 'name':category.name}
        )


api.add_resource(Todo, '/<category_id>')
api.add_resource(Categories, '/')

