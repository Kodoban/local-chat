from flask_login import UserMixin

from . import db

MAX_USERNAME_LEN = 30
MAX_CONTENT_LEN = 1000
MAX_PASSWORD_LEN = 128
MAX_PROFILE_PICTURE_PATH_LEN = 255

# https://docs.sqlalchemy.org/en/14/orm/basic_relationships.html

user_chat_association = db.Table('user_chat_association',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'), primary_key=True),
    db.Column('chat_id', db.Integer, db.ForeignKey('chat.id'), primary_key=True)
)

class Message(db.Model):
    __tablename__ = "message"
    id = db.Column(db.Integer, primary_key=True) # Use autoincrement for now, fix later on with uuid or composite key (id, chat_id)
    chat_id = db.Column(db.Integer, db.ForeignKey('chat.id'))
    sender_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    content = db.Column(db.String(MAX_CONTENT_LEN))
    timestamp = db.Column(db.DateTime(timezone=True))
    is_sent = db.Column(db.Boolean, default=True, nullable=False)
    is_received = db.Column(db.Boolean, default=False, nullable=False)
    is_read = db.Column(db.Boolean, default=False, nullable=False)

    # Relationships
    chat = db.relationship('Chat', back_populates='messages')
    sender = db.relationship('User', back_populates='messages')
    

class Chat(db.Model):
    __tablename__ = "chat"
    id = db.Column(db.Integer, primary_key=True) # Use autoincrement for now, fix later on with uuid
    name = db.Column(db.String(MAX_USERNAME_LEN))
    # chat_pic
    # is_group = db.Column(db.Boolean, default=True, nullable=False) # Can this be inferred some other way?

    # Relationships
    users = db.relationship('User', secondary=user_chat_association, back_populates='chats')
    messages = db.relationship('Message', back_populates='chat')

class User(db.Model, UserMixin):
    __tablename__ = "user"
    id = db.Column(db.Integer, primary_key=True) # Use autoincrement for now, fix later on with uuid
    name = db.Column(db.String(MAX_USERNAME_LEN), unique=True, nullable=False)
    password = db.Column(db.String(MAX_PASSWORD_LEN), nullable=False)
    profile_picture = db.Column(db.String(MAX_PROFILE_PICTURE_PATH_LEN))

    # Relationships
    chats = db.relationship('Chat', secondary=user_chat_association, back_populates='users')
    messages = db.relationship('Message', back_populates='sender')

