import json
from db import TodoList, db
from db import Category, db
from flask import Flask, json, request, jsonify, app
from flask_mysqldb import MySQL,MySQLdb #pip install flask-mysqldb https://github.com/alexferl/flask-mysqldb
from flask import current_app
from flask import Blueprint
from flask import render_template, redirect, url_for, current_app
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from form import LoginForm, SignupForm
from datetime import timedelta
bp = Blueprint("calendar", __name__, url_prefix="/calendar")

@bp.route('/')
@login_required
def calendar():
    return render_template("calendar.html")

@bp.route('/datacal')
def get_todo_cal():
    todoListCal =  TodoList.query.filter_by(user_id=current_user.id).all()
    data = []
    for todoList in todoListCal:
        if todoList.end_date!=None:
            end_date = todoList.end_date + timedelta(days=1)
        if todoList.status==0:
            col = {
                "title":todoList.content,
                "start": todoList.start_date.strftime("%Y-%m-%d"),
                "end":  end_date.strftime("%Y-%m-%d") if todoList.end_date!=None else None,
                "important": todoList.important,
                "color" : todoList.category.color
            }
            print(col)
            data.append(col)
    return json.dumps(data)