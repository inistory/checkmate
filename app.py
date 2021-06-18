import json
import sys
from flask import Flask, render_template, redirect, url_for, jsonify, request, flash
from flask_bootstrap import Bootstrap
from flask_login import login_required, current_user
from config import SECRET_KEY

app = Flask(__name__)

bootstrap = Bootstrap(app)
app.config['SECRET_KEY'] = SECRET_KEY

@app.route('/') 
@login_required
def dashboard():
  return dash.print_dashboard()

@app.route('/tasks') 
@login_required
def tasks():
  return render_template('tasks.html')

@app.route('/calendar/data')
@login_required
def return_data():
    return cal.get_todo_cal()

@app.route('/myprofile') 
@login_required
def myprofile():
  return render_template('profile.html')

@app.route('/feedback') 
@login_required
def feedback():
  return render_template('feedback.html')

with app.app_context():
  import db
  db.init_db()

  import auth
  app.register_blueprint(auth.bp)

  import todo
  app.register_blueprint(todo.bp)

  import cal
  app.register_blueprint(cal.bp)

  import dash
  app.register_blueprint(dash.bp)

  import profile
  app.register_blueprint(profile.bp) 

