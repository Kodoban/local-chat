from flask import Blueprint, render_template, request, flash, jsonify, redirect, url_for
from flask_login import login_required, current_user
from sqlalchemy import func, select
from .models import User, Chat, Message
from . import db
import json 

views = Blueprint('views', __name__)

# Page after login, shows all available chats (if any), page to add chats, etc
# Should any pages redirect here while logged in?
@views.route('/', methods=['GET', 'POST'])
@login_required
def home():
    if request.method == "POST":
        print("Hello")

    return render_template("home.html", user=current_user)

# Partially implemented
@views.route('/profile', methods=['GET'])
def profile():
    if request.method == "GET":
        user_id = request.args.get('id')

        if user_id:
            other_user = db.session.scalar(select(User).where(User.id==user_id))

            if other_user:
                return render_template("profile.html", user=current_user, other_user=other_user)
            else:
                # Change to 404
                return render_template("profile.html", user=current_user)
        
        return render_template("profile.html", user=current_user)

# Currently implementing
@views.route('/create-chat', methods=['GET','POST'])
@login_required
def create_chat():
    if request.method == 'GET':
        return render_template("search_user.html", user=current_user)
    elif request.method == 'POST':
        other_user_id = request.form.get("user_id")
        other_user_name = request.form.get("user_name")
        first_message = request.form.get("initial_message")

        if len(other_user_id) < 1 or len(first_message) < 1:
            pass

        # TODO: Check if there is a way to add the chat id to the message without committing first?
        new_chat = Chat(name = f"Chat of {current_user.name} and {other_user_name}")
        db.session.add(new_chat)
        db.session.commit()

        new_message = Message(chat_id = new_chat.id, sender_id = current_user.get_id(), content = first_message)
        db.session.add(new_message)
        db.session.commit()

        return redirect(url_for('views.chat', chat_id = new_chat.id))

# Not yet implemented
@views.route('/chats/<int:chat_id>/add-participants', methods=["POST"])
@login_required
def add_participants(chat_id):
    if request_method == 'POST':
        users = request.form.get("participants")

        if len(users) < 1:
            pass
        else:
            # users = Message(data=message)
            db.session.add(users)
            # db.session.commit() # Maybe don't commit until the first message is sent? If user decides to not send a message, do not add to DB


# Currently implementing
@views.route('/chats/<int:chat_id>', methods=['GET'])
@login_required
def chat(chat_id):
    if request.method == 'GET':
        # TODO: Check if there is an easier way to get the chat object (e.g. pass from another view)
        chat = db.session.scalar(select(Chat).where(Chat.id==chat_id))

        return render_template("chat.html", user=current_user, chat=chat)

    return render_template("home.html", user=current_user)

# Not yet implemented
@views.route('/chats/<int:chat_id>/add_message', methods=['POST'])
@login_required
def add_message(chat_id):
    if request.method == 'POST':
        message = request.form.get("message")

        if len(message) < 1:
            pass
        else:
            new_message = Message(data=message)
            db.session.add(new_message)
            db.session.commit()
            # renew page content with new message

    return render_template("home.html", user=current_user)

# Implemented, TODO: optimizations
@views.route('/search-user', methods=['GET','POST'])
@login_required
def search_user():
    if request.method == 'POST':
        username = request.form.get("username")

        if len(username) < 1:
            return []
        else:
            # TODO: Check if there's a way to sort by best matching string
            matching_users = db.session.execute(select(User.id, User.name)
                                                .where(User.name.like(f"%{username}%"))
                                                .order_by(User.id)
                                                ).all()

            # TODO: Add "start chat" button text to JSON response and parse inside JS script                       
            data = [ {'id': user.id, 'name': user.name} if user.id != current_user.id \
                else {'id': user.id, 'name': user.name, 'disable_click': ""} \
                for user in matching_users]

            return jsonify(data)

    return render_template("search_user.html", user=current_user)
    