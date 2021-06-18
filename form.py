import re
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, BooleanField
from wtforms.validators import InputRequired, Email, Length, ValidationError


def check_password(form, field):
    password = field.data
    min_length = 8
    alphabet = re.compile(
      '[a-zA-Z0-9]+'
      )
    special = re.compile('\W+')
    is_alphabet = alphabet.search(password)
    is_special = special.search(password)
    if len(password) < min_length or not is_alphabet or not is_special:
        raise ValidationError(
            '비밀번호는 8자 이상의 알파벳, 숫자 중 한 가지와 특수문자의 조합이어야 합니다.'
        )
    else:
        pass



class LoginForm(FlaskForm):
    username = StringField(
        'username', 
        validators=[InputRequired(), Length(min=4, max=15, message="유저네임은 4자 이상 15자 이하입니다.")]
    )
    password = PasswordField(
        'password', 
        validators=[InputRequired(), Length(min=8, max=80, message="비밀번호는 8자 이상입니다.")]
    )

class SignupForm(FlaskForm):
    username = StringField(
        'username', 
        validators=[InputRequired(), Length(min=4, max=15, message="유저네임은 4자 이상 15자 이하입니다.")]
    )
    email = StringField(
        'email', 
        validators=[
            InputRequired(), 
            Email(message='이메일 형식이 유효하지 않습니다.'), 
            Length(max=50, message="이메일은 50자 이하입니다.")
        ]
    )
    password = PasswordField(
        'password', 
        validators=[
            InputRequired(),
            check_password
        ]
    )