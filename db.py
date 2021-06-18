from flask import current_app
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from werkzeug.security import generate_password_hash
from flask_login import UserMixin
from config import DB_URI
from datetime import datetime,timedelta

current_app.config["SQLALCHEMY_DATABASE_URI"] = DB_URI
current_app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(current_app)
migrate = Migrate(current_app, db)


class User(UserMixin, db.Model):
      id = db.Column(db.Integer, primary_key=True)
      username = db.Column(db.String(15), unique=True, nullable=False)
      email = db.Column(db.String(50), unique=True, nullable=False)
      password = db.Column(db.String(80))
      todos = db.relationship("TodoList", backref="user", passive_deletes=True)
      category = db.relationship("Category", backref="user", passive_deletes=True)


class Category(db.Model):
      id = db.Column(db.Integer, primary_key=True)
      name = db.Column(db.String(10), nullable=False)
      color = db.Column(db.String(20))
      user_id = db.Column(db.Integer, db.ForeignKey(User.id, ondelete="CASCADE"), nullable=False)
      todos = db.relationship("TodoList", backref="category", passive_deletes=True)


class TodoList(db.Model):
      id = db.Column(db.Integer, primary_key=True)
      content = db.Column(db.Text, default="To do something")
      start_date = db.Column(db.Date, default=((datetime.utcnow()+timedelta(hours=9))))
      end_date = db.Column(db.Date, nullable=True)
      status = db.Column(db.Boolean, default=False)
      important = db.Column(db.Boolean, default=False)
      user_id = db.Column(db.Integer, db.ForeignKey(User.id, ondelete="CASCADE"), nullable=False)
      category_id = db.Column(db.Integer,db.ForeignKey(Category.id, ondelete="CASCADE"), default=1)
# status -> doing:false(0), done:true(1)


def createTutorial(user_id):
      tutorial = Category(name="Tutorial", color="#82589F", user_id=user_id)
      addTask = TodoList(content="할 일 추가하기➕", user_id=user_id)
      addCalendar = TodoList(content="날짜 지정하기📅", user_id=user_id, end_date=((datetime.utcnow()+timedelta(hours=9))))
      addStar = TodoList(content="중요 표시하기⭐", important=True, user_id=user_id)
      checkTask = TodoList(content="완료 표시하기✔", status=True, user_id=user_id)
      changeColor = TodoList(content="카테고리 테마색 바꾸기🎨", user_id=user_id)
      tutorial.todos.append(addTask)
      tutorial.todos.append(addCalendar)
      tutorial.todos.append(addStar)
      tutorial.todos.append(checkTask)
      tutorial.todos.append(changeColor)
      db.session.add(tutorial)
      db.session.commit()


def init_db():
      db.init_app(current_app)
      db.create_all()
      # sample_user = User(
      #       username="lana", email="lana@lana.com", password=generate_password_hash("lanalana", method="sha256")
      # )
      # db.session.add(sample_user)
      # db.session.commit()
      # sample_category = Category(name="mine", color="#82589F", user_id=1)
      # sample_category2 = Category(name="hola", color="#FFC312", user_id=1)
      # db.session.add(sample_category)
      # db.session.add(sample_category2)
      # db.session.commit()
      # sample_todo = TodoList(content="task1", user_id=1, category_id=1)
      # sample_todo2 = TodoList(content="task2", user_id=1, category_id=2)
      # db.session.add(sample_todo)
      # db.session.add(sample_todo2)
      # db.session.commit()
