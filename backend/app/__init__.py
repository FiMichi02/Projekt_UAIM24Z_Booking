from flask import Flask
from flask_migrate import Migrate
from app.routes import init_routes
from app.db import db
from flask_cors import CORS
from flask_jwt_extended import JWTManager
# Inicjalizacja rozszerzeń (globalna, ale bez przypisania do aplikacji)

migrate = Migrate()
jwt = JWTManager()

def create_app(config_class="config.Config"):
    """
    Funkcja fabryczna do tworzenia instancji aplikacji Flask.
    """
    # Tworzenie instancji aplikacji
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Inicjalizacja rozszerzeń z aplikacją
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(app, supports_credentials=True)
    init_routes(app)
    # Dodanie obsługi błędów (opcjonalnie)
    register_error_handlers(app)

    return app

def register_error_handlers(app):
    """Funkcja rejestrująca obsługę błędów."""
    @app.errorhandler(404)
    def not_found_error():
        return "404: Not Found", 404

    @app.errorhandler(500)
    def internal_error():
        db.session.rollback()  # Przywrócenie sesji w przypadku błędu bazy danych
        return "500: Internal Server Error", 500
