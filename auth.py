from flask import Blueprint, render_template, redirect, url_for, current_app, request, flash
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import LoginManager, login_user, logout_user, login_required
from authlib.integrations.flask_client import OAuth
from form import LoginForm, SignupForm
from db import User, db, Category, createTutorial
from config import OAUTH_CONFIG

oauth = OAuth(current_app)
bp = Blueprint("auth", __name__, url_prefix="/auth")

login_manager = LoginManager()
login_manager.init_app(current_app)
login_manager.login_view = 'auth.login'

error_msgs = {
    "duplicate_user":"이미 존재하는 이름입니다. 다른 이름을 사용하세요.",
    "duplicate_email":"이미 존재하는 이메일입니다. 다른 이메일을 사용하세요.",
    "user_not_exist":"존재하지 않는 이름입니다. 회원가입을 먼저 해주세요.",
    "wrong_password":"비밀번호가 틀렸습니다."
  }

google = oauth.register(
    name='google',
    client_id=OAUTH_CONFIG['client_id'],
    client_secret=OAUTH_CONFIG['client_secret'],
    access_token_url='https://accounts.google.com/o/oauth2/token',
    access_token_params=None,
    authorize_url='https://accounts.google.com/o/oauth2/auth',
    authorize_params=None,
    api_base_url='https://www.googleapis.com/oauth2/v1/',
    client_kwargs={'scope': 'openid email profile'},
)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(user_id)

@bp.route('/signup', methods=['GET', 'POST'])
def signup():
    form = SignupForm()
    if form.validate_on_submit():
        exist_username = User.query.filter(User.username == form.username.data).first()
        exist_email = User.query.filter(User.email == form.email.data).first()
        if exist_username:
            flash(error_msgs['duplicate_user'], 'auth_error')
        elif exist_email:
            flash(error_msgs['duplicate_email'], 'auth_error')
        else:
            hashed_pw = generate_password_hash(form.password.data, method='sha256')
            new_user = User(username = form.username.data, email = form.email.data, password = hashed_pw)
            db.session.add(new_user)
            db.session.commit()
            createTutorial(new_user.id)
            return redirect(url_for('auth.login'))
    return render_template('signup.html', form=form)

@bp.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if request.method == 'POST':
        logout_user()
        if form.validate_on_submit():
            user = User.query.filter(User.username == form.username.data).first()
            if user is None:
                flash(error_msgs['user_not_exist'], 'auth_error')
            elif not check_password_hash(user.password, form.password.data):
                flash(error_msgs['wrong_password'], 'auth_error')
            else:
                login_user(user)
                return redirect(url_for('dashboard'))
    return render_template('login.html', form=form)

@bp.route('/login/google')
def google_login():
    google = oauth.create_client('google')  # create the google oauth client
    redirect_uri = url_for('auth.authorize', _external=True)
    return google.authorize_redirect(redirect_uri)


@bp.route('/authorize')
def authorize():
    google = oauth.create_client('google')  # create the google oauth client
    token = google.authorize_access_token()  # Access token from google (needed to get user info)
    resp = google.get('userinfo')  # userinfo contains stuff u specificed in the scrope
    user_info = resp.json()
    exist_user = User.query.filter_by(email = user_info['email']).first()
    if not exist_user:
        new_user = User()
        new_user.email = user_info['email']
        new_user.username = user_info['name']
        db.session.add(new_user)
        db.session.commit()
        login_user(new_user)
    else:
        login_user(exist_user)
    return redirect(url_for('tasks'))

@bp.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('tasks'))