from flask import Blueprint, render_template, request, flash, redirect, url_for
from flask_login import login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import select

from . import db
from .models import User

auth = Blueprint('auth', __name__)

@auth.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")

        user = db.session.scalar(select(User).where(User.name==username))

        if user:
            if check_password_hash(user.password, password):
                flash("Logged in successfully", category='success')
                login_user(user, remember=True)
                return redirect(url_for('views.home'))
            else:
                flash("Incorrect password", category='error')
        else:
            flash("Username does not exist", category='error') 

    return render_template("login.html", user=current_user)

@auth.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('auth.login'))

# TODO: Do checks using JS / AJAX before submission
# TODO: Suggest random username from dictionary?
@auth.route('/sign-up', methods=['GET', 'POST'])
def sign_up():
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")
        password_confirmed = request.form.get("passwordConfirm")

        user = User.query.filter_by(name=username).first()

        if user:
            flash("Username already exists", category='error')
        elif len(username) < 2:
            flash("Name must be greater than 1 characters", category='error')
        elif len(password) == 0:
            flash("Please enter a password", category='error')
        elif password != password_confirmed:
            flash("Passwords don't match", category="error")
        else:   
            new_user = User(name=username, password=generate_password_hash(password, method='pbkdf2:sha256'))
            db.session.add(new_user)
            db.session.commit()
            login_user(new_user, remember=True)
            flash("Account created", category="success")
            return redirect(url_for('views.home'))

    return render_template("sign_up.html", user=current_user)