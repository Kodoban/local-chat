from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_socketio import SocketIO
from sqlalchemy import select
from os import path
from datetime import datetime

db = SQLAlchemy()
DB_NAME = "database.db"
CLIENT_DIR = path.join(path.dirname(path.abspath(__file__)), '..', 'client')
TEMPLATES_DIR = path.join(CLIENT_DIR, "templates")
STATIC_DIR = path.join(CLIENT_DIR, 'static')

SERVER_DIR = path.dirname(path.abspath(__file__))
PROFILE_PIC_DIR = path.join(SERVER_DIR, "profile_pics")
# This assumes there exists a default profile picture for new users, and is placed in PROFILE_PIC_DIR
DEFAULT_PROFILE_PIC = "default.png"

app = Flask(__name__, template_folder=TEMPLATES_DIR, static_folder=STATIC_DIR)
app.config['SECRET_KEY'] = "change_later"
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{DB_NAME}'
socketio = SocketIO(app)

def create_app():
    db.init_app(app)

    from .views import views
    from .auth import auth

    app.register_blueprint(views, url_prefix='/')
    app.register_blueprint(auth, url_prefix='/')

    from .models import User

    with app.app_context():
        db.create_all()

    login_manager = LoginManager()
    login_manager.login_view = 'auth.login'
    login_manager.init_app(app)

    @login_manager.user_loader
    def load_user(id):
        return db.session.scalar(select(User).where(User.id==id))

    @app.template_filter()
    def convert_date_to_ISO8601(date):
        return datetime.isoformat(date)

    return socketio, app