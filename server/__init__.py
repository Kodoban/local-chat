from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_socketio import SocketIO
from sqlalchemy import select
from os import path
from datetime import datetime

db = SQLAlchemy()
DB_NAME = "database.db"
CLIENT_DIR_PATH = path.join(path.dirname(path.abspath(__file__)), '..', 'client')
TEMPLATES_DIR_PATH = path.join(CLIENT_DIR_PATH, "templates")
STATIC_DIR_PATH = path.join(CLIENT_DIR_PATH, 'static')
app = Flask(__name__, template_folder=TEMPLATES_DIR_PATH, static_folder=STATIC_DIR_PATH)
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