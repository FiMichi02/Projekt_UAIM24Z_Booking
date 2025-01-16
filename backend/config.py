import os

class Config:
    """
    Podstawowa konfiguracja aplikacji.
    """
    SECRET_KEY = "bf81378boqswf9813fb8as129"  # Klucz tajny dla sesji
    JWT_SECRET_KEY = "bf3829gfqobufw13ibf9139o2"
    SQLALCHEMY_DATABASE_URI = "mysql+pymysql://uaimUser:uaimPassword@db:3306/hotel"    # URI bazy danych
    SQLALCHEMY_TRACK_MODIFICATIONS = True  # Wyłączenie ostrzeżenia o zmianach
    DEBUG = True  # Debug domyślnie wyłączony
    TESTING = True  # Tryb testowy domyślnie wyłączony
    JWT_TOKEN_LOCATION = ['cookies']  # JWT tylko w ciasteczkach
    JWT_COOKIE_SECURE = False         # Włącz HTTPS w środowisku produkcyjnym
    JWT_ACCESS_COOKIE_PATH = '/'      # Ścieżka dostępu do ciasteczka
    JWT_COOKIE_CSRF_PROTECT = False

