import json
import sys
from db import TodoList, db
from flask import jsonify,Blueprint, render_template
from flask_mysqldb import MySQL,MySQLdb #pip install flask-mysqldb https://github.com/alexferl/flask-mysqldb
from flask_login import current_user, login_required
from datetime import datetime,timedelta

bp = Blueprint("dashboard", __name__, url_prefix="/dashboard")



def get_today_todo(): 
    todoListCal = TodoList.query.filter_by(user_id=current_user.id).all()
    today_date = (datetime.utcnow()+timedelta(hours=9)).strftime("%Y%m%d")
    data = []
    for todoList in todoListCal:
        start_date = str(todoList.start_date).replace('-','')
        end_date = todoList.end_date
        if todoList.status==0 and start_date <= today_date:
            if end_date == None or today_date <= str(end_date).replace('-',''):
                col = {
                    "title":todoList.content,
                    "start": todoList.start_date,
                    "end":todoList.end_date
                }
                data.append(col)
    return data

def get_progress():
    todoListCal = TodoList.query.filter_by(user_id=current_user.id).all()
    today_date = (datetime.utcnow()+timedelta(hours=9)).strftime("%Y%m%d")
    data = []
    doing = 0
    done = 0
    rate = 0
    for todoList in todoListCal:
        start_date = str(todoList.start_date).replace('-','')
        end_date = todoList.end_date
        if start_date <= today_date:
            if end_date == None or today_date <= str(end_date).replace('-',''):
                doing+=1
                if todoList.status==1: 
                    done += 1
    if doing != 0:
        rate = (done/doing)*100
        
    col = {
            "done": done,
            "doing": doing,
            "progress": round(rate,2)
        }
    data.append(col)
    return data


def get_important_todo():
    todoListCal = TodoList.query.filter_by(user_id=current_user.id).all()
    data = []
    for todoList in todoListCal:
        end_date = todoList.end_date
        if todoList.end_date == None:
            end_date = ""
        if todoList.status==0 and todoList.important == 1:
            col = {
                "title":todoList.content,
                "start": todoList.start_date,
                "end":end_date
            }
            data.append(col)
    return data


def get_upcoming_todo(): 
    todoListCal = TodoList.query.filter_by(user_id=current_user.id).all()
    today_date = (datetime.utcnow()+timedelta(hours=9)).strftime("%Y%m%d")
    day_after = (datetime.utcnow()+timedelta(hours=9)+timedelta(days=1)).strftime("%Y%m%d")
    data = []
    for todoList in todoListCal:   
        end_date = todoList.end_date
        if todoList.status == 0 and end_date != None:
            if str(end_date).replace('-','') == today_date or str(end_date).replace('-','')== day_after:
                col = {
                    "title":todoList.content,
                    "start": todoList.start_date,
                    "end":end_date
                }
                data.append(col)
    return data



@bp.route('/')
@login_required
def print_dashboard():
    important_list = get_important_todo()
    upcoming_list = get_upcoming_todo()
    today_list = get_today_todo()
    progress = get_progress()
    return render_template("dashboard.html",today_list= today_list,important_list = important_list,upcoming_list =upcoming_list,progress=progress)
