from flask import Blueprint, render_template, request, flash, jsonify, redirect, url_for, session
from flask_login import login_required, current_user
from sqlalchemy import select
from flask_socketio import join_room, leave_room, emit
from .models import User, Chat, Message
from . import db, socketio
import json 

views = Blueprint('views', __name__)
chatrooms = {}

# Partially implemented
# Page after login, shows all available chats (if any), page to add chats, etc
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

# Mostly implemented
@views.route('/create-chat', methods=['GET','POST'])
@login_required
def create_chat():
    if request.method == 'GET':
        return render_template("search_user.html", user=current_user)
    elif request.method == 'POST':
        other_user_id = request.form.get("user_id")
        other_user = db.session.scalar(select(User).where(User.id==other_user_id))
        first_message = request.form.get("initial_message")

        if not other_user or len(first_message) < 1:
            pass

        new_chat = Chat(name = f"Chat of {current_user.name} and {other_user.name}")
        db.session.add(new_chat)

        current_user.chats.append(new_chat)
        other_user.chats.append(new_chat)

        new_message = Message(chat_id = new_chat.id, sender_id = current_user.id, content = first_message)
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
            
            # TODO: Emit a message that a user has joined a group chat for the first time (same for leaving a group chat) 


# Currently implementing
@views.route('/chats/<int:chat_id>', methods=['GET'])
@login_required
def chat(chat_id):
    if request.method == 'GET':
        # TODO: Check if there is an easier way to get the chat object (e.g. pass from another view)
        chat = db.session.scalar(select(Chat).where(Chat.id==chat_id))
        
        # TODO: Check how to handle a user being in the same room on multiple tabs (utilize instance count?)
        if chat.id not in chatrooms:
            chatrooms[chat.id] = {"online_users": []}

        session["chat"] = chat.id

        return render_template("chat.html", user=current_user, chat=chat)

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

# Implemented
@socketio.on('message')
@login_required
def message(data):

    # TODO: In case the server reboots and not all users have disconnected from a chat, the chatrooms dict does not track that chat
    chat = session.get("chat")
    sender = current_user.name
    content = data["data"]

    message = {
        "name": sender,
        "content": content
    } 

    # Send message to everyone in the chat (the sender has it printed locally at the same time )
    # TODO: Check if it's better to verify that the message was inserted to the DB successfully first?
    emit('message', message, to=chat, include_self=False)
    
    # Commit message to chat
    new_message = Message(chat_id = chat, sender_id = current_user.id, content = content)
    db.session.add(new_message)
    db.session.commit()

    print(f"{sender} said: {content}")

# Implemented
@socketio.on("connect")
def connect(auth):
    
    chatroom = session.get("chat")

    if not chatroom:
        return
    elif chatroom not in chatrooms:
        leave_room(chatroom)
        return

    join_room(chatroom)
    chatrooms[chatroom]["online_users"].append(current_user)
    print(f"{current_user.name} has connected to chatroom with ID {chatroom}")


# Implemented
@socketio.on("disconnect")
def disconnect():

    chatroom = session.get("chat")

    leave_room(chatroom)

    if chatroom in chatrooms:
        chatrooms[chatroom]["online_users"].remove(current_user)
        if len(chatrooms[chatroom]["online_users"]) <= 0:
            print(f"Chatroom with ID {chatroom} has no active users at the moment, deleting from memory (will still exist in DB, will be re-enter the memory once a user becomes active on it)")
            del chatrooms[chatroom]

    print(f"{current_user.name} has disconnected from chatroom with ID {chatroom}")